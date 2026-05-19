/**
 * video router — core CRUD + custom compression endpoint
 */

import { factories } from '@strapi/strapi';

const raw: unknown = factories.createCoreRouter('api::video.video');

let coreRoutes: any[] = [];

if (typeof raw === 'function') {
  const r: any = raw();
  coreRoutes = Array.isArray(r) ? r : r?.routes ?? [];
} else if (Array.isArray(raw)) {
  coreRoutes = raw;
} else {
  coreRoutes = (raw as any)?.routes ?? [];
}

const compressRoute = {
  method: 'POST' as const,
  path: '/videos/compress',
  handler: 'video.compress',
  config: {
    auth: false,
  },
};

export default {
  routes: [...coreRoutes, compressRoute],
};
