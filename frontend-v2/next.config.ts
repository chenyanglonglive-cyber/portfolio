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
        source: '/strapi-media/:path*',
        destination: 'https://dazzling-family-6d1f24102d.media.strapiapp.com/:path*',
      },
    ];
  },
};

export default nextConfig;
