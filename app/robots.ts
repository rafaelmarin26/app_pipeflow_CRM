import type { MetadataRoute } from "next";

/**
 * PLAN.md M17: "robots.txt bloqueando a área autenticada". The middleware
 * already redirects a crawler with no session to `/login`, but that still
 * lets the protected paths themselves get indexed as redirect targets —
 * disallowing them here keeps search engines from listing app screens at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/leads",
        "/pipeline",
        "/settings",
        "/onboarding",
        "/convite",
      ],
    },
  };
}
