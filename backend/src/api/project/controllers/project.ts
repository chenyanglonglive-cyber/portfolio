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
      let targetFiles = [];
      if (type === 'video') {
        targetFiles = files.filter((f: any) => f.mime && f.mime.startsWith('video/'));
      } else {
        targetFiles = files.filter((f: any) => f.mime && f.mime.startsWith('image/'));
      }

      if (targetFiles.length === 0) {
        return ctx.send({ count: 0, message: `No ${type} files found in this folder` });
      }

      let count = 0;
      if (type === 'video') {
        for (const f of targetFiles) {
          // Check if a Video entry already exists for this file
          const existing = await strapi.db.query('api::video.video').findOne({
            populate: ['video'],
            where: {
              video: f.id
            }
          });

          if (existing) {
            // Update and publish existing video's relation
            await strapi.documents('api::video.video').update({
              documentId: existing.documentId,
              data: { project: id }
            });
            await strapi.documents('api::video.video').publish({
              documentId: existing.documentId
            });
          } else {
            // Create a new Video entry
            const cleanTitle = f.name
              .replace(/^✅\s*/, '') // Remove used emoji prefix if present
              .replace(/\.[^/.]+$/, ''); // Strip file extension
            
            await strapi.documents('api::video.video').create({
              data: {
                Title: cleanTitle,
                video: f.id,
                project: id
              },
              status: 'published'
            });
          }
          count++;
        }
      } else if (type === 'image') {
        for (const f of targetFiles) {
          // Check if an Image entry already exists for this file
          const existing = await strapi.db.query('api::image.image').findOne({
            populate: ['image'],
            where: {
              image: f.id
            }
          });

          if (existing) {
            // Update and publish existing image's relation
            await strapi.documents('api::image.image').update({
              documentId: existing.documentId,
              data: { project: id }
            });
            await strapi.documents('api::image.image').publish({
              documentId: existing.documentId
            });
          } else {
            // Create a new Image entry
            const cleanTitle = f.name.replace(/\.[^/.]+$/, ''); // Strip file extension
            
            await strapi.documents('api::image.image').create({
              data: {
                Title: cleanTitle,
                image: f.id,
                project: id
              },
              status: 'published'
            });
          }
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
