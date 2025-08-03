import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable server actions to prevent build hanging
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  productionBrowserSourceMaps: false,
  generateEtags: false,
};

export default nextConfig;
