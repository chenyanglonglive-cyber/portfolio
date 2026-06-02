import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::project.project', ({ strapi }: any) => ({
  async importFolder(ctx: any) {
    const { id } = ctx.params; // project documentId
    const { folderId, type } = ctx.request.body;

    if (!folderId || !type) {
      return ctx.badRequest('Missing folderId or type in request body');
    }

    if (type !== 'video' && type !== 'image') {
      return ctx.badRequest('Type must be either video or image');
    }

    // 1. Verify Admin JWT
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
      return ctx.unauthorized('No authorization header');
    }

    try {
      const host = strapi.config.get('server.host', '127.0.0.1');
      const port = strapi.config.get('server.port', 1337);
      
      const adminMeResp = await fetch(`http://${host}:${port}/admin/users/me`, {
        headers: { Authorization: authHeader }
      });

      if (!adminMeResp.ok) {
        return ctx.unauthorized('Invalid Admin JWT token');
      }

      // 2. Fetch project
      const project = await strapi.documents('api::project.project').findOne({
        documentId: id
      });
      if (!project) {
        return ctx.notFound(`Project with documentId ${id} not found`);
      }

      // 3. Find all files in the given folder
      const files = await strapi.db.query('plugin::upload.file').findMany({
        where: {
          folder: folderId
        }
      });

      const fileIds = files.map((f: any) => f.id);
      if (fileIds.length === 0) {
        return ctx.send({ count: 0, message: 'No files found in this folder' });
      }

      let count = 0;
      if (type === 'video') {
        // Query videos where video file matches
        const videos = await strapi.db.query('api::video.video').findMany({
          populate: ['video'],
          where: {
            video: { id: { $in: fileIds } }
          }
        });

        for (const v of videos) {
          await strapi.documents('api::video.video').update({
            documentId: v.documentId,
            data: { project: id },
            status: 'published'
          });
          count++;
        }
      } else if (type === 'image') {
        // Query images where image file matches
        const images = await strapi.db.query('api::image.image').findMany({
          populate: ['image'],
          where: {
            image: { id: { $in: fileIds } }
          }
        });

        for (const img of images) {
          await strapi.documents('api::image.image').update({
            documentId: img.documentId,
            data: { project: id },
            status: 'published'
          });
          count++;
        }
      }

      return ctx.send({ count, message: `Successfully associated ${count} ${type} files to project` });
    } catch (err: any) {
      console.error('[Import Folder Error]', err);
      return ctx.badRequest(err.message || 'Internal server error');
    }
  }
}));
