export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 md:py-24 border-b border-gray-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[color:var(--color-brand-green)] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100 shadow-2xs">
            🚶 Le parcours
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            L'aventure en 4 étapes, <br />
            <span className="text-[color:var(--color-brand-green)]">sans le stress logistique.</span>
          </h2>
          <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            Névé prend en charge toute l'organisation complexe pour que vous n'ayez qu'à enfiler vos chaussures et profiter du paysage.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Step Connecting Line (Winding Mountain Trail - Desktop) */}
          <svg 
            className="absolute top-1/2 left-0 w-full h-24 pointer-events-none -translate-y-1/2 hidden md:block z-0 opacity-40" 
            viewBox="0 0 1000 100" 
            fill="none" 
            preserveAspectRatio="none"
          >
            <path 
              d="M 125 50 Q 250 10 375 50 T 625 50 T 875 50" 
              stroke="var(--color-brand-green)" 
              strokeWidth="3.5" 
              strokeDasharray="8 6" 
              fill="none" 
            />
          </svg>
 
          <div className="grid gap-8 md:grid-cols-4 relative z-10">
            {/* Step 1 */}
            <div className="bg-slate-50/50 hover:bg-white p-7 rounded-3xl border border-gray-150 hover:border-emerald-250 shadow-2xs hover:shadow-xl text-center flex flex-col items-center group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-brand-green)] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-emerald-700/10 group-hover:scale-110 transition-transform duration-200">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Filtrez par accès TER</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Trouvez des randonnées prêtes à l'emploi selon leur temps de trajet réel en train (ex: "à moins de 1h30 de Lyon").
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50/50 hover:bg-white p-7 rounded-3xl border border-gray-150 hover:border-emerald-250 shadow-2xs hover:shadow-xl text-center flex flex-col items-center group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-brand-green)] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-emerald-700/10 group-hover:scale-110 transition-transform duration-200">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Générez l'itinéraire</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Névé calcule instantanément la meilleure combinaison entre le train régional (TER) et le bus local jusqu'au début du sentier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50/50 hover:bg-white p-7 rounded-3xl border border-gray-150 hover:border-emerald-250 shadow-2xs hover:shadow-xl text-center flex flex-col items-center group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-brand-green)] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-emerald-700/10 group-hover:scale-110 transition-transform duration-200">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Réservez en 1 clic</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Névé pré-remplit votre trajet et ouvre directement l'application Trainline avec vos tarifs et cartes de réduction habituelles.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50/50 hover:bg-white p-7 rounded-3xl border border-gray-150 hover:border-emerald-250 shadow-2xs hover:shadow-xl text-center flex flex-col items-center group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-brand-orange)] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-orange-700/10 group-hover:scale-110 transition-transform duration-200">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Marchez l'esprit libre</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Déconnectez. L'application compare votre position GPS aux horaires théoriques retour et vous alerte en cas de retard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
