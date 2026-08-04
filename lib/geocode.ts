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
