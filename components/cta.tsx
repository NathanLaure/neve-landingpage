"use client";

import Image from "next/image";

export default function Cta() {
  return (
    <section className="bg-neve-beige py-16 md:py-24 text-slate-900 w-full relative">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        
        {/* Top Header Split: Title & CTA vs. Laurel Star Review */}
        <div className="grid gap-8 md:grid-cols-12 items-center mb-12 pb-12 border-b border-gray-200/50">
          
          {/* Left: Title & Buttons */}
          <div className="md:col-span-8 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              Le meilleur planificateur de <br />
              randonnées sans voiture. <br />
              <span className="text-neve-forest">Aussi simple que ça.</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Olive Green Pill Button */}
              <a
                href="#download-ios"
                className="px-6 py-3.5 rounded-full bg-neve-forest hover:bg-neve-forest-hover text-white font-bold text-xs shadow-md transition duration-150 cursor-pointer"
              >
                Inscrivez-vous maintenant
              </a>
              
              {/* App Store Badge */}
              <a
                className="btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition duration-150 w-full sm:w-auto cursor-pointer"
                href="#download-ios-cta"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.11.09 2.24-.55 2.94-1.39z"/>
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[7px] text-gray-400">Télécharger sur l'</p>
                  <p className="text-[10px] font-bold font-sans">App Store</p>
                </div>
              </a>
              
              {/* Google Play Badge */}
              <a
                className="btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition duration-150 w-full sm:w-auto cursor-pointer"
                href="#download-android-cta"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M3 5.27v13.46c0 .87.69 1.45 1.5 1.45.28 0 .54-.08.79-.24l11.16-6.45-3.12-3.12L3 5.27zm18.23 5.8L17.76 8.9l-2.78 2.78 2.78 2.78 3.47-2.01c.75-.43.75-1.13 0-1.58zM4.53 3.53C4.28 3.37 4.02 3.3 3.75 3.3c-.81 0-1.5.58-1.5 1.45l9.28 9.28 3.09-3.09L4.53 3.53zm9.09 11.23l-3.09-3.09L1.25 20.95c.25.16.51.24.78.24.81 0 1.5-.58 1.5-1.45l10.09-5.83-2.18-2.18z"/>
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[7px] text-gray-400">Disponible sur</p>
                  <p className="text-[10px] font-bold font-sans">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Star Review surrounded by Laurel branch outlines */}
          <div className="md:col-span-4 flex items-center justify-center select-none">
            <div className="relative flex flex-col items-center">
              
              {/* Left Laurel Branch SVG */}
              <svg className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-20 stroke-neve-forest fill-none opacity-40" viewBox="0 0 50 100">
                <path d="M 40 90 C 10 70, 10 30, 40 10" strokeWidth="2" strokeLinecap="round" />
                <path d="M 32 75 C 20 70, 18 64, 30 60" strokeWidth="1.5" />
                <path d="M 22 55 C 10 50, 8 44, 20 40" strokeWidth="1.5" />
                <path d="M 28 30 C 18 25, 16 19, 26 15" strokeWidth="1.5" />
              </svg>
              
              {/* Right Laurel Branch SVG */}
              <svg className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-20 stroke-neve-forest fill-none opacity-40" viewBox="0 0 50 100">
                <path d="M 10 90 C 40 70, 40 30, 10 10" strokeWidth="2" strokeLinecap="round" />
                <path d="M 18 75 C 30 70, 32 64, 20 60" strokeWidth="1.5" />
                <path d="M 28 55 C 40 50, 42 44, 30 40" strokeWidth="1.5" />
                <path d="M 22 30 C 32 25, 34 19, 24 15" strokeWidth="1.5" />
              </svg>

              {/* Rating Text */}
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-baseline gap-1">
                4.7 <span className="text-xl text-slate-400">/ 5</span>
              </div>
              
              {/* Five Green Stars */}
              <div className="flex text-neve-forest gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Scrapbook Grid of Stats and Immersive Imagery */}
        <div className="grid gap-6 md:grid-cols-12 items-stretch">
          
          {/* 1. Large panoramic photograph (60% width equivalent) */}
          <div className="md:col-span-7 relative min-h-[240px] rounded-3xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-0.5deg] hover:rotate-0 transition duration-300">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          {/* 2. Middle Square Violet Card */}
          <div className="md:col-span-3 bg-violet-100 border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[1deg] hover:rotate-0 transition duration-300 flex flex-col justify-center text-center">
            <div className="text-3xl font-black text-violet-950 font-mono">10 000+</div>
            <p className="text-xs font-bold text-violet-900 mt-2 leading-relaxed">
              Citadins randonneurs actifs dans la communauté Névé
            </p>
          </div>

          {/* 3. Stacked Side Column Cards */}
          <div className="md:col-span-2 flex flex-col gap-4">
            
            {/* Top Beige Card */}
            <div className="bg-[#f5f3ec] border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[-1.5deg] hover:rotate-0 transition duration-300 flex-1 flex flex-col justify-center text-center">
              <div className="text-xl font-black text-slate-800 font-mono">800+</div>
              <p className="text-[10px] font-bold text-slate-600 mt-1 leading-tight">
                Itinéraires train-to-trail vérifiés
              </p>
            </div>
            
            {/* Bottom Green Card */}
            <div className="bg-emerald-100/60 border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[1deg] hover:rotate-0 transition duration-300 flex-1 flex flex-col justify-center text-center">
              <div className="text-xl font-black text-emerald-950 font-mono">85 000+</div>
              <p className="text-[10px] font-bold text-emerald-900 mt-1 leading-tight">
                Kilomètres de CO2 économisés
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
