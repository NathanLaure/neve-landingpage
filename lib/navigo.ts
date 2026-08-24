import type { User } from "@supabase/supabase-js";

/**
 * Badge « Pass Navigo » : deux conditions, et aucune n'est portée par la
 * randonnée elle-même.
 *
 * Il n'existe pas de colonne `is_navigo_accessible` dans la table `hikes` — le
 * type TypeScript la déclare mais la base ne la contient pas. Le badge ne dit
 * donc pas « cette randonnée accepte le Navigo » dans l'absolu : il dit « ton
 * pass couvre celle-ci », ce qui suppose de savoir que tu en as un.
 *
 * Sans pass déclaré, pas de badge. Un randonneur qui n'a pas d'abonnement n'a
 * que faire de savoir lesquelles il couvrirait.
 */

/** Bornes de la zone Navigo, un rectangle autour de l'Île-de-France. */
const NAVIGO_BOUNDS = { minLat: 48.12, maxLat: 49.24, minLng: 1.44, maxLng: 3.56 };

/** Départements et lieux de la zone, pour les randonnées mal géolocalisées. */
const NAVIGO_PLACES = [
  "île-de-france",
  "ile-de-france",
  "paris",
  "seine-et-marne",
  "yvelines",
  "essonne",
  "hauts-de-seine",
  "seine-saint-denis",
  "val-de-marne",
  "val-d'oise",
  "fontainebleau",
];

/** Forme minimale du profil, pour ne dépendre d'aucun contexte particulier. */
export interface NavigoProfile {
  hasNavigo?: boolean;
  transportPasses?: string[];
}

/**
 * Le randonneur a-t-il déclaré un pass Navigo ?
 *
 * Le profil d'abord, puis les métadonnées du compte — le pass a été stocké sous
 * trois noms au fil du temps, et d'anciens comptes portent encore les premiers.
 */
export function hasNavigoPass(user: User | null, profile: NavigoProfile | null): boolean {
  if (profile?.hasNavigo || profile?.transportPasses?.includes("navigo")) return true;
  if (!user) return false;

  const meta = user.user_metadata || {};
  const passes = meta.transport_passes || meta.transportPasses || meta.passes;
  if (Array.isArray(passes)) return passes.includes("navigo");
  if (meta.has_navigo !== undefined) return Boolean(meta.has_navigo);

  return false;
}

/**
 * La randonnée est-elle dans la zone du pass ?
 *
 * Les coordonnées font foi ; le nom du lieu ne sert que de repli, pour les
 * lignes dont le départ est mal placé.
 */
export function isInNavigoZone({
  lat,
  lng,
  locationName,
}: {
  lat?: number | null;
  lng?: number | null;
  locationName?: string | null;
}): boolean {
  if (typeof lat === "number" && typeof lng === "number") {
    return (
      lat >= NAVIGO_BOUNDS.minLat &&
      lat <= NAVIGO_BOUNDS.maxLat &&
      lng >= NAVIGO_BOUNDS.minLng &&
      lng <= NAVIGO_BOUNDS.maxLng
    );
  }

  const place = (locationName || "").toLowerCase();
  return NAVIGO_PLACES.some((name) => place.includes(name));
}
