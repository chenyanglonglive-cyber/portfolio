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

    // Extract IP
    let ip = ctx.ip || ctx.headers['x-forwarded-for'] || ctx.socket?.remoteAddress || '';
    if (Array.isArray(ip)) {
      ip = ip[0];
    }
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Mask IP address for privacy
    let maskedIp = 'unknown';
    if (ip) {
      if (ip.includes('.')) {
        // IPv4 (e.g., 112.97.234.45 -> 112.97.234.xxx)
        const parts = ip.split('.');
        if (parts.length === 4) {
          maskedIp = `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
        } else {
          maskedIp = ip;
        }
      } else if (ip.includes(':')) {
        // IPv6 (e.g., fe80::1ff:fe23:4567:890a -> fe80::1ff:xxxx)
        const parts = ip.split(':');
        if (parts.length > 2) {
          maskedIp = `${parts.slice(0, Math.min(parts.length - 2, 4)).join(':')}:xxxx`;
        } else {
          maskedIp = ip;
        }
      } else {
        maskedIp = ip;
      }
    }

    const userAgent = ctx.headers['user-agent'] || '';

    // Prepare log details
    const visitData = {
      visitorId: String(data.visitorId).slice(0, 80),
      path: String(data.path).slice(0, 255),
      videoId: data.videoId ? String(data.videoId).slice(0, 80) : null,
      videoTitle: data.videoTitle ? String(data.videoTitle).slice(0, 255) : null,
      ip: maskedIp.slice(0, 80),
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
