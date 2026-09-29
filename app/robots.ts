import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] }],
    sitemap: "https://educantay.cl/sitemap.xml",
    host: "https://educantay.cl",
  };
}
