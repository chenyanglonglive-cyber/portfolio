import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/r2-assets/:path*',
        destination: 'https://pub-67563d2f929248aba2bd6abefbabe185.r2.dev/:path*',
      },
      {
        source: '/strapi-media/:path*',
        destination: 'https://dazzling-family-6d1f24102d.media.strapiapp.com/:path*',
      },
    ];
  },
};

export default nextConfig;
