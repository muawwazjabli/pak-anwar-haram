/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'C:\\Users\\jabli\\.gemini\\web_node_modules\\node_modules',
      ...(config.resolve.modules || ['node_modules'])
    ];
    return config;
  },
};

module.exports = nextConfig;
