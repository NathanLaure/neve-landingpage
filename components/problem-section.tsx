export default function ProblemSection() {
  return (
    <section className="bg-gray-50/50 py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#05966904_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[color:var(--color-brand-orange)] text-xs font-bold uppercase tracking-wider mb-4 border border-orange-100 shadow-2xs">
            ⚠️ Le problème
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            S'évader sans voiture : <br />
            <span className="text-[color:var(--color-brand-orange)]">une logistique infernale.</span>
          </h2>
          <p className="mt-4 text-[#525252] text-[18px] font-medium max-w-xl mx-auto leading-relaxed font-satoshi">
            Vous rêvez de grand air pour couper du rythme de la ville. Mais sans voiture personnelle, chaque sortie ressemble à un casse-tête organisationnel.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="relative p-7 rounded-3xl border border-gray-200/60 bg-white shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[color:var(--color-brand-orange)] flex items-center justify-center mb-6 shadow-sm border border-orange-100/50">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Bloqué en ville le week-end ?
            </h3>
            <p className="text-[#525252] text-[18px] font-medium leading-relaxed font-satoshi">
              La location de voiture est hors de prix, l'autopartage saturé, et vos proches véhiculés ne sont pas toujours libres. Résultat : vous passez vos dimanches sur le béton au lieu des sommets sauvages.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative p-7 rounded-3xl border border-gray-200/60 bg-white shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[color:var(--color-brand-green)] flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              L'enfer des correspondances
            </h3>
            <p className="text-[#525252] text-[18px] font-medium leading-relaxed font-satoshi">
              Trouver le bon TER, dénicher la fiche horaire introuvable du bus régional, et faire concorder le tout avec le début du sentier... Vous y passez des heures d'organisation fastidieuses sur 4 sites différents.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative p-7 rounded-3xl border border-gray-200/60 bg-white shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-sm border border-rose-100/50">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Le nez rivé sur votre montre
            </h3>
            <p className="text-[#525252] text-[18px] font-medium leading-relaxed font-satoshi">
              Difficile de déconnecter quand on stresse en marchant de peur de louper l'unique bus de retour du dimanche soir. Si vous le ratez, vous restez coincé au pied de la montagne sans solution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
