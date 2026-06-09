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

    // 重新组合布局列展示顺序为 ['cover', 'video', 'Rank']
    const requiredCols = ['cover', 'video', 'Rank'];
    const currentList = config.layouts?.list || [];
    let updatedList = [...currentList];

    for (const col of requiredCols) {
      if (!updatedList.includes(col)) {
        updatedList.push(col);
      }
    }

    const filteredList = updatedList.filter(col => !requiredCols.includes(col));
    updatedList = [...requiredCols, ...filteredList];

    if (JSON.stringify(currentList) !== JSON.stringify(updatedList)) {
      config.layouts.list = updatedList;
      changed = true;
    }

    if (changed) {
      await contentTypeService.updateConfiguration('api::fea-video.fea-video', config);
      console.log('[Config] Updated api::fea-video.fea-video configuration with cover/rank layout.');
    }
  } catch (err: any) {
    console.error('[Config] Failed to configure api::fea-video.fea-video:', err.message);
  }

  // 3. 配置 api::visit-log.visit-log
  try {
    const config = await contentTypeService.findConfiguration('api::visit-log.visit-log');
    let changed = false;
    const requiredCols = ['timestamp', 'ip', 'path', 'videoTitle', 'visitorId'];
    const currentList = config.layouts?.list || [];
    const remainingCols = currentList.filter((col: string) => !requiredCols.includes(col));
    const updatedList = [...requiredCols, ...remainingCols];

    if (config.settings.defaultSortBy !== 'timestamp') {
      config.settings.defaultSortBy = 'timestamp';
      changed = true;
    }
    if (config.settings.defaultSortOrder !== 'DESC') {
      config.settings.defaultSortOrder = 'DESC';
      changed = true;
    }
    if (JSON.stringify(currentList) !== JSON.stringify(updatedList)) {
      config.layouts.list = updatedList;
      changed = true;
    }

    if (changed) {
      await contentTypeService.updateConfiguration('api::visit-log.visit-log', config);
      console.log('[Config] Updated api::visit-log.visit-log list layout.');
    }
  } catch (err: any) {
    console.error('[Config] Failed to configure api::visit-log.visit-log:', err.message);
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
      'api::fea-video.fea-video.findOne',
      'api::visit-log.visit-log.create'
    ]);

    // 自动确保 Content Manager 配置
    await ensureContentManagerConfigs(strapi);

    // 自动回填精选视频数据
    await backfillFeaturedVideos(strapi);
  },
};

