import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
