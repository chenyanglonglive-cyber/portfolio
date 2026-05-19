import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 3600, // 增加缓存时间，减少重复压缩
    formats: ['image/webp'], // 强制优先使用 webp
    deviceSizes: [640, 750, 828, 1080, 1200], // 限制尺寸范围，减少处理压力
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.wcyblog.space',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '47.95.242.40',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/strapi-media/:path*',
        destination: 'http://47.95.242.40/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
