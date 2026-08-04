import { supabase } from "./supabase";
import type { HikeDetail, HikeSummary } from "@/types/hike";

/** Default search radius for a "randos autour de [lieu]" page. */
export const DEFAULT_HIKE_RADIUS_KM = 35;

// Columns needed to render map pins and list cards. Deliberately excludes
// `geometry` (full GPS trace, potentially thousands of points) and
// `description`, which are only fetched via getHikeById() when a hike's
// detail view is opened.
const LIST_COLUMNS =
  "id, title, distance_km, elevation_gain_m, elevation_loss_m, duration_minutes, difficulty, start_lat, start_lng, location_name, cover_image_url, gallery_urls";

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export type HikesNearbyResult = {
  hikes: HikeSummary[];
  error: string | null;
};

/**
 * Fetches the light hike columns near a given point, ordered by distance.
 * Pre-filters with a lat/lng bounding box in SQL, then applies an exact
 * haversine distance filter/sort in JS (the table has no PostGIS column).
 */
export async function getHikesNearby({
  lat,
  lng,
  radiusKm,
  limit = 40,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
  limit?: number;
}): Promise<HikesNearbyResult> {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from("hikes")
    .select(LIST_COLUMNS)
    .gte("start_lat", lat - latDelta)
    .lte("start_lat", lat + latDelta)
    .gte("start_lng", lng - lngDelta)
    .lte("start_lng", lng + lngDelta);

  if (error) {
    return { hikes: [], error: error.message };
  }

  const hikes = ((data ?? []) as unknown as HikeSummary[])
    .map((hike) => ({ hike, distance: haversineDistanceKm(lat, lng, hike.start_lat, hike.start_lng) }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ hike }) => hike);

  return { hikes, error: null };
}

/** All hikes (light columns), used by the Explorer page when no location is given. */
export async function getAllHikes({ limit = 500 }: { limit?: number } = {}): Promise<HikesNearbyResult> {
  const { data, error } = await supabase.from("hikes").select(LIST_COLUMNS).limit(limit);

  if (error) {
    return { hikes: [], error: error.message };
  }

  return { hikes: (data ?? []) as unknown as HikeSummary[], error: null };
}

/** Lightweight count (no images/description) used for hub cards ("N itinéraires"). */
export async function countHikesNearby({
  lat,
  lng,
  radiusKm,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
}): Promise<number> {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from("hikes")
    .select("start_lat, start_lng")
    .gte("start_lat", lat - latDelta)
    .lte("start_lat", lat + latDelta)
    .gte("start_lng", lng - lngDelta)
    .lte("start_lng", lng + lngDelta);

  if (error || !data) return 0;

  return (data as unknown as { start_lat: number; start_lng: number }[]).filter(
    (row) => haversineDistanceKm(lat, lng, row.start_lat, row.start_lng) <= radiusKm
  ).length;
}

export type HikeDetailResult = {
  hike: HikeDetail | null;
  error: string | null;
};

/** Full row (includes `geometry` and `description`), fetched when a hike's detail view opens. */
export async function getHikeById(id: string): Promise<HikeDetailResult> {
  const { data, error } = await supabase.from("hikes").select("*").eq("id", id).single();

  if (error) {
    return { hike: null, error: error.message };
  }

  return { hike: data as unknown as HikeDetail, error: null };
}
