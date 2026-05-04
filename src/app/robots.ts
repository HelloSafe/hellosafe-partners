import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't index gated areas, the partner dashboard, the admin or the
        // tracked-link redirect endpoint (which always 302s anyway).
        disallow: [
          "/api/",
          "/r/",
          "/fr/dashboard",
          "/en/dashboard",
          "/fr/admin",
          "/en/admin",
          "/fr/onboarding",
          "/en/onboarding",
          "/fr/signup/pending",
          "/en/signup/pending",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
