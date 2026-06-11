"use client";

import { useState } from "react";

export default function EcoComparison() {
  const [distance, setDistance] = useState<number>(80); // Distance in km (one-way)

  // CO2 Data (from ADEME: Train = 2.4g/km, Car = 190g/km)
  const carCo2 = Math.round((distance * 2 * 190) / 1000);
  const trainCo2 = Math.round((distance * 2 * 2.4) / 1000 * 10) / 10;
  const co2Saved = Math.round((carCo2 - trainCo2) * 10) / 10;

  // Cost Data (Estimation: Car = Rental/Amortization + Fuel + Toll; Train = TER ticket with discounts)
  const carCost = Math.round(40 + distance * 2 * 0.22); // €40 base rental/wear + fuel per km
  const trainCost = Math.round(15 + distance * 0.08); // €15 base TER tickets with standard subscription

  return (
    <section className="bg-white py-16 md:py-24 relative">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100 shadow-xs">
            🌳 Impact & Liberté
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            Train vs Voiture : <br className="max-sm:hidden" />
            <span className="text-[color:var(--color-brand-green)]">Le comparatif sans filtre</span>
          </h2>
          <p className="mt-4 text-[#525252] text-[18px] font-medium max-w-xl mx-auto leading-relaxed font-satoshi">
            Randonner en train n'est pas seulement écologique. C'est plus économique, infiniment moins stressant et cela offre une liberté de tracé inégalée.
          </p>
        </div>

        {/* Distance Slider Panel */}
        <div className="mx-auto max-w-4xl bg-gray-50 border border-gray-150 rounded-3xl p-6 md:p-8 shadow-xs mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ajustez la distance de votre micro-aventure :</h3>
              <p className="text-xs text-slate-400 mt-1">Distance aller-simple depuis votre ville de départ</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-[color:var(--color-brand-green)] font-mono">
                {distance}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">km</span>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">({distance * 2} km aller-retour)</span>
            </div>
          </div>
          
          <input
            type="range"
            min="20"
            max="250"
            step="10"
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>20 km (Proche banlieue)</span>
            <span>120 km (Moyenne montagne)</span>
            <span>250 km (Alpes lointaines)</span>
          </div>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          {/* Car Side */}
          <div className="border border-red-100 bg-red-50/20 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-red-100 mb-6">
                <h4 className="text-base font-extrabold text-red-950 flex items-center gap-2">
                  <span>🚗</span> En voiture individuelle
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-100 text-red-700 uppercase">
                  Contraintes logistiques
                </span>
              </div>

              {/* CO2 stat */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Empreinte Carbone</span>
                  <span className="font-mono text-red-700">{carCo2} kg CO2</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: "95%" }} />
                </div>
              </div>

              {/* Cost stat */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Coût approximatif</span>
                  <span className="font-mono text-red-700">~{carCost} €</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">Location ou amortissement + Carburant + Péages autoroute</p>
              </div>

              {/* Stress level / Comfort */}
              <div className="bg-white/80 border border-red-100/55 rounded-2xl p-4 mb-4">
                <h5 className="text-xs font-bold text-red-950 mb-1 flex items-center gap-1.5">
                  <span>🤯</span> Niveau de Stress & Charge Mentale
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conduire dans les embouteillages du dimanche soir, trouver une place au départ du sentier bondé, payer le parking, risquer les pannes.
                </p>
              </div>
            </div>

            {/* Loop constraint */}
            <div className="bg-red-900/5 border border-red-200/50 rounded-2xl p-4 text-left">
              <h5 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                <span>🔄</span> Contrainte de boucle obligatoire
              </h5>
              <p className="text-[11px] text-red-800/80 leading-relaxed">
                Vous devez impérativement retourner à votre point de départ exact pour récupérer la voiture garée. Impossible d'explorer d'autres versants.
              </p>
            </div>
          </div>

          {/* Train Side */}
          <div className="border border-emerald-200 bg-emerald-50/20 rounded-3xl p-6 flex flex-col justify-between shadow-xs ring-2 ring-emerald-500/10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100 mb-6">
                <h4 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                  <span>🚄</span> Avec Névé & le Train
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                  Liberté totale
                </span>
              </div>

              {/* CO2 stat */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Empreinte Carbone</span>
                  <span className="font-mono text-emerald-700">{trainCo2} kg CO2</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(5, (trainCo2/carCo2)*100)}%` }} />
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                  <span>🌱</span> Économie de {co2Saved} kg de CO2 !
                </div>
              </div>

              {/* Cost stat */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Tarif billet TER</span>
                  <span className="font-mono text-emerald-700">~{trainCost} €</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">Tarif pré-rempli Trainline (intégrant abonnements/cartes de réduction)</p>
              </div>

              {/* Stress level / Comfort */}
              <div className="bg-white/80 border border-emerald-100/50 rounded-2xl p-4 mb-4">
                <h5 className="text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <span>☕</span> Sérénité & Temps pour Soi
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Profitez du voyage : lisez un livre, écoutez des podcasts, discutez, faites une sieste. Zéro stress de parking ou de fatigue routière.
                </p>
              </div>
            </div>

            {/* Loop freedom */}
            <div className="bg-emerald-600 text-white rounded-2xl p-4 text-left shadow-xs">
              <h5 className="text-xs font-bold mb-1 flex items-center gap-1.5">
                <span>🛤️</span> L'Atout Traversée (Rando Linéaire)
              </h5>
              <p className="text-[11px] text-emerald-100 leading-relaxed">
                Partez de la Gare A, marchez sur les crêtes et redescendez vers la Gare B sur un autre versant. Névé gère les billets multi-gares pour doubler la beauté de vos parcours !
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
