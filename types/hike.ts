export type HikeDifficulty = "facile" | "modere" | "difficile" | "expert";

export type HikeRouteType = "point_a_point" | "aller_retour" | "boucle";

export type HikeGeometry = {
  type: "LineString" | "MultiLineString";
  coordinates: number[][] | number[][][];
};

/**
 * Light shape used for the map pins and list cards.
 * Deliberately excludes `geometry` (full GPS trace) and `description`,
 * which are only fetched when a hike's detail is opened.
 */
export interface HikeSummary {
  id: string;
  title: string;
  distance_km: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  duration_minutes: number;
  difficulty: HikeDifficulty;
  start_lat: number;
  start_lng: number;
  location_name: string;
  cover_image_url: string | null;
  /** Absente des requetes de liste : 164 kB pour 923 lignes, que seule la fiche lit. */
  gallery_urls?: string[] | null;
  is_navigo_accessible?: boolean;
}

/** Full row, fetched on demand when a hike's detail view is opened. */
export interface HikeDetail extends HikeSummary {
  slug: string;
  description: string | null;
  route_type: HikeRouteType;
  geometry: HikeGeometry | null;
}
