import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::visit-log.visit-log' as any, ({ strapi }: any) => ({
  async create(ctx: any) {
    const { data } = ctx.request.body;
    if (!data) {
      return ctx.badRequest('Missing data object in request body');
    }

    if (!data.visitorId || !data.path) {
      return ctx.badRequest('Missing visitorId or path in data');
    }

    // Extract client IP. Prefer forwarded headers because Strapi runs behind Nginx/Vercel proxies.
    let ip =
      ctx.headers['x-forwarded-for'] ||
      ctx.headers['x-real-ip'] ||
      ctx.ip ||
      ctx.socket?.remoteAddress ||
      '';
    if (Array.isArray(ip)) {
      ip = ip[0];
    }
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    const clientIp = ip || 'unknown';

    const userAgent = ctx.headers['user-agent'] || '';

    // Prepare log details
    const visitData = {
      visitorId: String(data.visitorId).slice(0, 80),
      path: String(data.path).slice(0, 255),
      videoId: data.videoId ? String(data.videoId).slice(0, 80) : null,
      videoTitle: data.videoTitle ? String(data.videoTitle).slice(0, 255) : null,
      ip: String(clientIp).slice(0, 80),
      userAgent: userAgent.slice(0, 500),
      timestamp: new Date().toISOString()
    };

    try {
      // Save log entry to Strapi DB
      const record = await strapi.documents('api::visit-log.visit-log').create({
        data: visitData,
        status: 'published'
      });

      return ctx.send({ data: record });
    } catch (err: any) {
      console.error('[Visit Log Create Error]', err);
      return ctx.badRequest(err.message || 'Internal server error');
    }
  }
}));
