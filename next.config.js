const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Retrait de output: 'standalone' pour éviter les problèmes avec les fichiers statiques sur Render
  // next start gère automatiquement tous les fichiers CSS et assets
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
}

module.exports = nextConfig

