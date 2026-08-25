import type { HikeSummary } from "@/types/hike";
import { isInNavigoZone } from "@/lib/navigo";

/**
 * Ce qu'on peut affirmer d'un lot de randonnées, chiffres à l'appui.
 *
 * Tout se calcule sur les lignes réellement chargées : aucune estimation,
 * aucun arrondi flatteur. C'est ce qui permet à la page d'énoncer des faits
 * vérifiables plutôt que des tournures — un moteur génératif cite un nombre,
 * pas une promesse.
 */
export type CityStats = {
  count: number;
  /** Kilomètres du plus court au plus long, arrondis au dixième. */
  distanceRange: [number, number];
  /**
   * Bande où tombent quatre-vingts pour cent des itinéraires.
   *
   * L'écart complet mélange une boucle de village et une portion de GR : dire
   * « de 0,5 à 147 km » est exact et n'apprend rien. Les déciles décrivent ce
   * qu'on trouve vraiment, ce qui est la question posée.
   */
  typicalDistance: [number, number];
  /** Minutes de la plus courte à la plus longue. */
  durationRange: [number, number];
  /** Dénivelé positif maximal rencontré, en mètres. */
  maxElevation: number;
  /** Combien de chaque difficulté, dans l'ordre du plus facile au plus dur. */
  byDifficulty: { label: string; value: string; count: number }[];
  /** Combien tombent dans la zone couverte par un pass Navigo. */
  navigoCount: number;
  /** Communes de départ les plus représentées, au plus cinq. */
  topPlaces: { name: string; count: number }[];
};

const DIFFICULTY_ORDER: { value: string; label: string }[] = [
  { value: "facile", label: "facile" },
  { value: "modere", label: "modérée" },
  { value: "difficile", label: "difficile" },
  { value: "expert", label: "expert" },
];

/** Valeur au rang demandé, sur une série déjà triée. */
function percentile(sorted: number[], ratio: number): number {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)));
  return Math.round(sorted[index] * 10) / 10;
}

export function computeCityStats(hikes: HikeSummary[]): CityStats | null {
  if (hikes.length === 0) return null;

  const distances = hikes.map((hike) => hike.distance_km);
  const sortedDistances = [...distances].sort((a, b) => a - b);
  const durations = hikes.map((hike) => hike.duration_minutes);

  const places = new Map<string, number>();
  for (const hike of hikes) {
    const name = hike.location_name?.trim();
    if (!name) continue;
    places.set(name, (places.get(name) ?? 0) + 1);
  }

  return {
    count: hikes.length,
    distanceRange: [
      Math.round(Math.min(...distances) * 10) / 10,
      Math.round(Math.max(...distances) * 10) / 10,
    ],
    typicalDistance: [percentile(sortedDistances, 0.1), percentile(sortedDistances, 0.9)],
    durationRange: [Math.min(...durations), Math.max(...durations)],
    maxElevation: Math.max(...hikes.map((hike) => hike.elevation_gain_m ?? 0)),
    byDifficulty: DIFFICULTY_ORDER.map(({ value, label }) => ({
      value,
      label,
      count: hikes.filter((hike) => hike.difficulty === value).length,
    })).filter((entry) => entry.count > 0),
    navigoCount: hikes.filter((hike) =>
      isInNavigoZone({
        lat: hike.start_lat,
        lng: hike.start_lng,
        locationName: hike.location_name,
      }),
    ).length,
    /* `Array.from` et non l'opérateur de décomposition : la cible de
       compilation du projet ne sait pas parcourir un itérateur de `Map`. */
    topPlaces: Array.from(places.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
  };
}

/** « 2 h 30 » à partir de minutes, pour une phrase et non un tableau. */
export function spellDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${String(rest).padStart(2, "0")}`;
}
