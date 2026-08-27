import type { NextConfig } from "next";

/**
 * Strict security headers, applied to every route.
 *
 * CSP notes:
 *  - `script-src 'self' 'unsafe-inline'` — Next.js injects the hydration
 *    inline script; nonce-based CSP would require middleware rewriting of
 *    every response, so inline scripts are allowed but only from self.
 *    `unsafe-eval` is added in development only (HMR).
 *  - `frame-src` allows exactly the two video embed hosts the somatic
 *    toolkit uses (YouTube nocookie + Vimeo); everything else is blocked.
 *  - `frame-ancestors 'none'` + X-Frame-Options DENY — no clickjacking.
 *  - `connect-src 'self'` — the browser never talks to an AI/weather API
 *    directly; all of that is proxied server-side.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // `NEXT_DIST_DIR` lets the live-AI e2e server (playwright.live.config.ts)
  // run its own isolated build cache (e.g., `.next-live`) alongside the main
  // dev server, which Next refuses to share. Production/unset stays `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Standalone output for Docker/Azure deployment — copies only the files
  // needed to run the app, reducing image size significantly.
  output: "standalone",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
