import { Suspense } from "react";
import CityPageContent, { Hike } from "@/components/city-page-content";

const HIKES_DATABASE: Record<string, Hike[]> = {
  paris: [
    {
      name: "Les Gorges de Franchard (Fontainebleau)",
      distance: "12 km",
      duration: "3h30",
      difficulty: "Facile",
      transit: "Gare de Lyon → Gare de Fontainebleau-Avon (Transilien R, 40 min)",
      description: "Un parcours magique au milieu des chaos rocheux emblématiques de la forêt de Fontainebleau. Accessible en moins de 45 minutes de train.",
      scenery: "Forêt",
      elevation: "+120m",
      svgPath: "M 0 50 Q 80 15 160 40 T 240 20 T 320 42 T 400 50",
      co2Saved: "22",
      destinationStation: "Fontainebleau-Avon",
      lat: 48.4116,
      lng: 2.6288,
    },
    {
      name: "La Vallée de la Chevreuse",
      distance: "16 km",
      duration: "4h30",
      difficulty: "Moyen",
      transit: "RER B → Gare de Saint-Rémy-lès-Chevreuse (45 min)",
      description: "Randonnez le long des étangs et visitez le Château de la Madeleine. Le sentier commence dès la sortie de la gare RER.",
      scenery: "Forêt",
      elevation: "+250m",
      svgPath: "M 0 50 Q 60 20 120 45 T 240 25 T 360 45 T 400 50",
      co2Saved: "18",
      destinationStation: "Saint-Rémy-lès-Chevreuse",
      lat: 48.7056,
      lng: 2.0673,
    },
    {
      name: "Les Étangs de Hollande (Rambouillet)",
      distance: "18 km",
      duration: "5h00",
      difficulty: "Moyen",
      transit: "Gare Montparnasse → Gare de Rambouillet (Transilien N, 35 min) + Navette locale",
      description: "Une évasion sauvage à travers la forêt domaniale de Rambouillet. Idéale pour observer les cerfs et se ressourcer au bord de l'eau.",
      scenery: "Lac",
      elevation: "+80m",
      svgPath: "M 0 50 Q 100 45 200 48 T 300 45 T 400 50",
      co2Saved: "25",
      destinationStation: "Rambouillet",
      lat: 48.6366,
      lng: 1.8385,
    },
  ],
  lyon: [
    {
      name: "Le Crêt de la Perdrix (Pilat)",
      distance: "14 km",
      duration: "4h15",
      difficulty: "Moyen",
      transit: "Gare de Lyon-Part-Dieu → Gare de Saint-Chamond (TER, 45 min) + Bus Navette Pilat",
      description: "Grimpez jusqu'au point culminant du massif du Pilat pour admirer un panorama exceptionnel à 360° sur les Alpes et le Massif Central.",
      scenery: "Sommet",
      elevation: "+650m",
      svgPath: "M 0 50 L 150 15 L 200 10 L 250 15 L 400 50",
      co2Saved: "24",
      destinationStation: "Saint-Chamond",
      lat: 45.3712,
      lng: 4.5772,
    },
    {
      name: "Balcon de la Chartreuse (Passage de la Clé)",
      distance: "18 km",
      duration: "6h00",
      difficulty: "Difficile",
      transit: "Gare de Lyon-Part-Dieu → Gare de Grenoble (TER, 1h15) + Bus Région T64",
      description: "Une grande traversée alpine avec une vue spectaculaire sur les massifs de la Chartreuse et de Belledonne.",
      scenery: "Sommet",
      elevation: "+1100m",
      svgPath: "M 0 50 L 120 20 L 150 15 L 240 8 L 400 50",
      co2Saved: "38",
      destinationStation: "Grenoble",
      lat: 45.2447,
      lng: 5.6297,
    },
    {
      name: "Le Sentier des Monts d'Or",
      distance: "10 km",
      duration: "2h45",
      difficulty: "Facile",
      transit: "Gare de Lyon-Vaise → Gare de Couzon-au-Mont-d'Or (TER, 8 min)",
      description: "Une micro-aventure rapide et verdoyante aux portes immédiates de Lyon. Randonnez le long des cabornes en pierre sèche.",
      scenery: "Forêt",
      elevation: "+320m",
      svgPath: "M 0 50 Q 60 20 120 40 T 240 25 T 360 45 T 400 50",
      co2Saved: "12",
      destinationStation: "Couzon-au-Mont-d'Or",
      lat: 45.8458,
      lng: 4.8116,
    },
  ],
  grenoble: [
    {
      name: "Le Moucherotte (Massif du Vercors)",
      distance: "13 km",
      duration: "4h00",
      difficulty: "Moyen",
      transit: "Gare de Grenoble → Bus Régional T64 (Arrêt Saint-Nizier-du-Moucherotte, 35 min)",
      description: "L'un des plus beaux belvédères sur la cuvette grenobloise. Le sentier débute immédiatement au village d'arrivée du bus.",
      scenery: "Sommet",
      elevation: "+800m",
      svgPath: "M 0 50 L 180 12 L 220 12 L 400 50",
      co2Saved: "26",
      destinationStation: "Grenoble",
      lat: 45.1553,
      lng: 5.6375,
    },
    {
      name: "Le Lac Achard (Belledonne)",
      distance: "8 km",
      duration: "2h30",
      difficulty: "Facile",
      transit: "Gare de Grenoble → Tram A (Grand'Place) + Navette Estivale Chamrousse (50 min)",
      description: "Découvrez un joyau d'altitude bordé de sapins et entouré de pics rocheux. Idéal pour une randonnée pique-nique facile le week-end.",
      scenery: "Lac",
      elevation: "+400m",
      svgPath: "M 0 50 L 150 25 L 250 25 L 400 50",
      co2Saved: "28",
      destinationStation: "Grenoble",
      lat: 45.1114,
      lng: 5.8753,
    },
    {
      name: "La Dent de Crolles (Chartreuse)",
      distance: "15 km",
      duration: "5h30",
      difficulty: "Difficile",
      transit: "Gare de Grenoble → Bus Régional T83 (Arrêt Col de Porte, 45 min)",
      description: "Un sommet mythique de la Chartreuse. Un parcours exigeant à travers les lapiaz calcaires avec un panorama grandiose sur le Grésivaudan.",
      scenery: "Sommet",
      elevation: "+1150m",
      svgPath: "M 0 50 L 140 15 L 220 5 L 400 50",
      co2Saved: "29",
      destinationStation: "Grenoble",
      lat: 45.3125,
      lng: 5.8547,
    },
  ],
  marseille: [
    {
      name: "Les Calanques de Port-Pin et d'En-Vau",
      distance: "11 km",
      duration: "4h00",
      difficulty: "Moyen",
      transit: "Gare Saint-Charles → Bus L068 (Arrêt Cassis Gendarmerie, 45 min)",
      description: "Une randonnée spectaculaire au cœur du Parc National des Calanques, mêlant falaises calcaires et baignades dans des eaux turquoise.",
      scenery: "Lac",
      elevation: "+350m",
      svgPath: "M 0 50 Q 80 15 160 40 T 240 20 T 320 42 T 400 50",
      co2Saved: "31",
      destinationStation: "Cassis",
      lat: 43.2025,
      lng: 5.5186,
    },
    {
      name: "La Montagne Sainte-Victoire (Prieuré)",
      distance: "14 km",
      duration: "5h30",
      difficulty: "Difficile",
      transit: "Gare Saint-Charles → TER Aix (30 min) + Bus local 140",
      description: "Grimpez la mythique montagne peinte par Cézanne. Une ascension escarpée récompensée par une vue majestueuse sur toute la Provence.",
      scenery: "Sommet",
      elevation: "+750m",
      svgPath: "M 0 50 L 160 10 L 240 15 L 400 50",
      co2Saved: "22",
      destinationStation: "Aix-en-Provence",
      lat: 43.5325,
      lng: 5.6120,
    },
    {
      name: "Le Cap Canaille",
      distance: "12 km",
      duration: "4h30",
      difficulty: "Moyen",
      transit: "Gare Saint-Charles → TER Cassis (20 min) + navette",
      description: "Un itinéraire spectaculaire sur les plus hautes falaises maritimes d'Europe. Des points de vue vertigineux sur la baie de Cassis.",
      scenery: "Sommet",
      elevation: "+420m",
      svgPath: "M 0 50 Q 100 10 200 15 T 400 50",
      co2Saved: "32",
      destinationStation: "Cassis",
      lat: 43.1979,
      lng: 5.5539,
    },
  ],
  bordeaux: [
    {
      name: "La Dune du Pilat et forêt landaise",
      distance: "13 km",
      duration: "3h45",
      difficulty: "Moyen",
      transit: "Gare Saint-Jean → TER Arcachon (50 min) + Bus Baïa 1",
      description: "Parcourez la crête de la plus haute dune d'Europe avant de vous enfoncer sous les pins de la forêt des Landes.",
      scenery: "Lac",
      elevation: "+110m",
      svgPath: "M 0 50 L 150 20 L 250 15 L 400 50",
      co2Saved: "28",
      destinationStation: "Arcachon",
      lat: 44.5902,
      lng: -1.2131,
    },
    {
      name: "Le Tour du Lac de Lacanau",
      distance: "15 km",
      duration: "4h00",
      difficulty: "Facile",
      transit: "Gare Saint-Jean → Car Régional 702 (Arrêt Lacanau Océan, 1h10)",
      description: "Randonnez à l'ombre de la pinède sur des sentiers plats bordant l'immense lac de Lacanau. Calme et nature sauvage garantis.",
      scenery: "Lac",
      elevation: "+40m",
      svgPath: "M 0 50 Q 200 42 400 50",
      co2Saved: "32",
      destinationStation: "Lacanau-Océan",
      lat: 44.9782,
      lng: -1.0805,
    },
  ],
  strasbourg: [
    {
      name: "Les Trois Châteaux d'Ottrott",
      distance: "14 km",
      duration: "4h15",
      difficulty: "Moyen",
      transit: "Gare de Strasbourg → TER Obernai (30 min) + Bus Fluo 257",
      description: "Découvrez les ruines romantiques de châteaux forts médiévaux blottis au cœur des denses forêts de sapins d'Alsace.",
      scenery: "Forêt",
      elevation: "+450m",
      svgPath: "M 0 50 Q 80 15 160 40 T 240 20 T 320 42 T 400 50",
      co2Saved: "18",
      destinationStation: "Obernai",
      lat: 48.4608,
      lng: 7.4089,
    },
    {
      name: "Le Mont Sainte-Odile (Sentier des Merveilles)",
      distance: "17 km",
      duration: "5h30",
      difficulty: "Difficile",
      transit: "Gare de Strasbourg → TER Barr (35 min) + Sentier Club Vosgien",
      description: "Une randonnée le long du Mur Païen énigmatique menant jusqu'au couvent d'altitude du Mont Sainte-Odile.",
      scenery: "Sommet",
      elevation: "+680m",
      svgPath: "M 0 50 L 160 12 L 240 10 L 400 50",
      co2Saved: "24",
      destinationStation: "Barr",
      lat: 48.4375,
      lng: 7.4045,
    },
  ],
};

