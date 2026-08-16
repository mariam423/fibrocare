import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `NEXT_DIST_DIR` lets the live-AI e2e server (playwright.live.config.ts)
  // run its own isolated build cache (e.g. `.next-live`) alongside the main
  // dev server, which Next refuses to share. Production/unset stays `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
