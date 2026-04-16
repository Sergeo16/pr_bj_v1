const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone : Docker / Render. Sur Vercel, laisser le build par défaut (meilleure intégration serverless).
  ...(process.env.VERCEL === '1'
    ? {}
    : {
        output: 'standalone',
      }),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
}

module.exports = nextConfig

