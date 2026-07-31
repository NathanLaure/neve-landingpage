import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/reset-password", "/signin", "/signup"],
    },
    sitemap: "https://neve-rando.fr/sitemap.xml",
  };
}
