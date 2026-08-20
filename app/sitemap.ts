import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://neve-rando.fr";

  // Static routes
  const routes = [
    "",
    "/randos-sans-voiture",
    "/privacy",
    "/terms",
    // Google vérifie que la page de suppression de compte est réellement
    // atteignable : autant qu'elle soit annoncée au même titre que les autres.
    "/suppression-compte",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic city routes
  const cities = ["paris", "lyon", "grenoble", "marseille", "bordeaux", "strasbourg"];
  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/randos-sans-voiture/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...routes, ...cityRoutes];
}
