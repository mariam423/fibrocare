import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

/**
 * Dynamic sitemap. The app serves both locales from the same URLs (locale is
 * a cookie preference, not a path segment), so each route is listed once with
 * en/ar language alternates for crawlers that understand the pairing.
 */
const PUBLIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.9, changeFrequency: "weekly" },
  { path: "/resources/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/resources/diagnosis", priority: 0.8, changeFrequency: "monthly" },
  { path: "/resources/treatment", priority: 0.8, changeFrequency: "monthly" },
  { path: "/resources/nutrition", priority: 0.7, changeFrequency: "monthly" },
  { path: "/resources/exercises", priority: 0.7, changeFrequency: "monthly" },
  { path: "/resources/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/resources/community", priority: 0.6, changeFrequency: "monthly" },
  { path: "/toolkit", priority: 0.7, changeFrequency: "monthly" },
  { path: "/zen", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((route) => {
    const url = `${SITE_URL}${route.path}`;
    return {
      url,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          en: url,
          ar: url,
          "x-default": url,
        },
      },
    };
  });
}
