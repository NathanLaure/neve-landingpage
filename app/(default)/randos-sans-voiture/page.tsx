import CustomLink from "@/components/ui/link";

export const metadata = {
  title: "Randonnées sans voiture au départ de votre métropole - Névé",
  description: "Découvrez notre sélection de randonnées accessibles en train (TER) et bus locaux depuis Paris, Lyon, Grenoble, Marseille, Bordeaux et Strasbourg. Partez l'esprit tranquille.",
  alternates: {
    canonical: "https://neve-app.com/randos-sans-voiture",
  },
};

const CITIES = [
  {
    slug: "paris",
    name: "Paris",
    hikesCount: 3,
    description: "Échappez-vous dans les denses forêts de Fontainebleau, de Rambouillet ou de la Vallée de Chevreuse en moins de 45 minutes de train.",
    scenery: "Forêt & Lacs",
    accent: "from-amber-500 to-orange-600",
  },
  {
    slug: "lyon",
    name: "Lyon",
    hikesCount: 3,
    description: "Prenez de la hauteur dans le Parc Naturel Régional du Pilat, explorez les Monts d'Or ou respirez l'air pur des balcons de la Chartreuse.",
    scenery: "Sommets & Forêts",
    accent: "from-orange-500 to-red-600",
  },
  {
    slug: "grenoble",
    name: "Grenoble",
    hikesCount: 3,
    description: "Le paradis de la rando alpine sans voiture : rejoignez directement le Vercors, Belledonne ou la Chartreuse grâce aux bus de montagne.",
    scenery: "Haute Montagne & Lacs",
    accent: "from-rose-500 to-orange-600",
  },
  {
    slug: "marseille",
    name: "Marseille",
    hikesCount: 3,
    description: "Randonnez le long des falaises calcaires des Calanques ou grimpez la mythique montagne Sainte-Victoire peinte par Cézanne.",
    scenery: "Mer & Sommets",
    accent: "from-orange-500 to-amber-600",
  },
  {
    slug: "bordeaux",
    name: "Bordeaux",
    hikesCount: 2,
    description: "Parcourez la crête de la Dune du Pilat ou profitez du calme sauvage et de l'ombre de la pinède entourant le grand lac de Lacanau.",
    scenery: "Dunes & Lacs",
    accent: "from-yellow-500 to-orange-600",
  },
  {
    slug: "strasbourg",
    name: "Strasbourg",
    hikesCount: 2,
    description: "Explorez les ruines romantiques des châteaux d'Alsace et les mystères du Mur Païen sur le massif des Vosges.",
    scenery: "Forêt & Châteaux",
    accent: "from-red-500 to-orange-600",
  },
];

export default function HubPage() {
  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      {/* Hero Header */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--color-brand-orange-light)] text-[color:var(--color-brand-orange)] text-xs font-bold uppercase tracking-wider mb-4">
          🌲 Rando Zéro Carbone
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl tracking-tight mb-6 leading-tight">
          Trouvez votre randonnée <br className="max-md:hidden" />
          <span className="text-[color:var(--color-brand-orange)] font-black">accessible sans voiture</span>
        </h1>
        <p className="font-satoshi text-[#525252] text-[18px] max-w-2xl mx-auto leading-relaxed font-medium">
          Sélectionnez votre métropole de départ et découvrez des sentiers sauvages planifiés par Névé. TER, bus de montagne locaux et sécurité retour inclus dans votre poche.
        </p>
      </div>

      {/* Cities Grid */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <CustomLink
              key={city.slug}
              href={`/randos-sans-voiture/${city.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 ease-in-out min-h-[260px] cursor-pointer"
            >
              {/* Background gradient mask on hover */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-50 opacity-50 group-hover:opacity-100 transition duration-300" />
              
              {/* Colored tag bar */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${city.accent}`} />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                    🏞️ {city.scenery}
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--color-brand-orange)]">
                    {city.hikesCount} itinéraires
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[color:var(--color-brand-orange)] transition duration-150 mb-3">
                  Depuis {city.name}
                </h3>
                
                <p className="font-satoshi text-[#525252] text-[18px] leading-relaxed font-medium">
                  {city.description}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[16px] font-bold text-slate-900 group-hover:text-[color:var(--color-brand-orange)] transition duration-150">
                <span>Voir les randonnées</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition duration-150"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </CustomLink>
          ))}
        </div>
      </div>

      {/* Global Benefit Banner */}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 mb-24">
        <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-[color:var(--color-brand-orange)] to-transparent opacity-10 pointer-events-none" />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold md:text-3xl mb-4">Pourquoi randonner sans voiture avec Névé ?</h2>
            <p className="font-satoshi text-slate-300 text-[18px] mb-8 leading-relaxed font-medium">
              En moyenne, voyager en train régional (TER) émet 95% de CO2 de moins qu'en voiture individuelle. Névé lève le dernier obstacle à la déconnexion en gérant automatiquement toute la logistique train + bus.
            </p>
            <div className="grid gap-6 sm:grid-cols-3 text-left">
              <div>
                <div className="text-xl mb-1">🚄</div>
                <h4 className="font-bold text-sm text-white mb-1">Liaison Gare-à-Sentier</h4>
                <p className="text-xs text-slate-400">
                  Nous recherchons et calculons les correspondances avec les navettes et bus locaux.
                </p>
              </div>
              <div>
                <div className="text-xl mb-1">🎟️</div>
                <h4 className="font-bold text-sm text-white mb-1">1 Clic Trainline</h4>
                <p className="text-xs text-slate-400">
                  Tous vos trajets sont pré-remplis sur l'application Trainline pour une commande facile.
                </p>
              </div>
              <div>
                <div className="text-xl mb-1">⏱️</div>
                <h4 className="font-bold text-sm text-white mb-1">Sécurité Anti-Retard</h4>
                <p className="text-xs text-slate-400">
                  L'application vous alerte s'il est temps de faire demi-tour pour attraper votre train retour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
