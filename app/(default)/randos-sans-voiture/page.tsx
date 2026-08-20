import CustomLink from "@/components/ui/link";
import { HIKE_HUBS } from "@/lib/hike-hubs";
import { countHikesNearby, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";
import { geocodePlace } from "@/lib/geocode";

// Without this, Next prerenders the "N itinéraires" counts once at build time
// and freezes them — new rows added to Supabase wouldn't show up until the
// next deploy. Hourly ISR keeps them live without querying on every request.
export const revalidate = 3600;

export const metadata = {
  title: "Randonnées en Alpes-de-Haute-Provence - Névé",
  description:
    "Découvrez notre sélection de randonnées autour de Digne-les-Bains, Sisteron, Manosque, Castellane, Forcalquier et Barcelonnette.",
  alternates: {
    canonical: "https://www.neve-rando.fr/randos-sans-voiture",
  },
};

export default async function HubPage() {
  const hubsWithCounts = await Promise.all(
    HIKE_HUBS.map(async (hub) => {
      const place = await geocodePlace(hub.name);
      const hikesCount = place
        ? await countHikesNearby({ lat: place.lat, lng: place.lng, radiusKm: DEFAULT_HIKE_RADIUS_KM })
        : 0;
      return { ...hub, hikesCount };
    })
  );

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      {/* Hero Header */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--color-brand-orange-light)] text-[color:var(--color-brand-orange)] text-xs font-bold uppercase tracking-wider mb-4">
          🌲 Rando Zéro Carbone
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl tracking-tight mb-6 leading-tight">
          Trouvez votre prochaine <br className="max-md:hidden" />
          <span className="text-[color:var(--color-brand-orange)] font-black">randonnée en Haute-Provence</span>
        </h1>
        <p className="font-satoshi text-[#525252] text-[18px] max-w-2xl mx-auto leading-relaxed font-medium">
          Sélectionnez votre zone de départ et découvrez des sentiers planifiés par Névé, entre Préalpes, Gorges du Verdon et vallée de l'Ubaye.
        </p>
        <CustomLink
          href="/explorer"
          className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition duration-150 cursor-pointer"
        >
          🗺️ Explorer toutes les randonnées sur la carte
        </CustomLink>
      </div>

      {/* Hubs Grid */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hubsWithCounts.map((hub) => (
            <CustomLink
              key={hub.slug}
              href={`/randos-sans-voiture/${hub.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 ease-in-out min-h-[260px] cursor-pointer"
            >
              {/* Background gradient mask on hover */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-50 opacity-50 group-hover:opacity-100 transition duration-300" />

              {/* Colored tag bar */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${hub.accent}`} />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                    🏞️ {hub.tagline}
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--color-brand-orange)]">
                    {hub.hikesCount} itinéraire{hub.hikesCount > 1 ? "s" : ""}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[color:var(--color-brand-orange)] transition duration-150 mb-3">
                  Autour de {hub.name}
                </h3>

                <p className="font-satoshi text-[#525252] text-[18px] leading-relaxed font-medium">
                  {hub.description}
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
            <h2 className="text-2xl font-bold md:text-3xl mb-4">Pourquoi randonner avec Névé ?</h2>
            <p className="font-satoshi text-slate-300 text-[18px] mb-8 leading-relaxed font-medium">
              Névé référence des itinéraires réels, avec tracé GPS, dénivelé et distance précis, pour préparer votre prochaine sortie en toute confiance.
            </p>
            <div className="grid gap-6 sm:grid-cols-3 text-left">
              <div>
                <div className="text-xl mb-1">🗺️</div>
                <h4 className="font-bold text-sm text-white mb-1">Sentiers vérifiés</h4>
                <p className="text-xs text-slate-400">
                  Distance, dénivelé positif et négatif calculés à partir du tracé réel de chaque itinéraire.
                </p>
              </div>
              <div>
                <div className="text-xl mb-1">📍</div>
                <h4 className="font-bold text-sm text-white mb-1">Autour de vous</h4>
                <p className="text-xs text-slate-400">
                  Les itinéraires sont triés par proximité autour de chaque zone de départ.
                </p>
              </div>
              <div>
                <div className="text-xl mb-1">📲</div>
                <h4 className="font-bold text-sm text-white mb-1">Hors-ligne sur l'app</h4>
                <p className="text-xs text-slate-400">
                  Téléchargez le tracé GPS complet et randonnez en toute sécurité, même sans réseau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
