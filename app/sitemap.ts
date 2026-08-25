import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { geocodePlace, slugToPlaceQuery } from "@/lib/geocode";
import { countHikesNearby, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";

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
 * Ne garde que les villes qui ont réellement des randonnées.
 *
 * Cinq des six annoncées jusqu'ici rendaient une page vide : le catalogue est
 * concentré sur l'Île-de-France. Annoncer des pages creuses dans le plan du
 * site revient à demander leur indexation, ce qui coûte au domaine entier.
 * Elles réapparaîtront d'elles-mêmes quand la base couvrira leur région.
 */
async function citiesWithHikes(): Promise<string[]> {
  const checked = await Promise.all(
    FEATURED_CITIES.map(async (city) => {
      const place = await geocodePlace(slugToPlaceQuery(city));
      if (!place) return null;

      const count = await countHikesNearby({
        lat: place.lat,
        lng: place.lng,
        radiusKm: DEFAULT_HIKE_RADIUS_KM,
      });
      return count > 0 ? city : null;
    }),
  );

  return checked.filter((city): city is string => city !== null);
}

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
    "/mentions-legales",
    // Google vérifie que la page de suppression de compte est réellement
    // atteignable : autant qu'elle soit annoncée au même titre que les autres.
    "/suppression-compte",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const cityRoutes = (await citiesWithHikes()).map((city) => ({
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
