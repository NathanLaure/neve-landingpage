"use client";

import { useState } from "react";

type SportType = "rando" | "trail" | "gravel";

type SurfaceBreakdown = {
  natural: number; // %
  rocky: number;   // %
  paved: number;   // %
};

type Hike = {
  name: string;
  distance: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  transit: string;
  description: string;
  scenery: "Forêt" | "Lac" | "Sommet" | "Mer";
  elevation: string;
  svgPath: string;
  co2Saved: string;
  destinationStation: string;
  image: string;
  sport: SportType;
  surfaces: SurfaceBreakdown;
  velosAcceptes?: boolean; // For gravel
};

const HIKES_BY_CITY: Record<string, Hike[]> = {
  paris: [
    {
      name: "Les Gorges de Franchard (Fontainebleau)",
      distance: "12 km",
      duration: "3h30",
      difficulty: "Facile",
      transit: "Paris Gare de Lyon → Gare de Fontainebleau-Avon (Transilien R, 40 min)",
      description: "Un parcours magique au milieu des chaos rocheux emblématiques de la forêt de Fontainebleau. Accessible en moins de 45 minutes de train.",
      scenery: "Forêt",
      elevation: "+120m",
      svgPath: "M 0 50 Q 80 15 160 40 T 240 20 T 320 42 T 400 50",
      co2Saved: "22",
      destinationStation: "Fontainebleau-Avon",
      image: "🌲",
      sport: "rando",
      surfaces: { natural: 70, rocky: 20, paved: 10 }
    },
    {
      name: "La Vallée de la Chevreuse (Singletrack)",
      distance: "16 km",
      duration: "1h30",
      difficulty: "Moyen",
      transit: "Paris (RER B) → Gare de Saint-Rémy-lès-Chevreuse (45 min)",
      description: "Parcours de trail rythmé le long des étangs et du Château de la Madeleine. Singletracks terreux rapides et faux-plats montants.",
      scenery: "Forêt",
      elevation: "+250m",
      svgPath: "M 0 50 Q 60 20 120 45 T 240 25 T 360 45 T 400 50",
      co2Saved: "18",
      destinationStation: "Saint-Rémy-lès-Chevreuse",
      image: "🏃",
      sport: "trail",
      surfaces: { natural: 80, rocky: 10, paved: 10 }
    },
    {
      name: "Traversée de la Plaine de Rambouillet en Gravel",
      distance: "42 km",
      duration: "2h45",
      difficulty: "Moyen",
      transit: "Paris Montparnasse → Gare de Rambouillet (Transilien N, 35 min) - Vélos admis dans le train",
      description: "Une aventure gravel roulante à travers les pistes forestières de Rambouillet. Passages au bord des étangs de Hollande.",
      scenery: "Lac",
      elevation: "+180m",
      svgPath: "M 0 50 Q 100 45 200 48 T 300 45 T 400 50",
      co2Saved: "32",
      destinationStation: "Rambouillet",
      image: "🚲",
      sport: "gravel",
      surfaces: { natural: 50, rocky: 20, paved: 30 },
      velosAcceptes: true
    },
  ],
  lyon: [
    {
      name: "Le Crêt de la Perdrix (Massif du Pilat)",
      distance: "14 km",
      duration: "4h15",
      difficulty: "Moyen",
      transit: "Lyon Part-Dieu → Gare de Saint-Chamond (TER, 45 min) + Bus Navette Pilat",
      description: "Grimpez jusqu'au point culminant du massif du Pilat pour admirer un panorama exceptionnel à 360° sur les Alpes.",
      scenery: "Sommet",
      elevation: "+650m",
      svgPath: "M 0 50 L 150 15 L 200 10 L 250 15 L 400 50",
      co2Saved: "24",
      destinationStation: "Saint-Chamond",
      image: "🏔️",
      sport: "rando",
      surfaces: { natural: 60, rocky: 30, paved: 10 }
    },
    {
      name: "Trail des Balcons du Pilat",
      distance: "22 km",
      duration: "2h30",
      difficulty: "Difficile",
      transit: "Lyon Part-Dieu → Gare de Saint-Chamond (TER, 45 min) + Bus Navette Pilat",
      description: "Sortie de trail technique sur les crêts du Pilat. Fort dénivelé avec des pierriers (chirats) typiques de la région.",
      scenery: "Sommet",
      elevation: "+950m",
      svgPath: "M 0 50 L 120 20 L 150 15 L 240 8 L 400 50",
      co2Saved: "35",
      destinationStation: "Saint-Chamond",
      image: "🏃",
      sport: "trail",
      surfaces: { natural: 40, rocky: 50, paved: 10 }
    },
    {
      name: "Le Sentier des Monts d'Or en Gravel",
      distance: "28 km",
      duration: "2h00",
      difficulty: "Facile",
      transit: "Lyon-Vaise → Gare de Couzon-au-Mont-d'Or (TER, 8 min) - Emplacement vélo TER",
      description: "Une micro-aventure gravel rapide et verdoyante aux portes de Lyon. Pistes carrossables en pierre calcaire dorée.",
      scenery: "Forêt",
      elevation: "+480m",
      svgPath: "M 0 50 Q 60 20 120 40 T 240 25 T 360 45 T 400 50",
      co2Saved: "14",
      destinationStation: "Couzon-au-Mont-d'Or",
      image: "🚲",
      sport: "gravel",
      surfaces: { natural: 30, rocky: 50, paved: 20 },
      velosAcceptes: true
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
      image: "🧗",
      sport: "rando",
      surfaces: { natural: 50, rocky: 40, paved: 10 }
    },
    {
      name: "Trail Vertical de la Dent de Crolles",
      distance: "15 km",
      duration: "2h15",
      difficulty: "Difficile",
      transit: "Gare de Grenoble → Bus Régional T83 (Arrêt Col de Porte, 45 min)",
      description: "Un entraînement de trail alpin très exigeant à travers les lapiaz calcaires de la Chartreuse. Panorama exceptionnel.",
      scenery: "Sommet",
      elevation: "+1150m",
      svgPath: "M 0 50 L 140 15 L 220 5 L 400 50",
      co2Saved: "29",
      destinationStation: "Grenoble",
      image: "🏃",
      sport: "trail",
      surfaces: { natural: 30, rocky: 65, paved: 5 }
    },
    {
      name: "Le Tour du Plateau de Chamrousse en Gravel",
      distance: "35 km",
      duration: "3h15",
      difficulty: "Difficile",
      transit: "Gare de Grenoble → Tram A + Navette Estivale Chamrousse (Vélos acceptés dans le bus)",
      description: "Pistes de gravel en haute altitude serpentant autour des lacs de Belledonne. Paysage minéral et descentes techniques.",
      scenery: "Lac",
      elevation: "+900m",
      svgPath: "M 0 50 L 150 25 L 250 25 L 400 50",
      co2Saved: "34",
      destinationStation: "Grenoble",
      image: "🚲",
      sport: "gravel",
      surfaces: { natural: 20, rocky: 60, paved: 20 },
      velosAcceptes: true
    },
  ],
  marseille: [
    {
      name: "Les Calanques de Port-Pin et d'En-Vau",
      distance: "11 km",
      duration: "4h00",
      difficulty: "Moyen",
      transit: "Marseille St-Charles → Bus L068 (Arrêt Cassis Gendarmerie, 45 min)",
      description: "Une randonnée spectaculaire au cœur du Parc National des Calanques, mêlant falaises calcaires et baignades turquoise.",
      scenery: "Mer",
      elevation: "+350m",
      svgPath: "M 0 50 Q 80 15 160 40 T 240 20 T 320 42 T 400 50",
      co2Saved: "31",
      destinationStation: "Cassis",
      image: "🌊",
      sport: "rando",
      surfaces: { natural: 20, rocky: 70, paved: 10 }
    },
    {
      name: "Trail de la Montagne Sainte-Victoire",
      distance: "14 km",
      duration: "2h00",
      difficulty: "Difficile",
      transit: "Marseille St-Charles → TER Aix (30 min) + Bus local 140",
      description: "Ascension de trail très technique et escarpée sur la crête calcaire de la Sainte-Victoire. Exigeant et pierreux.",
      scenery: "Sommet",
      elevation: "+750m",
      svgPath: "M 0 50 L 160 10 L 240 15 L 400 50",
      co2Saved: "22",
      destinationStation: "Aix-en-Provence",
      image: "🏃",
      sport: "trail",
      surfaces: { natural: 10, rocky: 85, paved: 5 }
    },
    {
      name: "Pistes Gravel du Massif de l'Étoile",
      distance: "30 km",
      duration: "2h15",
      difficulty: "Moyen",
      transit: "Marseille St-Charles → TER Septèmes-les-Vallons (12 min) - Emplacements vélo direct",
      description: "Itinéraire de gravel sauvage surplombant la cité phocéenne. Pistes larges en calcaire blanc avec de belles rampes de montée.",
      scenery: "Sommet",
      elevation: "+600m",
      svgPath: "M 0 50 Q 100 10 200 15 T 400 50",
      co2Saved: "24",
      destinationStation: "Septèmes-les-Vallons",
      image: "🚲",
      sport: "gravel",
      surfaces: { natural: 30, rocky: 50, paved: 20 },
      velosAcceptes: true
    }
  ]
};

