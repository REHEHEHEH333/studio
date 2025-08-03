import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
<<<<<<< HEAD
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
=======
    unoptimized: true, // Required for static exports
  },
  // Add other configurations as needed
>>>>>>> a783f691f37c9da0d871b12baa6655b48d128703
};

export default nextConfig;
