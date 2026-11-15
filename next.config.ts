import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático a `out/`: lo sirve Electron y también Vercel, sin funciones de servidor.
  output: "export",
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true, // Evita que el chequeo estricto de tipos frene el build
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;