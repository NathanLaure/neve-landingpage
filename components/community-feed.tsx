"use client";

import { useState, useEffect } from "react";

type Activity = {
  id: string;
  user: string;
  avatar: string;
  timeAgo: string;
  title: string;
  route: string;
  distance: string;
  elevation: string;
  co2Saved: number;
  kudos: number;
  comment: string;
  sceneryEmoji: string;
};

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    user: "Maxime Dubois",
    avatar: "MD",
    timeAgo: "Il y a 2 heures",
    title: "Crêt de la Perdrix par le Bessat",
    route: "Gare de Saint-Chamond 🚄",
    distance: "14.5 km",
    elevation: "+650 m",
    co2Saved: 24,
    kudos: 42,
    comment: "Première rando sans voiture de la saison. Le bus navette du Pilat était parfaitement synchronisé avec le TER depuis Lyon Part-Dieu. Sentier magnifique et vue imprenable !",
    sceneryEmoji: "🏔️"
  },
  {
    id: "act-2",
    user: "Clara Martin",
    avatar: "CM",
    timeAgo: "Il y a 5 heures",
    title: "Gorges de Franchard en forêt",
    route: "Fontainebleau-Avon 🚄",
    distance: "12.0 km",
    elevation: "+120 m",
    co2Saved: 22,
    kudos: 29,
    comment: "Déconnexion totale à moins de 45 minutes de Paris. Idéal avec les enfants pour grimper sur les rochers de Fontainebleau. Trainline a bien géré nos billets RER/Transilien.",
    sceneryEmoji: "🌲"
  },
  {
    id: "act-3",
    user: "Julien Bernard",
    avatar: "JB",
    timeAgo: "Hier",
    title: "Les Trois Calanques de Cassis",
    route: "Gare de Cassis 🚄",
    distance: "11.2 km",
    elevation: "+380 m",
    co2Saved: 31,
    kudos: 68,
    comment: "Le passage des falaises d'En-Vau est incroyable. La baignade à Port-Pin à mi-chemin fait un bien fou. La Sécurité Retour m'a bipé juste à temps pour ne pas rater le bus retour !",
    sceneryEmoji: "🌊"
  }
];

export default function CommunityFeed() {
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [totalCo2, setTotalCo2] = useState<number>(14242.4);
  const [clappedIds, setClappedIds] = useState<Record<string, boolean>>({});

  // Global CO2 counter increment simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalCo2((prev) => prev + 0.1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleKudos = (id: string) => {
    if (clappedIds[id]) return; // Limit to 1 clap per session for simplicity
    
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          return { ...act, kudos: act.kudos + 1 };
        }
        return act;
      })
    );
    setClappedIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100 shadow-xs">
            👥 Communauté active
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            Rejoignez le mouvement <br className="max-sm:hidden" />
            <span className="text-[color:var(--color-brand-green)]">Rando Zéro Carbone</span>
          </h2>
          <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            Découvrez les dernières sorties partagées par nos utilisateurs et mesurez notre impact écologique commun en direct.
          </p>
        </div>

        {/* Global CO2 Savings Counter */}
        <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl mb-12 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-radial-gradient from-[color:var(--color-brand-green)] to-transparent opacity-10 pointer-events-none" />
          
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
            🌱 Impact Global de la Communauté Névé
          </h3>
          
          {/* Animated counter number */}
          <div className="text-3xl md:text-5xl font-black font-sans text-white tracking-tight flex items-center justify-center gap-1 my-3">
            <span className="font-mono">{totalCo2.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
            <span className="text-emerald-400">kg</span>
          </div>
          
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            d'émissions de CO2 économisées ce mois-ci par rapport aux trajets équivalents en voiture individuelle.
          </p>
        </div>

        {/* Feed Posts Grid */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span>🔥</span> Activités récentes (Live feed)
          </h3>

          {activities.map((act) => {
            const hasClapped = clappedIds[act.id];
            return (
              <div
                key={act.id}
                className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs hover:border-emerald-300 transition duration-200"
              >
                {/* Header: User avatar & Name */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-[color:var(--color-brand-green)]">
                      {act.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-none">{act.user}</h4>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">{act.timeAgo}</span>
                    </div>
                  </div>

                  <span className="text-xl">{act.sceneryEmoji}</span>
                </div>

                {/* Hike Title & Route info */}
                <div className="mb-3">
                  <h5 className="text-sm font-extrabold text-slate-900">{act.title}</h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <span>🚉</span> Itinéraire : {act.route}
                  </p>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100/60">
                  <div className="text-[11px] font-bold text-slate-600 px-2.5 py-1 rounded-md bg-white shadow-2xs">
                    📏 {act.distance}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 px-2.5 py-1 rounded-md bg-white shadow-2xs">
                    📈 D+ : {act.elevation}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 px-2.5 py-1 rounded-md bg-emerald-50 shadow-2xs border border-emerald-100">
                    🌱 -{act.co2Saved} kg CO2
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  "{act.comment}"
                </p>

                {/* Action row (Kudos Strava style) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {/* Star Rating display */}
                  <div className="flex text-amber-400 gap-0.5" aria-label="Note de 5 étoiles">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>

                  {/* Kudos button */}
                  <button
                    onClick={() => handleKudos(act.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                      hasClapped
                        ? "bg-orange-50 text-[color:var(--color-brand-orange)] font-bold scale-[1.02]"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className={`inline-block ${hasClapped ? "animate-bounce" : ""}`}>🧡</span>
                    <span>Kudos</span>
                    <span className="font-mono bg-white/80 border border-slate-200/50 rounded-md px-1.5 py-0.2 text-[10px]">
                      {act.kudos}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
