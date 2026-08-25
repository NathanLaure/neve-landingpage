export type GeocodedPlace = {
  lat: number;
  lng: number;
  /** Clean display name for the resolved place, e.g. "Digne-les-Bains" */
  name: string;
};

/**
 * Resolves an arbitrary place name (city, town, village) to coordinates using
 * the Mapbox Geocoding API — the same Mapbox account already used for the map.
 * This is what lets /randos-sans-voiture/[city] work for any French place name,
 * not just a fixed hardcoded list.
 */
export async function geocodePlace(query: string): Promise<GeocodedPlace | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token || !query.trim()) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=fr&types=place,locality&limit=1&language=fr`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;

    const json = await res.json();
    const feature = json.features?.[0];
    if (!feature?.center) return null;

    const [lng, lat] = feature.center as [number, number];
    return { lat, lng, name: feature.text ?? query };
  } catch {
    return null;
  }
}

/** Turns a URL slug like "digne-les-bains" into a geocodable query "digne les bains". */
export function slugToPlaceQuery(slug: string): string {
  return slug.replace(/-/g, " ").trim();
}

/** Une proposition de lieu, avec son libellé complet pour lever les homonymes. */
export type PlaceSuggestion = GeocodedPlace & {
  /** « Chamonix-Mont-Blanc, Haute-Savoie, France » — deux Saint-Denis existent. */
  label: string;
};

/**
 * Propositions de lieux pour une saisie en cours.
 *
 * Distincte de `geocodePlace`, qui n'en rend qu'un et sert au rendu serveur des
 * pages de ville : ici on aide à écrire, et proposer un seul résultat sur trois
 * lettres tapées reviendrait à deviner à la place de l'utilisateur.
 *
 * `autocomplete=true` accepte les mots incomplets, et `signal` permet
 * d'abandonner la requête d'une frappe quand la suivante arrive — sans quoi les
 * réponses reviendraient dans le désordre et la liste clignoterait.
 */
export async function searchPlaces(
  query: string,
  { limit = 5, signal }: { limit?: number; signal?: AbortSignal } = {},
): Promise<PlaceSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token || query.trim().length < 2) return [];

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}&country=fr&types=place,locality&limit=${limit}&language=fr&autocomplete=true`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];

    const json = await res.json();
    return ((json.features ?? []) as MapboxFeature[])
      .filter((feature) => Array.isArray(feature.center))
      .map((feature) => ({
        lat: feature.center[1],
        lng: feature.center[0],
        name: feature.text ?? query,
        label: feature.place_name ?? feature.text ?? query,
      }));
  } catch {
    /* Un abandon volontaire passe aussi par ici : c'est une liste vide, pas une
       erreur à montrer. */
    return [];
  }
}

type MapboxFeature = {
  center: [number, number];
  text?: string;
  place_name?: string;
};
