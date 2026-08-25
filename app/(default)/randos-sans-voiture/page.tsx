/* Renomme : `Map` masquerait le constructeur `Map` de JavaScript. */
import { Map as MapIcon } from "lucide-react";
import CustomLink from "@/components/ui/link";
import Button from "@/components/ui/button";
import { HIKE_HUBS } from "@/lib/hike-hubs";
import { countHikesNearby, getAllHikes, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";
import { geocodePlace } from "@/lib/geocode";

// Without this, Next prerenders the "N itinéraires" counts once at build time
// and freezes them — new rows added to Supabase wouldn't show up until the
// next deploy. Hourly ISR keeps them live without querying on every request.
export const revalidate = 3600;

export const metadata = {
  title: "Randonnées accessibles sans voiture",
  description:
    "Les itinéraires de randonnée référencés par Névé, classés par ville de départ. Distance, dénivelé et durée calculés sur le tracé GPS réel, pour partir en train plutôt qu'en voiture.",
  alternates: {
    canonical: "https://www.neve-rando.fr/randos-sans-voiture",
  },
};

export default async function HubPage() {
  /* Le catalogue entier, pour le compte affiche : les colonnes de liste
     suffisent, et la page est gardee une heure. */
  const { hikes: all } = await getAllHikes({ limit: 2000 });
  const totalHikes = all.length;

  const hubsWithCounts = await Promise.all(
    HIKE_HUBS.map(async (hub) => {
      const place = await geocodePlace(hub.name);
      const hikesCount = place
        ? await countHikesNearby({ lat: place.lat, lng: place.lng, radiusKm: DEFAULT_HIKE_RADIUS_KM })
        : 0;
      return { ...hub, hikesCount };
    })
  );

  /* Regroupement par région, dans l'ordre où les villes sont déclarées : c'est
     l'ordre éditorial, et il vaut mieux qu'un tri alphabétique. */
  const regions = Array.from(
    hubsWithCounts.reduce((acc, hub) => {
      acc.set(hub.region, [...(acc.get(hub.region) ?? []), hub]);
      return acc;
    }, new Map<string, typeof hubsWithCounts>()),
  );

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      {/* Hero Header */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--color-brand-orange-light)] text-[color:var(--color-brand-orange)] text-xs font-bold uppercase tracking-wider mb-4">
          Randonner sans voiture
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl tracking-tight mb-6 leading-tight">
          Trouvez votre prochaine <br className="max-md:hidden" />
          <span className="text-[color:var(--color-brand-orange)] font-black">randonnée sans voiture</span>
        </h1>
        {/* Le chapeau porte le compte réel du catalogue plutôt qu'une région :
            c'est un fait vérifiable, et il vaut mieux que la promesse qu'il
            remplaçait. */}
        <p className="font-satoshi text-[#525252] text-[18px] max-w-2xl mx-auto leading-relaxed font-medium">
          Névé référence <strong>{totalHikes} itinéraires</strong> dont le départ est atteignable
          en train ou en transports. Distance, dénivelé et durée sont calculés sur le tracé GPS
          réel de chaque sentier. Choisissez une ville de départ, ou ouvrez la carte.
        </p>

        <div className="mt-6 flex justify-center">
          <Button href="/explorer" variant="secondary" className="gap-2">
            <MapIcon className="size-4" aria-hidden />
            Explorer sur la carte
          </Button>
        </div>
      </div>

      {/*
        * Groupé par région.
        *
        * Le catalogue tient sur deux ensembles nets — l'Île-de-France et les
        * Alpes-du-Sud — et les aligner sans distinction laissait croire à une
        * couverture uniforme du territoire. Dire où l'on est dense est plus
        * utile que de le taire.
        */}
      {regions.map(([region, hubs]) => (
      <div key={region} className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{region}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub) => (
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
      ))}

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
