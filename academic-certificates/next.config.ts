import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones de producción
  reactStrictMode: true,

  // Optimización de imágenes y videos
  experimental: {
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },

  // Compresión
  compress: true,

  // Headers de caché para recursos estáticos
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/img/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  }, webpack: (config, { isServer }) => {
    // Desactivar webpack optimizaciones que pueden causar problemas con Stacks.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimización de bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Separar framer-motion en su propio chunk
          framerMotion: {
            name: 'framer-motion',
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            priority: 40,
            reuseExistingChunk: true,
          },
          // Vendor chunk para otras librerías
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
