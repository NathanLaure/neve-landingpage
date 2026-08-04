// Curated shortcuts shown on the /randos-sans-voiture hub page. This is just
// editorial content (name/tagline/description/accent) pointing at the dynamic
// /randos-sans-voiture/[city] route — no coordinates are hardcoded here.
// [city]/page.tsx resolves the actual location via Mapbox geocoding (see
// lib/geocode.ts), so the dynamic route works for any place name, not just
// the ones featured below.
export type HikeHub = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
};

export const HIKE_HUBS: HikeHub[] = [
  {
    slug: "digne-les-bains",
    name: "Digne-les-Bains",
    tagline: "Préalpes & Lavande",
    description:
      "Préfecture des Alpes-de-Haute-Provence, capitale de la lavande et porte d'entrée du Géoparc UNESCO de Haute-Provence.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    slug: "sisteron",
    name: "Sisteron",
    tagline: "Porte des Alpes",
    description:
      "Randonnez autour de la citadelle de Sisteron, verrou naturel entre Provence et Alpes du Sud, au bord de la Durance.",
    accent: "from-orange-500 to-red-600",
  },
  {
    slug: "manosque",
    name: "Manosque",
    tagline: "Luberon & Valensole",
    description:
      "Entre le Luberon et le plateau de Valensole, explorez des sentiers vallonnés au cœur de la Provence.",
    accent: "from-rose-500 to-orange-600",
  },
  {
    slug: "castellane",
    name: "Castellane",
    tagline: "Gorges du Verdon",
    description:
      "Au pied de son célèbre roc, Castellane ouvre l'accès aux sentiers spectaculaires des Gorges du Verdon.",
    accent: "from-orange-500 to-amber-600",
  },
  {
    slug: "forcalquier",
    name: "Forcalquier",
    tagline: "Pays de Forcalquier",
    description:
      "Randonnez entre collines, plateaux et villages perchés du Pays de Forcalquier et de la Montagne de Lure.",
    accent: "from-yellow-500 to-orange-600",
  },
  {
    slug: "barcelonnette",
    name: "Barcelonnette",
    tagline: "Vallée de l'Ubaye",
    description:
      "Au cœur de la vallée de l'Ubaye, entre cols mythiques et sommets, un terrain de jeu pour la haute montagne.",
    accent: "from-red-500 to-orange-600",
  },
];
