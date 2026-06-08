export default function ProblemSection() {
  return (
    <section className="bg-white py-12 md:py-20 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Vouloir s'évader sans voiture : <br />
            <span className="text-[color:var(--color-brand-orange)] font-extrabold">une logistique infernale.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Vous rêvez de grand air pour couper du rythme urbain. Mais sans voiture personnelle, chaque sortie ressemble à un parcours du combattant logistique.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="relative p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-lg transition duration-200 ease-in-out">
            <div className="w-10 h-10 rounded-lg bg-[color:var(--color-brand-orange-light)] flex items-center justify-center text-[color:var(--color-brand-orange)] mb-4">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Bloqué en ville le week-end ?</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               La location de voiture est hors de prix, l'autopartage saturé, et vos proches véhiculés ne sont pas toujours libres. Résultat : vous passez vos dimanches sur le béton au lieu des sommets.
             </p>
           </div>
 
           {/* Card 2 */}
           <div className="relative p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-lg transition duration-200 ease-in-out">
             <div className="w-10 h-10 rounded-lg bg-[color:var(--color-brand-orange-light)] flex items-center justify-center text-[color:var(--color-brand-orange)] mb-4">
               <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
               </svg>
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">L'enfer des correspondances</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               Trouver le bon TER, dénicher la fiche horaire introuvable du bus local, et faire concorder le tout avec le départ du sentier... Vous y passez des heures d'organisation fastidieuses.
             </p>
           </div>
 
           {/* Card 3 */}
           <div className="relative p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-lg transition duration-200 ease-in-out">
             <div className="w-10 h-10 rounded-lg bg-[color:var(--color-brand-orange-light)] flex items-center justify-center text-[color:var(--color-brand-orange)] mb-4">
               <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Le nez rivé sur votre montre</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               Difficile de déconnecter quand on stresse en marchant de peur de louper l'unique bus retour du dimanche soir. Si vous le ratez, vous restez coincé au pied de la montagne.
             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
