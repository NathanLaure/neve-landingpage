export default function FeaturesNeve() {
  return (
    <section id="features" className="relative before:absolute before:inset-0 before:-z-20 before:bg-slate-950">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[color:var(--color-brand-orange)] opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Toute la logistique montagne <br />
              <span className="text-[color:var(--color-brand-orange)] font-extrabold">dans votre poche.</span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Conçu spécifiquement pour lever tous les obstacles à l'aventure sans voiture.
            </p>
          </div>

          {/* Central Train-Mountain SVG Illustration */}
          <div className="pb-16 md:pb-20" data-aos="zoom-y-out">
            <div className="flex justify-center">
              <div className="relative w-full max-w-[500px] aspect-video bg-slate-900/40 rounded-2xl border border-slate-800 p-6 overflow-hidden flex items-center justify-center">
                {/* SVG Illustration */}
                <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <g stroke="#1e293b" strokeWidth="0.5">
                    <line x1="0" y1="50" x2="400" y2="50" />
                    <line x1="0" y1="100" x2="400" y2="100" />
                    <line x1="0" y1="150" x2="400" y2="150" />
                    <line x1="100" y1="0" x2="100" y2="200" />
                    <line x1="200" y1="0" x2="200" y2="200" />
                    <line x1="300" y1="0" x2="300" y2="200" />
                  </g>
                  
                  {/* Mountain silhouettes */}
                  <path d="M220 180 L290 80 L350 180 Z" fill="#1e293b" opacity="0.5" />
                  <path d="M260 180 L330 60 L400 180 Z" fill="#0f172a" />
                  <path d="M305 100 L330 60 L355 100 Z" fill="#ffffff" opacity="0.8" />
                  <path d="M265 115 L290 80 L310 115 Z" fill="#ffffff" opacity="0.6" />

                  {/* City representation (Gare) */}
                  <rect x="20" y="120" width="60" height="60" rx="4" fill="#1e293b" />
                  <path d="M30 120 L30 180 M50 120 L50 180 M70 120 L70 180" stroke="#334155" strokeWidth="2" />
                  <circle cx="50" cy="140" r="8" fill="var(--color-brand-orange)" opacity="0.2" />
                  <circle cx="50" cy="140" r="3" fill="var(--color-brand-orange)" />

                  {/* Route path (dashed line) */}
                  <path d="M50 150 Q 120 180 180 120 T 300 120" stroke="var(--color-brand-orange)" strokeWidth="3" strokeDasharray="6 4" className="animate-[line_6s_infinite_linear]" />

                  {/* Train Trainline dot moving */}
                  <circle cx="50" cy="150" r="6" fill="#ffffff" stroke="var(--color-brand-orange)" strokeWidth="2">
                    <animateMotion dur="6s" repeatCount="indefinite" path="M 0 0 Q 70 30 130 -30 T 250 -30" />
                  </circle>

                  {/* Labels */}
                  <text x="35" y="110" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Gare Ville</text>
                  <text x="270" y="50" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Sommet Névé</text>
                  <text x="135" y="190" fill="var(--color-brand-orange)" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Lien Trainline connecté</text>
                </svg>

                {/* Micro alert badges float */}
                <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  TER 84892 : À l'heure
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-[color:var(--color-brand-orange)] flex items-center gap-1.5 shadow-sm font-semibold">
                  <span>⏱️ Sécurité Retour Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-slate-800 *:before:[block-size:100vh] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] *:after:absolute *:after:bg-slate-800 *:after:[block-size:1px] *:after:[inline-size:100vw] *:after:[inset-block-start:-1px] *:after:[inset-inline-start:0] md:*:p-10">
            {/* Feature 1 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8zm2-8h12v8H6V8zm-2 12h16v2H4v-2z" />
                </svg>
                <span>TER + Bus locaux combinés</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Ne vous arrêtez pas à la gare. Névé calcule les liaisons avec les navettes de montagne locales pour vous déposer au plus près des sentiers.
              </p>
            </article>

            {/* Feature 2 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
                <span>Partenariat Trainline direct</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Aucun surcoût ni frais caché. Profitez de vos abonnements et cartes de réduction habituels directement sur Trainline en un clic.
              </p>
            </article>

            {/* Feature 3 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                <span>Alerte anti-retard active</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                L'algorithme calcule votre vitesse de marche GPS en temps réel. Si vous traînez trop, Névé vous alerte pour adapter votre rythme.
              </p>
            </article>

            {/* Feature 4 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M20.5 3h-17A1.5 1.5 0 0 0 2 4.5v15A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 20.5 3zM12 6a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 11.5c-2.33 0-4.31-1.17-5.46-2.95a6.95 6.95 0 0 1 10.92 0c-1.15 1.78-3.13 2.95-5.46 2.95z" />
                </svg>
                <span>Cartes topographiques hors-ligne</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Ne craignez plus les zones blanches. Les cartes topographiques et les horaires de bus clés restent accessibles sans aucun réseau.
              </p>
            </article>

            {/* Feature 5 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <span>Filtre \"Temps de Train\"</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Trouvez instantanément la rando idéale selon la durée du voyage en TER depuis votre ville de départ (ex: \"à moins de 1h30\").
              </p>
            </article>

            {/* Feature 6 */}
            <article>
              <h3 className="mb-2 flex items-center space-x-2 font-medium text-white">
                <svg className="fill-[color:var(--color-brand-orange)]" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.83 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span>Partage logistique groupé</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Partagez le trajet en un clic avec vos amis. Ils cliquent, réservent les mêmes trains et vous rejoignent directement dans le wagon.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
