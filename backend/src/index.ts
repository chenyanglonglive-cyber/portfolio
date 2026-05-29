import type { Core } from '@strapi/strapi';

export default {
  register() {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
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
  },
};
