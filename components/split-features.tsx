"use client";

export default function SplitFeatures() {
  return (
    <div className="bg-neve-beige text-slate-900 w-full overflow-hidden">
      
      {/* SECTION 1: Planifier l'itinéraire parfait */}
      <section className="py-16 md:py-24 relative border-b border-gray-150/45">
        <div className="absolute inset-0 bg-[radial-gradient(#4c6a1705_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left side: Text & CTA */}
            <div className="max-w-xl pr-0 md:pr-8">
              <span className="text-[10px] uppercase font-black tracking-wider text-neve-forest block mb-3">
                🗺️ Planificateur multi-transports
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-none">
                Planifiez l'itinéraire parfait
              </h2>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-8">
                Que vous recherchiez des sentiers plats en sous-bois pour vos balades en famille, des singletracks techniques pour vos trails, ou des chemins de terre stabilisés pour vos escapades en Gravel, Névé combine intelligemment les trains régionaux (TER) et les navettes locales. Obtenez un itinéraire continu, sans rupture et 100% sans voiture.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#download-ios"
                  className="px-6 py-3 rounded-full bg-neve-forest hover:bg-neve-forest-hover text-white font-bold text-xs shadow-md transition duration-150 cursor-pointer"
                >
                  Inscrivez-vous gratuitement
                </a>
                <span className="text-xs text-slate-400 font-bold">
                  ou{" "}
                  <a href="#download-ios" className="text-neve-forest hover:underline">
                    Téléchargez l'App
                  </a>
                </span>
              </div>
            </div>

            {/* Right side: Scrapbook Card Composition */}
            <div className="relative flex items-center justify-center min-h-[380px]">
              
              {/* Hand-drawn Purple/Indigo Wave */}
              <div className="absolute top-0 left-6 text-emerald-600 opacity-60 select-none">
                <svg className="w-12 h-6 fill-none stroke-current" viewBox="0 0 48 24" strokeWidth="2.5">
                  <path d="M0 12 Q 6 4 12 12 T 24 12 T 36 12 T 48 12" />
                  <path d="M0 18 Q 6 10 12 18 T 24 18 T 36 18 T 48 18" />
                </svg>
              </div>

              {/* Hand-drawn Station A Tag (Lyon Part-Dieu) */}
              <div className="absolute top-10 right-8 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[4deg] z-30 flex items-center gap-2 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-slate-900" />
                <span className="font-serif italic font-black text-xs text-slate-800 tracking-wide">
                  Gare Part-Dieu 🚄
                </span>
              </div>

              {/* Overlapping Hike Photo Card */}
              <div className="absolute top-6 left-6 w-64 h-48 rounded-3xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-3deg] z-20 transition-all hover:rotate-0 duration-300">
                <div className="w-full h-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
              </div>

              {/* Hand-drawn Station B Tag (Le Bessat / Pilat) */}
              <div className="absolute bottom-16 left-2 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[-2deg] z-30 flex items-center gap-2 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 border border-slate-900" />
                <span className="font-serif italic font-black text-xs text-slate-800 tracking-wide">
                  Crêt de la Perdrix ⛰️
                </span>
              </div>

              {/* Mock Map Board */}
              <div className="w-80 h-80 rounded-[2rem] bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-4.5 z-10 flex flex-col justify-between mt-20 ml-20 rotate-[2deg] hover:rotate-0 transition-transform duration-300">
                {/* Simulated map graphic */}
                <div className="w-full h-full bg-[#f2efe9] rounded-2xl relative overflow-hidden border-2 border-slate-900/60 flex items-center justify-center">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5dec9_1px,transparent_1px),linear-gradient(to_bottom,#e5dec9_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  
                  {/* Topographic Lines simulated in SVG */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-400/25" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="40" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="60" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="85" strokeWidth="0.8" />
                  </svg>

                  {/* Hand-drawn Route trail connecting A and B */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-900 fill-none" viewBox="0 0 200 200">
                    <path d="M 40 160 Q 60 120 110 130 T 150 70 T 170 30" strokeWidth="3.5" strokeLinecap="round" />
                    
                    <circle cx="40" cy="160" r="6.5" className="fill-emerald-600 stroke-slate-900 stroke-2" />
                    <text x="50" y="166" className="fill-slate-900 font-extrabold text-[8px] font-serif italic">Départ (A)</text>
                    
                    <circle cx="170" cy="30" r="6.5" className="fill-orange-600 stroke-slate-900 stroke-2" />
                    <text x="135" y="32" className="fill-slate-900 font-extrabold text-[8px] font-serif italic">Arrivée (B)</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Navigation plus efficace */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-neve-beige border-b border-gray-150/45">
        <div className="absolute inset-0 bg-[radial-gradient(#05966904_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left side: Scrapbook Card Composition */}
            <div className="relative flex items-center justify-center min-h-[380px] order-last md:order-first">
              
              {/* Main Hiker Photo with Scrapbook framing */}
              <div className="relative w-80 h-96 rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] z-10 rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
              </div>

              {/* Hand-drawn Navigation bubble (Now Turn Right) */}
              <div className="absolute bottom-10 right-2 bg-neve-beige border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-4deg] z-25 flex flex-col max-w-[210px] select-none">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-slate-900 flex items-center justify-center text-slate-800 font-bold">
                    <svg className="w-5 h-5 fill-none stroke-slate-900" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guidage GPS</div>
                    <div className="font-serif italic font-extrabold text-xs text-slate-900 leading-tight mt-0.5">
                      Tourner à droite
                    </div>
                    <div className="text-[9px] font-bold text-emerald-700 mt-1">dans 50 m</div>
                  </div>
                </div>
              </div>

              {/* Hand-drawn Secondary Alert (Then arrow) */}
              <div className="absolute top-12 left-0 bg-neve-beige border-2 border-slate-900 rounded-xl px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[5deg] z-25 flex items-center gap-2 select-none">
                <span className="text-[10px] font-bold text-slate-400">Puis :</span>
                <span className="font-serif italic font-black text-xs text-slate-900 flex items-center gap-1.5">
                  Sentier des crêtes 🌲
                </span>
              </div>
            </div>

            {/* Right side: Text & CTA */}
            <div className="max-w-xl pl-0 md:pl-8">
              <span className="text-[10px] uppercase font-black tracking-wider text-neve-forest block mb-3">
                📶 Cartes Hors-Ligne & Guidage
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-none">
                Navigation plus efficace
              </h2>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-8">
                Même hors des sentiers battus, Névé vous garde sur la bonne voie. Avec la navigation vocale étape par étape et les cartes topographiques 100% hors-ligne, vous restez concentré sur le paysage, sans craindre les zones blanches de réseau. Névé surveille vos coordonnées GPS en tâche de fond pour garantir un retour sécurisé.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#download-ios"
                  className="px-6 py-3 rounded-full bg-neve-forest hover:bg-neve-forest-hover text-white font-bold text-xs shadow-md transition duration-150 cursor-pointer"
                >
                  Inscrivez-vous gratuitement
                </a>
                <span className="text-xs text-slate-400 font-bold">
                  ou{" "}
                  <a href="#download-ios" className="text-neve-forest hover:underline">
                    Téléchargez l'App
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
