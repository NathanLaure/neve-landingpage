// Curated shortcuts shown on the /randos-sans-voiture hub page. This is just
// editorial content (name/tagline/description/accent) pointing at the dynamic
// /randos-sans-voiture/[city] route — no coordinates are hardcoded here.
// [city]/page.tsx resolves the actual location via Mapbox geocoding (see
// lib/geocode.ts), so the dynamic route works for any place name, not just
// the ones featured below.
export type HikeHub = {
  slug: string;
  name: string;
  /** Région, pour regrouper les villes sans avoir à la déduire d'un point. */
  region: string;
  tagline: string;
  description: string;
  accent: string;
};

/**
 * Villes mises en avant, choisies sur ce que la base contient réellement.
 *
 * La liste ne couvrait que les Alpes-de-Haute-Provence, alors que le catalogue
 * porte sur deux massifs de données distincts : l'Île-de-France et les
 * Alpes-du-Sud. Une page d'entrée qui n'en montre qu'un promet moins que ce qui
 * existe.
 *
 * Chaque compte est calculé à l'affichage, jamais écrit ici : un nombre en dur
 * devient faux au premier ajout en base.
 */
export const HIKE_HUBS: HikeHub[] = [
  {
    slug: "paris",
    name: "Paris",
    region: "Île-de-France",
    tagline: "Forêts du Grand Paris",
    description:
      "Les massifs accessibles en RER et Transilien depuis Paris, souvent couverts par un pass Navigo.",
    accent: "from-orange-500 to-red-600",
  },
  {
    slug: "fontainebleau",
    name: "Fontainebleau",
    region: "Île-de-France",
    tagline: "Forêt & rochers",
    description:
      "La forêt domaniale et ses sentiers de grès, à quarante minutes de gare de Lyon.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    slug: "rambouillet",
    name: "Rambouillet",
    region: "Île-de-France",
    tagline: "Forêt domaniale",
    description:
      "Étangs, futaies et vallée de Chevreuse à l'ouest, desservis par la ligne N.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    slug: "melun",
    name: "Melun",
    region: "Île-de-France",
    tagline: "Bords de Seine",
    description:
      "Boucles le long du fleuve et entrées sud de la forêt de Fontainebleau.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    slug: "digne-les-bains",
    name: "Digne-les-Bains",
    region: "Alpes-du-Sud",
    tagline: "Préalpes & lavande",
    description:
      "Porte d'entrée du Géoparc UNESCO de Haute-Provence, terminus du train des Pignes.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    slug: "sisteron",
    name: "Sisteron",
    region: "Alpes-du-Sud",
    tagline: "Porte des Alpes",
    description:
      "Le verrou de la Durance entre Provence et Alpes du Sud, au pied de la citadelle.",
    accent: "from-orange-500 to-red-600",
  },
  {
    slug: "castellane",
    name: "Castellane",
    region: "Alpes-du-Sud",
    tagline: "Gorges du Verdon",
    description: "L'entrée amont des gorges, entre falaises calcaires et lacs.",
    accent: "from-cyan-500 to-sky-600",
  },
  {
    slug: "barcelonnette",
    name: "Barcelonnette",
    region: "Alpes-du-Sud",
    tagline: "Vallée de l'Ubaye",
    description: "Haute montagne et cols, au contact du parc national du Mercantour.",
    accent: "from-indigo-500 to-blue-700",
  },
];
