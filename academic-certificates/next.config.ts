import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Desactivar webpack optimizaciones que pueden causar problemas con Stacks.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