const CITIES = [
  { slug: "lyon", name: "Lyon", emoji: "🦁" },
  { slug: "paris", name: "Paris", emoji: "🗼" },
  { slug: "grenoble", name: "Grenoble", emoji: "🏔️" },
  { slug: "marseille", name: "Marseille", emoji: "🌊" },
];

export default function HikeExplorer() {
  const [selectedCity, setSelectedCity] = useState("lyon");
  const [activeSport, setActiveSport] = useState<SportType>("rando");
  const [difficultyFilter, setDifficultyFilter] = useState("Tous");

  const currentHikes = HIKES_BY_CITY[selectedCity] || [];

  const filteredHikes = currentHikes.filter((hike) => {
    const matchesSport = hike.sport === activeSport;
    const matchesDiff = difficultyFilter === "Tous" || hike.difficulty === difficultyFilter;
    return matchesSport && matchesDiff;
  });

  return (
    <section className="bg-neve-beige py-16 md:py-24 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        {/* Header section */}
        <div className="mx-auto max-w-3xl text-center pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neve-gray text-neve-forest text-xs font-bold uppercase tracking-wider mb-4 border border-gray-200">
            🌳 Planificateur interactif
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight leading-tight">
            Trouvez la bonne inspiration
          </h2>
          <p className="mt-4 text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Sélectionnez votre gare de départ, votre discipline favorite et découvrez la composition du sol et les temps d'accès TER en temps réel.
          </p>
        </div>

        {/* Dashboard container */}
        <div className="bg-white border border-gray-150 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Top Panel: City selection (Dark menu or slate-900) */}
          <div className="bg-slate-900 px-6 py-4 flex flex-wrap gap-3 items-center justify-between border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Départ Gare de :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => {
                    setSelectedCity(city.slug);
                    setDifficultyFilter("Tous");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-2 cursor-pointer ${
                    selectedCity === city.slug
                      ? "bg-neve-forest text-white shadow-md"
                      : "bg-slate-800 hover:bg-slate-750 text-slate-350"
                  }`}
                >
                  <span>{city.emoji}</span>
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sport / Discipline Selector & Difficulty filter Bar (Style Selector) */}
          <div className="bg-neve-beige px-6 py-4 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 items-center">
              
              {/* Sport Discipline Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Sport :</span>
                <div className="flex bg-white rounded-xl border border-gray-250 p-0.5 shadow-2xs">
                  {[
                    { id: "rando", name: "Rando 🥾" },
                    { id: "trail", name: "Trail 🏃" },
                    { id: "gravel", name: "Gravel/VTT 🚲" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSport(s.id as SportType)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeSport === s.id
                          ? "bg-neve-forest text-white shadow-xs"
                          : "text-slate-550 hover:text-slate-800"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Difficulté :</span>
                <div className="flex bg-white rounded-xl border border-gray-250 p-0.5 shadow-2xs">
                  {["Tous", "Facile", "Moyen", "Difficile"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficultyFilter(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        difficultyFilter === level
                          ? "bg-slate-100 text-slate-800 font-bold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium font-mono">
              {filteredHikes.length} itinéraire{filteredHikes.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* Results Grid */}
          <div className="p-6 bg-slate-50/20">
            {filteredHikes.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-neve-beige/60">
                <div className="text-4xl mb-3">🏔️</div>
                <p className="text-slate-500 font-bold mb-1 text-base">Aucun itinéraire de cette discipline ici</p>
                <p className="text-slate-450 text-xs mb-4">Essayez de sélectionner un autre sport ou de réinitialiser la difficulté.</p>
                <button
                  onClick={() => {
                    setDifficultyFilter("Tous");
                    setActiveSport("rando");
                  }}
                  className="px-4 py-2 bg-neve-gray text-neve-forest border border-gray-300 rounded-xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHikes.map((hike, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-150 hover:border-neve-forest shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
                  >
                    {/* Visual elevation profile backdrop in card */}
                    <div className="relative h-28 bg-slate-950 flex items-end overflow-hidden rounded-t-2xl">
                      <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 to-slate-950/85 z-10" />
                      
                      {/* Big emoji representing scenery */}
                      <span className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center text-lg z-20 shadow-xs">
                        {hike.image}
                      </span>
                      
                      {/* Scenery text tag */}
                      <span className="absolute bottom-2 left-3 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-neve-forest text-white shadow-xs z-25">
                        🏞️ {hike.scenery}
                      </span>

                      {/* Elevation gain badge */}
                      <div className="absolute top-3 right-3 bg-slate-900/70 text-white rounded-md px-2 py-0.5 text-[9px] font-bold border border-slate-800 z-20">
                        📈 D+ : {hike.elevation}
                      </div>

                      {/* SVG elevation curve */}
                      <svg className="w-full h-16 pointer-events-none opacity-60 z-10" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`neve-card-grad-${selectedCity}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-neve-forest)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--color-neve-forest)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={hike.svgPath}
                          fill="none"
                          stroke="var(--color-neve-forest)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d={`${hike.svgPath} L 400 100 L 0 100 Z`}
                          fill={`url(#neve-card-grad-${selectedCity}-${index})`}
                        />
                      </svg>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      {/* Badge tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 text-slate-700">
                          ⏱️ {hike.duration}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 text-slate-700">
                          📐 {hike.distance}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                            hike.difficulty === "Facile"
                              ? "bg-emerald-50 text-emerald-700"
                              : hike.difficulty === "Moyen"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {hike.difficulty}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                          🌱 -{hike.co2Saved}kg CO2
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-neve-forest transition duration-150">
                        {hike.name}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-grow">
                        {hike.description}
                      </p>

                      {/* Surface Breakdown (Soil composition representation) */}
                      <div className="mb-4 pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          📊 Type de chemin (Surfaces) :
                        </span>
                        <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200 shadow-2xs">
                          <div 
                            title={`Sentier naturel : ${hike.surfaces.natural}%`}
                            className="bg-emerald-700 h-full transition-all" 
                            style={{ width: `${hike.surfaces.natural}%` }} 
                          />
                          <div 
                            title={`Sentier pierreux : ${hike.surfaces.rocky}%`}
                            className="bg-amber-600 h-full transition-all" 
                            style={{ width: `${hike.surfaces.rocky}%` }} 
                          />
                          <div 
                            title={`Goudron : ${hike.surfaces.paved}%`}
                            className="bg-slate-400 h-full transition-all" 
                            style={{ width: `${hike.surfaces.paved}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 font-semibold mt-1">
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />Naturel {hike.surfaces.natural}%</span>
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-600" />Pierreux {hike.surfaces.rocky}%</span>
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Goudron {hike.surfaces.paved}%</span>
                        </div>
                      </div>

                      {/* Transit Details */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-neve-forest mb-1 flex items-center gap-1">
                          <span>🚂</span> Accès Train & Gare
                        </div>
                        <p className="text-[11px] font-semibold text-slate-750 leading-snug">
                          {hike.transit}
                        </p>
                      </div>

                      {/* VTT Bicycle warning badge for Gravel */}
                      {hike.velosAcceptes && (
                        <div className="mb-4 text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2 flex items-center gap-1.5">
                          <span>🚲</span> Vélos autorisés dans ce TER sans réservation
                        </div>
                      )}

                      {/* Trainline CTA Link */}
                      <a
                        href={`https://www.trainline.fr/search/${selectedCity}/${hike.destinationStation.toLowerCase()}?utm_source=neve&utm_medium=affiliate`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-150 text-center cursor-pointer"
                      >
                        Planifier sur Trainline
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
