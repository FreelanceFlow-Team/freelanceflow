import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  transpilePackages: ['@freelanceflow/types'],
};

export default nextConfig;
