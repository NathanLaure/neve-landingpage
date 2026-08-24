import type { HikeDifficulty, HikeRouteType, HikeSummary } from "@/types/hike";

/**
 * Modèle de filtres de l'explorateur, partagé par la page — un composant
 * serveur —, la barre de chips et la modale.
 *
 * Il vit ici et non dans `map-filters.tsx` : une valeur importée depuis un
 * module `"use client"` vers un composant serveur n'arrive pas telle quelle,
 * c'est une référence de module.
 *
 * Les chips et la modale écrivent dans le **même** objet. La maquette montre la
 * difficulté aux deux endroits, ce qui n'a de sens que si les deux disent la
 * même chose : le chip est un raccourci vers la modale, pas un filtre parallèle.
 */

/** Rayons proposés par le chip, en kilomètres. */
export const RADIUS_OPTIONS = [5, 10, 20, 30, 50, 100, 200, 500] as const;

export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

/**
 * Rayon demandé par l'adresse, ou `null` pour « depuis le marqueur ».
 *
 * `null` n'est pas une absence de réglage mais un réglage à part entière : on
 * garde le centre pour la carte et on cesse de borner la recherche. C'est le
 * premier choix de la liste, et le seul qui ne cache rien.
 *
 * Les autres valeurs sont ramenées à celles du chip : une adresse se forge à la
 * main, et `?radius=5000` ferait charger sans limite sous couvert d'un rayon.
 */
export function parseRadius(raw: string | undefined): number | null {
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return (RADIUS_OPTIONS as readonly number[]).includes(value) ? value : null;
}

/** Bornes des curseurs. Au-delà du maximum, la borne haute cesse de filtrer. */
export const DISTANCE_BOUNDS: [number, number] = [0, 40];
export const ELEVATION_BOUNDS: [number, number] = [0, 2000];
export const DURATION_BOUNDS: [number, number] = [0, 480];

export type Zone = "all" | "idf";

export interface ExplorerFilters {
  /** Vide = toutes. La maquette coche plusieurs difficultés à la fois. */
  difficulties: HikeDifficulty[];
  distanceKm: [number, number];
  durationMin: [number, number];
  elevationM: [number, number];
  /** Vide = tous. */
  routeTypes: HikeRouteType[];
  zone: Zone;
  /** Départ desservi par une gare, la seule donnée de transport en base. */
  transitOnly: boolean;
}

export const EMPTY_FILTERS: ExplorerFilters = {
  difficulties: [],
  distanceKm: [...DISTANCE_BOUNDS] as [number, number],
  durationMin: [...DURATION_BOUNDS] as [number, number],
  elevationM: [...ELEVATION_BOUNDS] as [number, number],
  routeTypes: [],
  zone: "all",
  transitOnly: false,
};

export const DIFFICULTY_LABELS: { value: HikeDifficulty; label: string }[] = [
  { value: "facile", label: "Facile" },
  { value: "modere", label: "Modéré" },
  { value: "difficile", label: "Difficile" },
];

export const ROUTE_TYPE_LABELS: { value: HikeRouteType; label: string }[] = [
  { value: "point_a_point", label: "Point A → point B" },
  { value: "aller_retour", label: "Aller-retour" },
  { value: "boucle", label: "Boucle" },
];

/** Rectangle de la zone Navigo, le même que `lib/navigo.ts`. */
const IDF_BOUNDS = { minLat: 48.12, maxLat: 49.24, minLng: 1.44, maxLng: 3.56 };

function isFullRange(range: [number, number], bounds: [number, number]): boolean {
  return range[0] <= bounds[0] && range[1] >= bounds[1];
}

/**
 * Nombre de filtres actifs, pour le badge du chip « Filtres ».
 *
 * Une plage complète ne compte pas : elle ne retire rien, l'annoncer comme un
 * filtre actif ferait chercher au randonneur ce qu'il aurait bien pu régler.
 */
export function countActiveFilters(filters: ExplorerFilters): number {
  let count = 0;
  if (filters.difficulties.length > 0) count += 1;
  if (!isFullRange(filters.distanceKm, DISTANCE_BOUNDS)) count += 1;
  if (!isFullRange(filters.durationMin, DURATION_BOUNDS)) count += 1;
  if (!isFullRange(filters.elevationM, ELEVATION_BOUNDS)) count += 1;
  if (filters.routeTypes.length > 0) count += 1;
  if (filters.zone !== "all") count += 1;
  if (filters.transitOnly) count += 1;
  return count;
}

export function matchesFilters(hike: HikeSummary, filters: ExplorerFilters): boolean {
  if (filters.difficulties.length > 0) {
    /* « Difficile » englobe « expert » : la nuance n'a pas de sens pour qui
       cherche simplement à savoir si la sortie sera dure. */
    const matches = filters.difficulties.some((level) =>
      level === "difficile"
        ? hike.difficulty === "difficile" || hike.difficulty === "expert"
        : hike.difficulty === level,
    );
    if (!matches) return false;
  }

  const [minDistance, maxDistance] = filters.distanceKm;
  if (hike.distance_km < minDistance) return false;
  if (maxDistance < DISTANCE_BOUNDS[1] && hike.distance_km > maxDistance) return false;

  const [minDuration, maxDuration] = filters.durationMin;
  if (hike.duration_minutes < minDuration) return false;
  if (maxDuration < DURATION_BOUNDS[1] && hike.duration_minutes > maxDuration) return false;

  const [minElevation, maxElevation] = filters.elevationM;
  if (hike.elevation_gain_m < minElevation) return false;
  if (maxElevation < ELEVATION_BOUNDS[1] && hike.elevation_gain_m > maxElevation) return false;

  if (filters.routeTypes.length > 0) {
    const routeType = (hike as { route_type?: HikeRouteType }).route_type;
    if (!routeType || !filters.routeTypes.includes(routeType)) return false;
  }

  if (filters.zone === "idf") {
    const inside =
      hike.start_lat >= IDF_BOUNDS.minLat &&
      hike.start_lat <= IDF_BOUNDS.maxLat &&
      hike.start_lng >= IDF_BOUNDS.minLng &&
      hike.start_lng <= IDF_BOUNDS.maxLng;
    if (!inside) return false;
  }

  if (filters.transitOnly) {
    const station = (hike as { start_station_name?: string | null }).start_station_name;
    if (!station) return false;
  }

  return true;
}