async function backfillFeaturedVideos(strapi: Core.Strapi) {
  try {
    // 1. 获取所有的 fea-video 记录（使用 db.query 确保获取到所有草稿和发布记录）
    const allDbFeas = await strapi.db.query('api::fea-video.fea-video').findMany({
      populate: ['video']
    });

    // 2. 清理没有关联视频（或视频已被删除）的孤儿记录
    const orphanDocIds = new Set<string>();
    for (const item of allDbFeas) {
      if (!item.video || !item.video.id) {
        orphanDocIds.add(item.documentId);
      }
    }
    if (orphanDocIds.size > 0) {
      console.log(`[Backfill] Found ${orphanDocIds.size} orphan fea-video entries. Cleaning up…`);
      for (const docId of orphanDocIds) {
        await strapi.documents('api::fea-video.fea-video').delete({
          documentId: docId
        });
        console.log(`[Backfill] Cleaned orphan fea-video (DocID: ${docId})`);
      }
    }

    // 3. 清理重复的 fea-video 记录（同一个视频被分配了多个不同的 fea-video documentId）
    // 重新获取最新的有效记录
    const activeDbFeas = await strapi.db.query('api::fea-video.fea-video').findMany({
      populate: ['video']
    });

    const videoToFeaDocs = new Map<string, Set<string>>(); // videoDocId -> Set of feaVideoDocIds
    const feaDocToMaxId = new Map<string, number>(); // feaVideoDocId -> max database id
    const feaDocToPublished = new Map<string, boolean>(); // feaVideoDocId -> isPublished

    for (const fea of activeDbFeas) {
      if (fea.video && fea.video.documentId) {
        const vDocId = fea.video.documentId;
        if (!videoToFeaDocs.has(vDocId)) {
          videoToFeaDocs.set(vDocId, new Set());
        }
        videoToFeaDocs.get(vDocId)!.add(fea.documentId);

        const currentMaxId = feaDocToMaxId.get(fea.documentId) || 0;
        if (fea.id > currentMaxId) {
          feaDocToMaxId.set(fea.documentId, fea.id);
        }

        if (fea.publishedAt) {
          feaDocToPublished.set(fea.documentId, true);
        }
      }
    }

    for (const [vDocId, feaDocs] of videoToFeaDocs.entries()) {
      if (feaDocs.size > 1) {
        console.log(`[Backfill] Found duplicates for Video DocID: ${vDocId}. fea-video documentIds:`, Array.from(feaDocs));
        
        // 排序规则：已发布优先，其次是数据库 ID 更大（更新创建）的优先
        const sortedDocs = Array.from(feaDocs).sort((a, b) => {
          const pubA = feaDocToPublished.get(a) ? 1 : 0;
          const pubB = feaDocToPublished.get(b) ? 1 : 0;
          if (pubA !== pubB) {
            return pubB - pubA;
          }
          const idA = feaDocToMaxId.get(a) || 0;
          const idB = feaDocToMaxId.get(b) || 0;
          return idB - idA;
        });

        const keepDocId = sortedDocs[0];
        const deleteDocIds = sortedDocs.slice(1);

        console.log(`[Backfill] Keeping fea-video DocID: ${keepDocId}, deleting duplicate DocIDs:`, deleteDocIds);
        for (const delDocId of deleteDocIds) {
          await strapi.documents('api::fea-video.fea-video').delete({
            documentId: delDocId
          });
          console.log(`[Backfill] Deleted duplicate fea-video document: ${delDocId}`);
        }
      }
    }

    // 4. 正常进行视频回填
    const featuredVideos = await strapi.documents('api::video.video').findMany({
      filters: { IsFeatured: true },
      populate: ['cover']
    });

    if (featuredVideos.length === 0) {
      console.log('[Backfill] No featured videos found in api::video.video.');
      return;
    }

    console.log(`[Backfill] Found ${featuredVideos.length} featured videos. Ensuring they exist in fea-video…`);

    for (const v of featuredVideos) {
      // 分别在草稿和发布版本中查询，避免漏掉导致重复创建
      let existing = await strapi.documents('api::fea-video.fea-video').findFirst({
        status: 'draft',
        filters: {
          video: {
            documentId: v.documentId
          }
        },
        populate: ['cover']
      });

      if (!existing) {
        existing = await strapi.documents('api::fea-video.fea-video').findFirst({
          status: 'published',
          filters: {
            video: {
              documentId: v.documentId
            }
          },
          populate: ['cover']
        });
      }

      if (!existing) {
        const entry = await strapi.documents('api::fea-video.fea-video').create({
          data: {
            Rank: Number(v.Rank) || 0,
            video: v.documentId,
            cover: v.cover ? v.cover.id : null
          },
          status: v.publishedAt ? 'published' : 'draft'
        });
        console.log(`[Backfill] Created fea-video for Video "${v.Title}" (DocID: ${v.documentId}) with Rank: ${v.Rank}`);
      } else {
        // 如果精选记录已存在但缺乏封面关联，温和补全，不破坏原有的排序 Rank
        if (!existing.cover && v.cover) {
          await strapi.documents('api::fea-video.fea-video').update({
            documentId: existing.documentId,
            data: {
              cover: v.cover.id
            }
          });
          console.log(`[Backfill] Repopulated cover for existing fea-video of "${v.Title}"`);
        }
      }
    }
    console.log('[Backfill] Featured videos backfill check completed.');
  } catch (err: any) {
    console.error('[Backfill] Failed to backfill featured videos:', err.message);
  }
}
