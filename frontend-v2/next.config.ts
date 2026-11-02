import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{
      source: '/cover-media/:file(cover_[a-zA-Z0-9_-]+\\.(?:jpg|jpeg|png|webp))',
      destination: 'https://strapi.wcyblog.space/uploads/:file',
    }];
  },
  async headers() {
    return [{
      source: '/cover-media/:file(cover_[a-zA-Z0-9_-]+\\.(?:jpg|jpeg|png|webp))',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400' },
        { key: 'Vercel-CDN-Cache-Control', value: 'public, s-maxage=2592000, stale-while-revalidate=86400' },
      ],
    }];
  },
  images: {
    minimumCacheTTL: 86400,
    formats: ['image/webp'],
    deviceSizes: [480, 640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.wcyblog.space',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
