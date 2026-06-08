"use client";

export default function ValueProposition() {
  return (
    <section className="bg-neve-beige py-16 md:py-24 border-b border-gray-150/45 text-slate-900 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center pb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-neve-forest text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200 shadow-2xs">
            🌟 Plus-value express
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Comment Névé réinvente <br className="max-sm:hidden" />
            <span className="text-neve-forest">l'aventure sans voiture</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Névé lève tous les obstacles de logistique pour vous reconnecter au grand air en quelques clics.
          </p>
        </div>

        {/* 3 Pillars Grid (Scrapbook style with thick borders & offset shadows) */}
        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          
          {/* Pillar 1 */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-1deg] hover:rotate-0 transition-all duration-300 flex flex-col justify-between group">
            <div>
              {/* Graphic Icon Area */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-slate-900 flex items-center justify-center mb-6 text-2xl group-hover:scale-105 transition-transform duration-200">
                🚂
              </div>
              
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block mb-2">
                Zéro Voiture • Liaison Directe
              </span>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                Accès Gare-à-Sentier
              </h3>
              
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Névé ne s'arrête pas à la gare. L'application calcule instantanément les correspondances optimales entre les TER régionaux et les réseaux de navettes locales pour vous déposer au plus près du départ des sentiers.
              </p>
            </div>

            {/* Custom SVG sketch */}
            <div className="mt-8 pt-4 border-t border-slate-100/60 flex items-center justify-center">
              <svg className="w-full h-12 stroke-slate-400 fill-none" viewBox="0 0 200 50">
                <rect x="10" y="15" width="30" height="20" rx="4" strokeWidth="1.5" />
                <circle cx="20" cy="35" r="3" />
                <circle cx="30" cy="35" r="3" />
                <path d="M 40 25 L 80 25" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 80 25 C 90 15, 100 35, 110 25 S 120 15, 130 25" strokeWidth="1.5" />
                <path d="M 130 25 L 160 25" strokeWidth="1.5" strokeDasharray="4 4" />
                <polygon points="175,10 160,35 190,35" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[1deg] hover:rotate-0 transition-all duration-300 flex flex-col justify-between group">
            <div>
              {/* Graphic Icon Area */}
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border-2 border-slate-900 flex items-center justify-center mb-6 text-2xl group-hover:scale-105 transition-transform duration-200">
                ⏱️
              </div>
              
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-700 block mb-2">
                Zéro Stress • Horaires sous Contrôle
              </span>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                Sécurité Retour Active
              </h3>
              
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Marchez l'esprit 100% libre. L'algorithme Névé surveille votre vitesse de progression par GPS. S'il détecte un retard important menaçant votre correspondance de train, l'app vous alerte pour presser le pas ou faire demi-tour.
              </p>
            </div>

            {/* Custom SVG sketch */}
            <div className="mt-8 pt-4 border-t border-slate-100/60 flex items-center justify-center">
              <svg className="w-full h-12 stroke-slate-400 fill-none" viewBox="0 0 200 50">
                <circle cx="100" cy="25" r="16" strokeWidth="1.5" />
                <path d="M 100 13 L 100 25 L 110 25" strokeWidth="1.5" />
                <path d="M 30 25 L 75 25" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 125 25 L 170 25" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 65 15 L 75 25 L 65 35" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-0.5deg] hover:rotate-0 transition-all duration-300 flex flex-col justify-between group">
            <div>
              {/* Graphic Icon Area */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-slate-900 flex items-center justify-center mb-6 text-2xl group-hover:scale-105 transition-transform duration-200">
                🛤️
              </div>
              
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-700 block mb-2">
                Zéro Compromis • Tracés Linéaires
              </span>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                Traversées de Gare à Gare
              </h3>
              
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Ne soyez plus obligé de boucler votre tracé pour revenir à votre voiture garée. Avec Névé et le train, partez d'une Gare A, franchissez le sommet et redescendez tranquillement vers une Gare B. Multipliez vos panoramas par deux !
              </p>
            </div>

            {/* Custom SVG sketch */}
            <div className="mt-8 pt-4 border-t border-slate-100/60 flex items-center justify-center">
              <svg className="w-full h-12 stroke-slate-400 fill-none" viewBox="0 0 200 50">
                <circle cx="25" cy="25" r="5" strokeWidth="1.5" />
                <text x="22" y="28" className="font-bold text-[8px] stroke-none fill-slate-500">A</text>
                
                <path d="M 30 25 Q 70 5, 100 25 T 170 25" strokeWidth="1.5" strokeDasharray="3 2" />
                
                <circle cx="175" cy="25" r="5" strokeWidth="1.5" />
                <text x="172" y="28" className="font-bold text-[8px] stroke-none fill-slate-500">B</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
