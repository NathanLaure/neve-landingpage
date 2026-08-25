import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.neve-rando.fr";

/**
 * Villes annoncées d'emblée.
 *
 * Les pages de ville se rendent à la demande pour n'importe quelle commune :
 * les annoncer toutes voudrait dire lister trente-cinq mille URL dont la
 * plupart n'ont aucune randonnée à montrer. Celles-ci sont les six où le
 * catalogue est dense.
 */
const FEATURED_CITIES = ["paris", "lyon", "grenoble", "marseille", "bordeaux", "strasbourg"];

/**
 * Plan du site.
 *
 * Il porte désormais les fiches de randonnée, qui en étaient absentes : neuf
 * cent vingt-trois pages qu'aucun lien ne désignait et qu'aucun plan
 * n'annonçait n'avaient aucune raison d'être découvertes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/explorer",
    "/randos-sans-voiture",
    "/privacy",
    "/terms",
    // Google vérifie que la page de suppression de compte est réellement
    // atteignable : autant qu'elle soit annoncée au même titre que les autres.
    "/suppression-compte",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const cityRoutes = FEATURED_CITIES.map((city) => ({
    url: `${BASE_URL}/randos-sans-voiture/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  /* Les identifiants seuls : le plan n'a besoin de rien d'autre, et charger
     les colonnes de liste pour neuf cents lignes coûterait sans rien rendre. */
  const { data, error } = await supabase.from("hikes").select("id").limit(5000);

  const hikeRoutes = error
    ? []
    : ((data ?? []) as { id: string }[]).map((hike) => ({
        url: `${BASE_URL}/rando/${hike.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

  return [...staticRoutes, ...cityRoutes, ...hikeRoutes];
}
