"use client";

import { useState } from "react";

type PlaceType = {
  id: string;
  name: string;
  icon: string;
  accessibleCount: string;
  description: string;
};

const PLACES: PlaceType[] = [
  {
    id: "cols",
    name: "Cols de montagne",
    icon: "⛰️",
    accessibleCount: "14 cols",
    description: "Franchissez des cols légendaires (ex: Col de Porte, Col de la Clé) accessibles à pied depuis les arrêts de navettes locales reliées aux TER."
  },
  {
    id: "chateaux",
    name: "Châteaux & Forts",
    icon: "🏰",
    accessibleCount: "8 châteaux",
    description: "Explorez les ruines romantiques des châteaux d'Alsace (Ottrott) ou le Château de la Madeleine en Chevreuse, tous situés sur nos tracés train-to-trail."
  },
  {
    id: "refuges",
    name: "Refuges & Gîtes",
    icon: "🏕️",
    accessibleCount: "22 refuges",
    description: "Trouvez un abri gardé pour vos randonnées itinérantes de gare à gare. Idéal pour une nuit en altitude avant de reprendre un train le lendemain."
  },
  {
    id: "sommets",
    name: "Sommets d'altitude",
    icon: "🏔️",
    accessibleCount: "19 sommets",
    description: "Atteignez des belvédères grandioses (ex: Crêt de la Perdrix, Le Moucherotte) sans voiture. Randonnées sportives avec fort dénivelé."
  },
  {
    id: "cascades",
    name: "Cascades & Gorges",
    icon: "🌊",
    accessibleCount: "11 sites",
    description: "Marchez au frais le long des ruisseaux et torrents. Idéal pour les chaudes journées d'été en forêt (ex: Gorges de Franchard)."
  },
  {
    id: "lacs",
    name: "Lacs d'altitude",
    icon: "💧",
    accessibleCount: "15 lacs",
    description: "Baignez-vous dans des lacs cristallins (ex: Lac Achard, Étangs de Hollande) situés à quelques enjambées des gares régionales."
  }
];

export default function PlacesCategories() {
  const [hoveredId, setHoveredId] = useState<string>("cols");

  const activePlace = PLACES.find((p) => p.id === hoveredId) || PLACES[0];

  return (
    <section className="bg-neve-beige py-16 md:py-24 text-slate-900 relative w-full">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Parcourez des lieux sauvages
          </h2>
        </div>

        {/* Place cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {PLACES.map((place) => {
            const isHovered = hoveredId === place.id;
            return (
              <div
                key={place.id}
                onMouseEnter={() => setHoveredId(place.id)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 select-none flex flex-col justify-between aspect-square border ${
                  isHovered
                    ? "bg-neve-forest border-neve-forest text-white shadow-lg scale-102"
                    : "bg-neve-gray border-transparent hover:border-gray-300 text-slate-700"
                }`}
              >
                {/* Oblique arrow at top-right */}
                <span className="absolute top-4 right-4 text-[10px] font-bold opacity-60">
                  {isHovered ? "➔" : "↗"}
                </span>

                {/* Big Icon */}
                <span className="text-3xl mt-2 block">{place.icon}</span>

                {/* Title */}
                <div className="mt-auto">
                  <h3 className="font-extrabold text-xs leading-tight mb-1">
                    {place.name}
                  </h3>
                  <span className={`text-[9px] font-semibold ${isHovered ? "text-emerald-250" : "text-slate-400"}`}>
                    {place.accessibleCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info card (responsive description pane below) */}
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-4xl bg-neve-gray w-16 h-16 rounded-2xl flex items-center justify-center border border-gray-150">
              {activePlace.icon}
            </span>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                {activePlace.name}
                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-neve-forest border border-emerald-100 uppercase">
                  {activePlace.accessibleCount} en train
                </span>
              </h4>
              <p className="text-slate-500 text-xs md:text-sm mt-1.5 leading-relaxed max-w-xl">
                {activePlace.description}
              </p>
            </div>
          </div>
          
          <a
            href="/randos-sans-voiture"
            className="flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition duration-150 cursor-pointer text-center"
          >
            Explorer la carte
          </a>
        </div>
      </div>
    </section>
  );
}
