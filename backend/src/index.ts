import type { Core } from '@strapi/strapi';
import crypto from 'crypto';

async function grantPublicPermissions(strapi: Core.Strapi, actions: string[]) {
  try {
    const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
      where: { type: { $in: ['authenticated', 'public'] } }
    });

    for (const action of actions) {
      for (const role of roles) {
        const permission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: { action, role: role.id }
        });

        if (!permission) {
          const documentId = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              documentId,
              role: role.id
            }
          });
          console.log(`[Permission] Created action ${action} for role ${role.type}`);
        }
      }
    }
    console.log(`[Permission] Successfully ensured permissions for: ${actions.join(', ')}`);
  } catch (err: any) {
    console.error('[Permission] Failed to grant public permissions:', err.message);
  }
}

async function ensureContentManagerConfigs(strapi: Core.Strapi) {
  const contentTypeService = (strapi.plugin('content-manager') as any).service('content-types');
  if (!contentTypeService) {
    console.warn('[Config] Content manager content-types service not found.');
    return;
  }

  // 1. 配置 api::video.video
  try {
    const config = await contentTypeService.findConfiguration('api::video.video');
    let changed = false;
    if (config.settings.defaultSortBy !== 'Rank') {
      config.settings.defaultSortBy = 'Rank';
      changed = true;
    }
    if (config.settings.defaultSortOrder !== 'DESC') {
      config.settings.defaultSortOrder = 'DESC';
      changed = true;
    }
    if (config.layouts && config.layouts.list && !config.layouts.list.includes('Rank')) {
      config.layouts.list.splice(2, 0, 'Rank');
      changed = true;
    }
    if (changed) {
      await contentTypeService.updateConfiguration('api::video.video', config);
      console.log('[Config] Updated api::video.video configuration.');
    }
  } catch (err: any) {
    console.error('[Config] Failed to configure api::video.video:', err.message);
  }

  // 2. 配置 api::fea-video.fea-video
  try {
    const config = await contentTypeService.findConfiguration('api::fea-video.fea-video');
    let changed = false;
    if (config.settings.defaultSortBy !== 'Rank') {
      config.settings.defaultSortBy = 'Rank';
      changed = true;
    }
    if (config.settings.defaultSortOrder !== 'DESC') {
      config.settings.defaultSortOrder = 'DESC';
      changed = true;
    }
    if (config.layouts && config.layouts.list && !config.layouts.list.includes('Rank')) {
      config.layouts.list.splice(2, 0, 'Rank');
      changed = true;
    }
    if (config.layouts && config.layouts.list && !config.layouts.list.includes('video')) {
      config.layouts.list.splice(1, 0, 'video');
      changed = true;
    }
    if (changed) {
      await contentTypeService.updateConfiguration('api::fea-video.fea-video', config);
      console.log('[Config] Updated api::fea-video.fea-video configuration.');
    }
  } catch (err: any) {
    console.error('[Config] Failed to configure api::fea-video.fea-video:', err.message);
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 媒体文件生命周期订阅
    strapi.db.lifecycles.subscribe({
      models: ["plugin::upload.file"],
      async afterCreate(event: any) {
        const { result } = event;
        const name = result?.name || '';
        if (name.startsWith('cover_') || name.startsWith('auto-cover')) {
          try {
            const folderService = (strapi.plugins.upload.services as any).folder;
            let folder = await strapi.db.query('plugin::upload.folder').findOne({
              where: { name: 'cover' }
            });
            if (!folder) {
              folder = await folderService.create({ name: 'cover' });
            }
            if (result?.id && folder?.id) {
              await strapi.db.query('plugin::upload.file').update({
                where: { id: result.id },
                data: { folder: folder.id }
              });
              console.log(`[Lifecycle] Moved auto-cover ${result.name} (ID: ${result.id}) to 'cover' folder (ID: ${folder.id})`);
            }
          } catch (err: any) {
            console.error('[Lifecycle] Failed to move cover to folder:', err.message);
          }
        }
      }
    });

    // 自动授予 API 访问权限
    await grantPublicPermissions(strapi, [
      'api::fea-video.fea-video.find',
      'api::fea-video.fea-video.findOne'
    ]);

    // 自动确保 Content Manager 配置
    await ensureContentManagerConfigs(strapi);

    // 自动回填精选视频数据
    await backfillFeaturedVideos(strapi);
  },
};

async function backfillFeaturedVideos(strapi: Core.Strapi) {
  try {
    const featuredVideos = await strapi.documents('api::video.video').findMany({
      filters: { IsFeatured: true }
    });

    if (featuredVideos.length === 0) {
      console.log('[Backfill] No featured videos found in api::video.video.');
      return;
    }

    console.log(`[Backfill] Found ${featuredVideos.length} featured videos. Ensuring they exist in fea-video…`);

    for (const v of featuredVideos) {
      const existing = await strapi.documents('api::fea-video.fea-video').findFirst({
        filters: {
          video: {
            documentId: v.documentId
          }
        }
      });

      if (!existing) {
        const entry = await strapi.documents('api::fea-video.fea-video').create({
          data: {
            Rank: Number(v.Rank) || 0,
            video: v.documentId
          },
          status: v.publishedAt ? 'published' : 'draft'
        });
        console.log(`[Backfill] Created fea-video for Video "${v.Title}" (DocID: ${v.documentId}) with Rank: ${v.Rank}`);
      }
    }
    console.log('[Backfill] Featured videos backfill check completed.');
  } catch (err: any) {
    console.error('[Backfill] Failed to backfill featured videos:', err.message);
  }
}
