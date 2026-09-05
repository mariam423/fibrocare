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
  // `@prisma/extension-accelerate` is an opt-in runtime dependency loaded
  // dynamically from `src/lib/prisma.ts` (only when PRISMA_ACCELERATE_URL is
  // set). It must not be bundled — Next 16's static analysis otherwise
  // fails the build on environments where the package is declared but not
  // resolvable through the bundler (e.g. monorepo / hoisted install).
  //
  // `@upstash/redis` and `@upstash/ratelimit` are loaded the same way
  // from `src/lib/upstash/client.ts`. `@upstash/redis` has a complex
  // `exports` field and `@upstash/ratelimit@2.0.8` is CJS-only with no
  // `module` field, so Turbopack fails the static `import` even when the
  // packages are installed. The runtime `createRequire` in the client
  // file is the primary fix; `serverExternalPackages` is the
  // belt-and-braces guarantee.
  serverExternalPackages: [
    "@prisma/extension-accelerate",
    "@upstash/redis",
    "@upstash/ratelimit",
  ],
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
