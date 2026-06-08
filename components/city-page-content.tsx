"use client";

import { useState } from "react";
import Link from "next/link";

export type Hike = {
  name: string;
  distance: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  transit: string;
  description: string;
  scenery: "Forêt" | "Lac" | "Sommet";
  elevation: string;
  svgPath: string;
  co2Saved: string;
  destinationStation: string;
};

type Props = {
  cityName: string;
  hikes: Hike[];
};

export default function CityPageContent({ cityName, hikes }: Props) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedScenery, setSelectedScenery] = useState<string>("All");

  // Filtering Logic
  const filteredHikes = hikes.filter((hike) => {
    const diffMatch = selectedDifficulty === "All" || hike.difficulty === selectedDifficulty;
    const scenMatch = selectedScenery === "All" || hike.scenery === selectedScenery;
    return diffMatch && scenMatch;
  });

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      {/* Breadcrumb Navigation */}
      <nav className="mx-auto max-w-4xl px-4 sm:px-6 mb-6 text-xs text-slate-400 flex items-center gap-2" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-[color:var(--color-brand-orange)] transition">
          Accueil
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/randos-sans-voiture" className="hover:text-[color:var(--color-brand-orange)] transition">
          Randos sans voiture
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-slate-800 font-semibold">Départs de {cityName}</span>
      </nav>

      {/* Page Heading */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl tracking-tight mb-3">
          Randonnées sans voiture depuis <span className="text-[color:var(--color-brand-orange)] font-black">{cityName}</span>
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Sélection d'itinéraires de randonnées nature accessibles en train (TER, Transilien) et navettes locales au départ de la gare de {cityName}. Randonnez sereinement avec le GPS hors-ligne et la Sécurité Retour de Névé.
        </p>
      </div>

      {/* Search & Interactive Planner Panel */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-12">
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🔍</span> Planificateur express : trouvez votre sentier idéal
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Scenery filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Type de Paysage
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "Forêt", "Lac", "Sommet"].map((scenery) => (
                  <button
                    key={scenery}
                    onClick={() => setSelectedScenery(scenery)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedScenery === scenery
                        ? "bg-[color:var(--color-brand-orange)] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    {scenery === "All" ? "Tous" : scenery}
                  </button>
                ))}
              </div>
            </div>

            {/* Level filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Niveau de Difficulté
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "Facile", "Moyen", "Difficile"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedDifficulty === level
                        ? "bg-[color:var(--color-brand-orange)] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    {level === "All" ? "Tous" : level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count text */}
          <div className="mt-4 text-xs text-gray-400 font-medium text-right">
            {filteredHikes.length} randonnée{filteredHikes.length > 1 ? "s" : ""} trouvée{filteredHikes.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Hike Cards Grid */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-20">
        {filteredHikes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-slate-400 font-semibold mb-2 text-lg">Aucun sentier ne correspond à ces critères</p>
            <button
              onClick={() => {
                setSelectedDifficulty("All");
                setSelectedScenery("All");
              }}
              className="text-[color:var(--color-brand-orange)] font-bold text-sm hover:underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {filteredHikes.map((hike, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-lg transition duration-200 ease-in-out overflow-hidden flex flex-col h-full"
              >
                {/* Visual Elevation Curve backdrop */}
                <div className="relative h-28 bg-slate-950 flex items-end">
                  <div className="absolute top-3 right-3 bg-slate-900/60 text-white rounded-md px-2 py-0.5 text-[9px] font-bold border border-slate-800">
                    📈 Dénivelé : {hike.elevation}
                  </div>
                  {/* SVG elevation curve */}
                  <svg className="w-full h-16 pointer-events-none opacity-80" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-brand-orange)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--color-brand-orange)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={hike.svgPath}
                      fill="none"
                      stroke="var(--color-brand-orange)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d={`${hike.svgPath} L 400 100 L 0 100 Z`}
                      fill={`url(#grad-${index})`}
                    />
                  </svg>
                  {/* Scenery tag absolute position */}
                  <span className="absolute bottom-2 left-3 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-[color:var(--color-brand-orange)] text-white shadow-xs">
                    🏞️ {hike.scenery}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
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
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                      🌱 -{hike.co2Saved}kg CO2
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{hike.name}</h3>
                  {/* Description */}
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow">
                    {hike.description}
                  </p>
                  {/* Transit Details */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-brand-orange)] mb-1">
                      🚃 Liaison Aller-Retour
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                      {hike.transit}
                    </p>
                  </div>
                  {/* Trainline CTA Link */}
                  <a
                    href={`https://www.trainline.fr/search/${cityName.toLowerCase()}/${hike.destinationStation.toLowerCase()}?utm_source=neve&utm_medium=affiliate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[color:var(--color-brand-orange)] hover:bg-[color:var(--color-brand-orange-hover)] text-white text-xs font-bold shadow-xs transition duration-150 cursor-pointer text-center"
                  >
                    Réserver sur Trainline
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Local FAQ Section for that city */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-20 border-t border-gray-100 pt-16">
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Randonner sans voiture depuis {cityName} : comment faire ?
        </h3>
        <div className="space-y-6 text-sm text-gray-600">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">⏱️ Quel est le temps d'accès moyen en TER ?</h4>
            <p className="text-xs leading-relaxed">
              La plupart de nos sentiers au départ de la gare de {cityName} débutent à moins de 1h30 de train régional (TER). Nous intégrons des randonnées dont la gare d'arrivée donne un accès direct (à pied ou via navette locale) au départ du sentier.
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">🎒 Comment se passe la planification sur Névé ?</h4>
            <p className="text-xs leading-relaxed">
              Sélectionnez votre itinéraire, achetez vos billets TER pré-remplis sur Trainline en 1 clic et téléchargez le tracé GPS hors-ligne. Sur le sentier, laissez-vous guider et profitez : notre système d'alerte sécurité retour calcule votre vitesse et vous prévient s'il est temps de hâter le pas pour ne pas manquer votre bus ou train retour.
            </p>
          </div>
        </div>
      </div>

      {/* Carbon Impact Comparison block (for GEO/E-E-A-T) */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-20">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-emerald-950 mb-3 flex items-center gap-2">
            <span>🌱</span> Randonner sans voiture : Bon pour le climat
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed mb-4">
            Selon les données de l'éco-comparateur de l'<strong>ADEME</strong> (Agence de la transition écologique), le train régional (TER) émet environ <strong>2,4 g de CO2</strong> par passager par kilomètre, contre plus de <strong>190 g de CO2/km</strong> pour une voiture thermique individuelle moyenne. 
          </p>
          <div className="grid gap-4 sm:grid-cols-2 text-center">
            <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100">
              <div className="text-xs text-slate-500 font-medium font-sans">Voiture individuelle</div>
              <div className="text-2xl font-black text-rose-600 mt-1">190g <span className="text-xs font-normal font-sans">CO2 / km</span></div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100">
              <div className="text-xs text-slate-500 font-medium font-sans">Train régional (TER)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">2,4g <span className="text-xs font-normal font-sans">CO2 / km</span></div>
            </div>
          </div>
          <p className="text-[10px] text-emerald-700/80 text-center mt-4 italic">
            Source : Base Carbone ADEME - Données de comparaison d'émissions de gaz à effet de serre.
          </p>
        </div>
      </div>

      {/* CRO Conversion Box */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Backdrop Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-[color:var(--color-brand-orange)] to-transparent opacity-10 pointer-events-none" />
          
          <h2 className="text-2xl font-bold text-white mb-4 md:text-3xl leading-tight">
            Débloquez le tracé GPS et marchez en toute sérénité
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8">
            Téléchargez l'application mobile Névé. Affichez les cartes topographiques 100% hors-ligne, réservez vos billets TER pré-remplis sur Trainline et activez la "Sécurité Retour" pour marcher l'esprit libre.
          </p>

          <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center gap-4">
            {/* App Store button */}
            <a
              className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-150 text-gray-900 shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
              href="#download-ios-seo"
            >
              <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.11.09 2.24-.55 2.94-1.39z"/>
              </svg>
              <div className="text-left leading-none">
                <p className="text-[9px] text-gray-500">Télécharger sur l'</p>
                <p className="text-xs font-semibold font-sans">App Store</p>
              </div>
            </a>
            
            {/* Google Play button */}
            <a
              className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-150 text-gray-900 shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
              href="#download-android-seo"
            >
              <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 24 24">
                <path d="M3 5.27v13.46c0 .87.69 1.45 1.5 1.45.28 0 .54-.08.79-.24l11.16-6.45-3.12-3.12L3 5.27zm18.23 5.8L17.76 8.9l-2.78 2.78 2.78 2.78 3.47-2.01c.75-.43.75-1.13 0-1.58zM4.53 3.53C4.28 3.37 4.02 3.3 3.75 3.3c-.81 0-1.5.58-1.5 1.45l9.28 9.28 3.09-3.09L4.53 3.53zm9.09 11.23l-3.09-3.09L1.25 20.95c.25.16.51.24.78.24.81 0 1.5-.58 1.5-1.45l10.09-5.83-2.18-2.18z"/>
              </svg>
              <div className="text-left leading-none">
                <p className="text-[9px] text-gray-500">Disponible sur</p>
                <p className="text-xs font-semibold font-sans">Google Play</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