const DEFAULT_HIKES = (cityName: string): Hike[] => [
  {
    name: "Le Sentier des Belvédères Sauvages",
    distance: "12 km",
    duration: "3h30",
    difficulty: "Facile",
    transit: `Gare de ${cityName} → TER régional (30 min) + Navette locale (10 min)`,
    description: "Une magnifique escapade nature pour quitter le tumulte urbain. Planifiée et testée par la communauté Névé.",
    scenery: "Forêt",
    elevation: "+180m",
    svgPath: "M 0 50 Q 100 25 200 40 T 400 50",
    co2Saved: "20",
    destinationStation: cityName,
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    name: "La Traversée de la Crête Verte",
    distance: "16 km",
    duration: "5h00",
    difficulty: "Moyen",
    transit: `Gare de ${cityName} → TER direct (45 min) + Sentier balisé`,
    description: "Prenez de la hauteur et profitez de l'air pur de la forêt. Le retour est synchronisé avec le dernier train de l'après-midi.",
    scenery: "Sommet",
    elevation: "+450m",
    svgPath: "M 0 50 L 160 15 L 240 10 L 400 50",
    co2Saved: "25",
    destinationStation: cityName,
    lat: 48.8566,
    lng: 2.3522,
  },
];

type Props = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Randonnées sans voiture depuis ${capitalizedCity} - Névé`,
    description: `Sélection d'itinéraires de randonnée accessibles en train et bus depuis la gare de ${capitalizedCity}. Partez explorer l'esprit tranquille avec Névé.`,
    alternates: {
      canonical: `https://neve-rando.fr/randos-sans-voiture/${city.toLowerCase()}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const hikes = HIKES_DATABASE[city.toLowerCase()] || DEFAULT_HIKES(cityName);

  // Generate Google-compliant Rich Snippet Schema (JSON-LD)
  const websiteUrl = "https://neve-rando.fr"; // placeholder brand url
  const pageUrl = `${websiteUrl}/randos-sans-voiture/${city.toLowerCase()}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. BreadcrumbList Schema
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": websiteUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `Randos sans voiture depuis ${cityName}`,
            "item": pageUrl,
          },
        ],
      },
      // 2. ItemList Schema for the hike suggestions
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#hikeslist`,
        "name": `Sélection de randonnées sans voiture au départ de ${cityName}`,
        "numberOfItems": hikes.length,
        "itemListElement": hikes.map((hike, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Trip",
            "name": hike.name,
            "description": hike.description,
            "touristType": "Randonneur sans voiture",
            "distance": hike.distance,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "seller": {
                "@type": "Organization",
                "name": "Névé",
              },
            },
          },
        })),
      },
      // 3. FAQPage Schema for the local search queries
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Quel est le temps d'accès moyen en TER depuis la gare de ${cityName} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `La plupart des sentiers de randonnée au départ de la gare de ${cityName} débutent à moins de 1h30 de train régional (TER). Les liaisons calculées par Névé intègrent des correspondances directes avec des bus ou navettes locales.`,
            },
          },
          {
            "@type": "Question",
            "name": "Comment s'assurer de ne pas rater le transport de retour ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Névé intègre un système d'alerte active 'Sécurité Retour'. Grâce au suivi GPS mobile de votre smartphone en cours de marche, l'application évalue votre vitesse et vous prévient s'il est temps de faire demi-tour pour être certain de prendre votre bus ou TER.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-light text-brand-dark">Chargement...</div>}>
        <CityPageContent cityName={cityName} hikes={hikes} />
      </Suspense>
    </>
  );
}
