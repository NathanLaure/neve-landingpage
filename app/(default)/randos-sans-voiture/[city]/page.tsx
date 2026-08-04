import { notFound } from "next/navigation";
import CustomLink from "@/components/ui/link";
import HikeGrid from "@/components/hike-grid";
import EscapeCity from "@/components/escape-city";
import { geocodePlace, slugToPlaceQuery } from "@/lib/geocode";
import { getHikesNearby, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";
import { formatDistance, formatDuration } from "@/lib/format-hike";

// Renders on demand for any place name in the URL — no static param list, no
// build-time freeze. New rows added to Supabase show up on the next request.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  const place = await geocodePlace(slugToPlaceQuery(city));
  if (!place) return {};

  return {
    title: `Randonnées autour de ${place.name} - Névé`,
    description: `Sélection d'itinéraires de randonnée autour de ${place.name}, avec distance, dénivelé et durée précis. Partez explorer l'esprit tranquille avec Névé.`,
    alternates: {
      canonical: `https://neve-rando.fr/randos-sans-voiture/${city.toLowerCase()}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  // Resolves ANY place name in the URL to coordinates via Mapbox geocoding —
  // there is no hardcoded city list. Unresolvable slugs (typos, non-places) 404.
  const place = await geocodePlace(slugToPlaceQuery(city));

  if (!place) {
    notFound();
  }

  const { hikes, error } = await getHikesNearby({
    lat: place.lat,
    lng: place.lng,
    radiusKm: DEFAULT_HIKE_RADIUS_KM,
    limit: 30,
  });

  const exploreHref = `/explorer?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.name)}`;

  // Generate Google-compliant Rich Snippet Schema (JSON-LD)
  const websiteUrl = "https://neve-rando.fr"; // placeholder brand url
  const pageUrl = `${websiteUrl}/randos-sans-voiture/${city.toLowerCase()}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": websiteUrl },
          { "@type": "ListItem", "position": 2, "name": `Randonnées autour de ${place.name}`, "item": pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#hikeslist`,
        "name": `Sélection de randonnées autour de ${place.name}`,
        "numberOfItems": hikes.length,
        "itemListElement": hikes.map((hike, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Trip",
            "name": hike.title,
            "touristType": "Randonneur",
            "distance": formatDistance(hike.distance_km),
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "seller": { "@type": "Organization", "name": "Névé" },
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Combien de temps durent les randonnées autour de ${place.name} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                hikes.length > 0
                  ? `Les itinéraires autour de ${place.name} durent en moyenne ${formatDuration(
                      hikes.reduce((sum, h) => sum + h.duration_minutes, 0) / hikes.length
                    )}, avec des options adaptées à tous les niveaux.`
                  : `Névé référence des itinéraires de randonnée de toutes durées autour de ${place.name}.`,
            },
          },
          {
            "@type": "Question",
            "name": "Comment retrouver le tracé GPS complet d'une randonnée ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le tracé GPS complet, téléchargeable hors-ligne, est disponible dans l'application mobile Névé pour chaque itinéraire.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Breadcrumb + Hero */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-12">
        <nav className="mb-5 text-xs text-slate-400 flex items-center gap-1.5" aria-label="Fil d'Ariane">
          <CustomLink href="/" className="hover:text-[color:var(--color-brand-orange)] transition">Accueil</CustomLink>
          <span className="text-slate-300">/</span>
          <CustomLink href="/randos-sans-voiture" className="hover:text-[color:var(--color-brand-orange)] transition">Randos sans voiture</CustomLink>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-semibold">{place.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl tracking-tight mb-3 leading-tight">
              Randonnées autour de <span className="text-[color:var(--color-brand-orange)]">{place.name}</span>
            </h1>
            <p className="font-satoshi text-[#525252] text-[16px] max-w-xl leading-relaxed font-medium">
              {hikes.length > 0
                ? `${hikes.length} itinéraire${hikes.length > 1 ? "s" : ""} référencé${hikes.length > 1 ? "s" : ""} par Névé dans un rayon de ${DEFAULT_HIKE_RADIUS_KM} km autour de ${place.name}, avec distance, dénivelé et durée calculés à partir du tracé GPS réel de chaque sentier.`
                : `Nous n'avons pas encore de randonnée référencée autour de ${place.name}. La base s'enrichit régulièrement, revenez bientôt.`}
            </p>
          </div>

          <CustomLink
            href={exploreHref}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition duration-150 cursor-pointer flex-shrink-0"
          >
            🗺️ Voir sur la carte interactive
          </CustomLink>
        </div>
      </div>

      {/* Hike Grid */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-20">
        {error ? (
          <div className="text-center py-16 border border-dashed border-rose-200 rounded-2xl bg-rose-50">
            <p className="text-rose-600 font-bold mb-1 text-sm">Impossible de charger les randonnées</p>
            <p className="text-rose-500/80 text-xs">Réessayez dans quelques instants.</p>
          </div>
        ) : hikes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 font-semibold text-sm mb-2">Aucune randonnée à proximité pour le moment</p>
            <CustomLink href="/explorer" className="text-[color:var(--color-brand-orange)] font-bold text-xs hover:underline">
              Explorer toutes les randonnées Névé
            </CustomLink>
          </div>
        ) : (
          <HikeGrid hikes={hikes} />
        )}
      </div>

      {/* Testimonials */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-20">
        <EscapeCity cityName={place.name} layout="full" />
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16 mb-20">
        <h2 className="text-xl font-bold text-slate-900 mb-5">Randonner autour de {place.name}</h2>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-1 text-sm">📍 Comment sont sélectionnés ces itinéraires ?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Les randonnées affichées sont triées par proximité autour de {place.name}, avec distance, dénivelé et durée calculés à partir du tracé GPS réel de chaque sentier.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-1 text-sm">🎒 Comment accéder au tracé GPS complet ?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ouvrez la fiche d'une randonnée pour voir sa description complète, puis téléchargez le tracé GPS hors-ligne depuis l'application mobile Névé.
            </p>
          </div>
        </div>
      </div>

      {/* CRO Conversion Box */}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 mb-24">
        <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-[color:var(--color-brand-orange)] to-transparent opacity-10 pointer-events-none" />
          <h2 className="text-2xl font-bold md:text-3xl mb-3 relative z-10">Débloquez le tracé GPS</h2>
          <p className="font-satoshi text-slate-300 text-[16px] mb-6 leading-relaxed font-medium max-w-xl mx-auto relative z-10">
            Téléchargez l'application Névé pour afficher les cartes 100% hors-ligne et randonner sans stress de réseau.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <a href="#download-ios-seo" className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold transition duration-150">
              Télécharger pour iOS
            </a>
            <a href="#download-android-seo" className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold transition duration-150">
              Télécharger pour Android
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
