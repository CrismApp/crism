import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude subgraph files from compilation
    config.module.rules.push({
      test: /src\/lib\/subgraph\/.*\.(ts|js)$/,
      use: 'ignore-loader'
    });
    
    return config;
  },
  // Exclude subgraph directory from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
