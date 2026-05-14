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
        // Pointing to the new portfolio-assets-apac bucket
        destination: 'https://pub-67563d2f929248aba2bd6abefbabe185.r2.dev/:path*',
      },
    ];
  },
};

export default nextConfig;
