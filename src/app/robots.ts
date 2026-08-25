import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

/**
 * robots.txt: allow public marketing + resource content, disallow the
 * authenticated app area and private data routes (dashboard, logs, reports,
 * profile, auth flows, API endpoints).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/health-logs",
          "/reports",
          "/profile",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/vt-test",
          "/offline",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
