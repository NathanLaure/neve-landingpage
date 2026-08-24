/**
 * Constantes partagées entre la page de l'explorateur, qui est un composant
 * serveur, et sa barre de filtres, qui est un composant client.
 *
 * Elles vivent ici et non dans `map-filters.tsx` : importer une **valeur**
 * depuis un module `"use client"` vers un composant serveur ne transmet pas la
 * valeur mais une référence de module. Le tableau arrivait donc côté serveur
 * sous une forme sur laquelle `includes` n'existe pas.
 */

/** Rayons proposés par le chip, en kilomètres. */
export const RADIUS_OPTIONS = [5, 10, 15, 25, 50] as const;

export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

/**
 * Ramène un rayon demandé par l'adresse à une valeur proposée par le chip.
 *
 * Une adresse se forge à la main : sans cette borne, `?radius=5000` ferait
 * charger la France entière.
 */
export function parseRadius(raw: string | undefined, fallback: number): number {
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return (RADIUS_OPTIONS as readonly number[]).includes(value) ? value : fallback;
}
