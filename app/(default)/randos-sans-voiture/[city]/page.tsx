import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CustomLink from "@/components/ui/link";
import HikeGrid from "@/components/hike-grid";
import EscapeCity from "@/components/escape-city";
import { geocodePlace, slugToPlaceQuery } from "@/lib/geocode";
import { getHikesNearby, countHikesNearby, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";
import { computeCityStats, spellDuration } from "@/lib/city-stats";
import { formatDistance } from "@/lib/format-hike";

const SITE_URL = "https://www.neve-rando.fr";

/*
 * Rendu à la demande, puis gardé une heure.
 *
 * La page était en `force-dynamic` : chaque passage d'un robot rejouait le
 * géocodage et la requête Supabase, pour un contenu qui ne bouge qu'au rythme
 * des ajouts en base. Une heure de cache rend la page instantanée sans jamais
 * la figer, et les lignes nouvelles apparaissent au pire soixante minutes plus
 * tard.
 */
export const revalidate = 3600;

/** Les six villes où le catalogue est dense sont construites d'avance. */
export function generateStaticParams() {
  return ["paris", "lyon", "grenoble", "marseille", "bordeaux", "strasbourg"].map((city) => ({
    city,
  }));
}

type Props = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const place = await geocodePlace(slugToPlaceQuery(city));

  /* Un slug qu'on ne sait pas résoudre mène à un 404 : autant le dire aux
     robots plutôt que de leur servir une page sans titre. */
  if (!place) {
    return { title: "Lieu introuvable - Névé", robots: { index: false, follow: false } };
  }

  /* Un comptage, pas une page de resultats : la description n'a besoin que
     du nombre, et le plafond de 30 le rendait faux des que la zone en portait
     davantage. */
  const total = await countHikesNearby({
    lat: place.lat,
    lng: place.lng,
    radiusKm: DEFAULT_HIKE_RADIUS_KM,
  });

  const url = `${SITE_URL}/randos-sans-voiture/${city.toLowerCase()}`;
  const title = `Randonnées autour de ${place.name} accessibles en train`;
  /* La description porte le compte réel : c'est ce que l'extrait de résultat
     affiche, et un nombre y fait plus qu'une promesse. */
  const description =
    total > 0
      ? `${total} itinéraires de randonnée dans un rayon de ${DEFAULT_HIKE_RADIUS_KM} km autour de ${place.name}, avec distance, dénivelé et durée calculés sur le tracé GPS réel. Départs accessibles sans voiture.`
      : `Névé référence les randonnées accessibles en transports autour de ${place.name}. Distance, dénivelé et durée calculés sur le tracé GPS réel.`;

  return {
    title,
    description,
    /*
     * Une page sans randonnée n'a rien à indexer.
     *
     * Le catalogue est aujourd'hui concentré sur l'Île-de-France : Lyon,
     * Grenoble, Marseille, Bordeaux et Strasbourg rendent une page vide. Les
     * laisser indexer reviendrait à peupler Google de pages creuses au nom du
     * site entier. `follow` reste, pour que les liens qu'elles portent
     * continuent d'être suivis.
     */
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Névé",
      locale: "fr_FR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
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

  /*
   * Tout ce que le rayon contient, et non les trente premières.
   *
   * Le plafond de trente faisait annoncer « 30 itinéraires » quel que soit le
   * lieu : un chiffre faux dès que la zone en porte davantage, et c'est
   * précisément le genre de nombre qu'un moteur génératif reprend tel quel.
   * Cinq cents couvre le pire cas — l'Île-de-France en compte trois cent
   * cinquante-neuf — et la page est mise en cache une heure.
   */
  const { hikes, error } = await getHikesNearby({
    lat: place.lat,
    lng: place.lng,
    radiusKm: DEFAULT_HIKE_RADIUS_KM,
    limit: 500,
  });

  /* Affichées : les plus proches. Les autres restent comptées, décrites et
     atteignables par la carte — mais cent cartes de plus n'apprendraient rien
     à personne et alourdiraient la page d'autant. */
  const shownHikes = hikes.slice(0, 48);
  const stats = computeCityStats(hikes);
  const pageUrl = `${SITE_URL}/randos-sans-voiture/${city.toLowerCase()}`;
  const exploreHref = `/explorer?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.name)}`;

  /*
   * Réponses aux questions qu'on pose vraiment, chiffres à l'appui.
   *
   * Elles servent deux fois : rendues en clair plus bas, et déclarées en
   * `FAQPage`. Les deux doivent dire la même chose — une donnée structurée qui
   * n'a pas d'équivalent visible est une donnée que Google ignore, quand il ne
   * la sanctionne pas.
   */
  const faq: { question: string; answer: string }[] = stats
    ? [
        {
          question: `Combien y a-t-il de randonnées autour de ${place.name} ?`,
          answer: `Névé référence ${stats.count} itinéraire${stats.count > 1 ? "s" : ""} dans un rayon de ${DEFAULT_HIKE_RADIUS_KM} km autour de ${place.name}. La plupart mesurent entre ${formatDistance(stats.typicalDistance[0])} et ${formatDistance(stats.typicalDistance[1])} ; le plus court fait ${formatDistance(stats.distanceRange[0])} et le plus long ${formatDistance(stats.distanceRange[1])}.`,
        },
        {
          question: `Quelles randonnées autour de ${place.name} sont accessibles sans voiture ?`,
          answer:
            stats.navigoCount > 0
              ? stats.navigoCount === stats.count
                ? `Tous les ${stats.count} itinéraires partent d'un point couvert par un pass Navigo, donc atteignable en train ou en RER depuis Paris.`
                : `${stats.navigoCount} des ${stats.count} itinéraires partent d'un point couvert par un pass Navigo, donc atteignable en train ou en RER depuis Paris. Les autres demandent un trajet régional.`
              : `Tous les itinéraires listés indiquent leur commune de départ, ce qui permet de vérifier la desserte ferroviaire avant de partir. ${place.name} n'est pas dans la zone du pass Navigo.`,
        },
        {
          question: `Quel est le dénivelé des randonnées autour de ${place.name} ?`,
          answer: `Le dénivelé positif va jusqu'à ${stats.maxElevation} m sur les itinéraires référencés. ${stats.byDifficulty
            .map((entry) => `${entry.count} de difficulté ${entry.label}`)
            .join(", ")}.`,
        },
        {
          question: "Comment obtenir le tracé GPS d'une randonnée ?",
          answer:
            "Chaque fiche affiche le tracé sur la carte. L'application mobile Névé permet de le télécharger pour l'utiliser hors connexion, y compris là où le réseau ne passe pas.",
        },
      ]
    : [
        {
          question: `Y a-t-il des randonnées autour de ${place.name} ?`,
          answer: `Aucun itinéraire n'est encore référencé dans un rayon de ${DEFAULT_HIKE_RADIUS_KM} km autour de ${place.name}. Le catalogue s'étend régulièrement ; la carte interactive permet de chercher au-delà de ce rayon.`,
        },
      ];

  /*
   * Données structurées.
   *
   * `TouristTrip` plutôt que `Trip`, et des `QuantitativeValue` plutôt que des
   * chaînes déjà mises en forme : « 12,4 km » ne se compare pas, `12.4` avec
   * son unité si. L'ancienne version déclarait aussi une `Offer` à zéro euro,
   * ce qui annonçait un produit gratuit là où il n'y a rien à vendre.
   */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Randos sans voiture",
            item: `${SITE_URL}/randos-sans-voiture`,
          },
          { "@type": "ListItem", position: 3, name: place.name, item: pageUrl },
        ],
      },
      {
        "@type": "Place",
        "@id": `${pageUrl}#place`,
        name: place.name,
        geo: {
          "@type": "GeoCoordinates",
          latitude: place.lat,
          longitude: place.lng,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#hikes`,
        name: `Randonnées autour de ${place.name}`,
        numberOfItems: shownHikes.length,
        itemListElement: shownHikes.map((hike, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/rando/${hike.id}`,
          item: {
            "@type": "TouristTrip",
            "@id": `${SITE_URL}/rando/${hike.id}#trip`,
            name: hike.title,
            url: `${SITE_URL}/rando/${hike.id}`,
            touristType: "Randonneur",
            distance: {
              "@type": "QuantitativeValue",
              value: hike.distance_km,
              unitCode: "KMT",
            },
            ...(hike.duration_minutes
              ? { estimatedDuration: `PT${Math.round(hike.duration_minutes)}M` }
              : {}),
            itinerary: {
              "@type": "Place",
              name: hike.location_name || place.name,
              geo: {
                "@type": "GeoCoordinates",
                latitude: hike.start_lat,
                longitude: hike.start_lng,
              },
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Breadcrumb + Hero */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-10">
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

            {/*
              * Le premier paragraphe répond, il n'annonce pas.
              *
              * C'est celui que les moteurs génératifs citent : il porte donc le
              * compte, les bornes de distance et de durée, et la desserte —
              * autant de faits vérifiables plutôt qu'une intention.
              */}
            <p className="font-satoshi text-[#525252] text-[16px] max-w-2xl leading-relaxed font-medium">
              {stats ? (
                <>
                  Névé référence <strong>{stats.count} itinéraires</strong> dans un rayon de{" "}
                  {DEFAULT_HIKE_RADIUS_KM} km autour de {place.name}, la plupart entre{" "}
                  {formatDistance(stats.typicalDistance[0])} et{" "}
                  {formatDistance(stats.typicalDistance[1])}, pour des durées de{" "}
                  {spellDuration(stats.durationRange[0])} à {spellDuration(stats.durationRange[1])}.
                  Distance, dénivelé et durée sont calculés sur le tracé GPS réel de chaque sentier.
                  {stats.navigoCount > 0 && (
                    <>
                      {" "}
                      {stats.navigoCount === stats.count ? "Tous" : stats.navigoCount} partent d’un
                      point couvert par un pass Navigo.
                    </>
                  )}
                </>
              ) : (
                <>
                  Aucun itinéraire n’est encore référencé dans un rayon de {DEFAULT_HIKE_RADIUS_KM} km
                  autour de {place.name}. Le catalogue s’étend régulièrement, et la carte interactive
                  permet de chercher au-delà de ce rayon.
                </>
              )}
            </p>
          </div>

          <CustomLink
            href={exploreHref}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition duration-150 cursor-pointer flex-shrink-0"
          >
            Voir sur la carte interactive
          </CustomLink>
        </div>
      </div>

      {/* Chiffres clés — les mêmes que ceux du paragraphe, en lecture rapide. */}
      {stats && (
        <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-12">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Itinéraires", value: String(stats.count) },
              {
                label: "Du plus court au plus long",
                value: `${formatDistance(stats.distanceRange[0])} – ${formatDistance(stats.distanceRange[1])}`,
              },
              {
                label: "Durées",
                value: `${spellDuration(stats.durationRange[0])} – ${spellDuration(stats.durationRange[1])}`,
              },
              { label: "Dénivelé max", value: `${stats.maxElevation} m` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="font-satoshi text-xs font-medium text-slate-500">{item.label}</dt>
                <dd className="font-bricolage text-xl font-bold text-slate-900 mt-1">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Hike Grid */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-20">
        {/* Le compte affiché diffère du compte annoncé dès qu'il y a plus de
            quarante-huit itinéraires : le taire laisserait croire que la page
            se contredit. */}
        {stats && stats.count > shownHikes.length && (
          <p className="font-satoshi text-sm text-slate-500 mb-5">
            Les {shownHikes.length} itinéraires les plus proches sur {stats.count}.{" "}
            <CustomLink
              href={exploreHref}
              className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
            >
              Voir les autres sur la carte
            </CustomLink>
          </p>
        )}
        <h2 className="sr-only">Liste des itinéraires autour de {place.name}</h2>
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
          <HikeGrid hikes={shownHikes} />
        )}
      </div>

      {/* Testimonials */}
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16 mb-20">
        <EscapeCity cityName={place.name} layout="full" />
      </div>

      {/* FAQ — le même texte que la donnée structurée, mot pour mot. */}
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16 mb-20">
        <h2 className="text-xl font-bold text-slate-900 mb-5">Randonner autour de {place.name}</h2>
        <div className="space-y-4">
          {faq.map((entry) => (
            <div key={entry.question} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{entry.question}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{entry.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CRO Conversion Box */}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 mb-24">
        <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-[color:var(--color-brand-orange)] to-transparent opacity-10 pointer-events-none" />
          <h2 className="text-2xl font-bold md:text-3xl mb-3 relative z-10">Débloquez le tracé GPS</h2>
          <p className="font-satoshi text-slate-300 text-[16px] mb-6 leading-relaxed font-medium max-w-xl mx-auto relative z-10">
            Téléchargez l&apos;application Névé pour afficher les cartes 100 % hors-ligne et randonner
            sans stress de réseau.
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
