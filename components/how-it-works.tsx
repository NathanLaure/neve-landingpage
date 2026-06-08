export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-12 md:py-20 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            L'aventure en 4 étapes simples, <br />
            <span className="text-[color:var(--color-brand-orange)] font-extrabold">sans le stress logistique.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Névé prend en charge toute l'organisation complexe pour que vous n'ayez qu'à profiter du grand air.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Step Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block z-0" />

          <div className="grid gap-8 md:grid-cols-4 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-brand-orange)] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Filtrez par temps d'accès</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Trouvez des randonnées prêtes à l'emploi selon leur temps de trajet réel en train (ex: "à moins de 2h de Lyon").
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-brand-orange)] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Générez l'itinéraire complet</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Névé calcule instantanément la meilleure combinaison entre le train régional et le bus local jusqu'au début de la rando.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-brand-orange)] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Réservez en 1 clic</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Névé pré-remplit votre trajet et ouvre directement l'app Trainline avec vos tarifs et abonnements pour acheter vos billets.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-brand-orange)] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Marchez l'esprit libre</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Déconnectez. L'application compare votre position GPS aux horaires théoriques et vous alerte s'il faut hâter le pas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
