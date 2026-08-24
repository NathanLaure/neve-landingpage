import { Suspense } from "react";
import ExplorerMapView from "@/components/explorer-map-view";
import { getHikesNearby } from "@/lib/hikes";
import { parseRadius } from "@/lib/explorer-filters";

export const metadata = {
  title: "Explorer les randonnées - Névé",
  description:
    "Explorez toutes les randonnées référencées par Névé sur une carte interactive : distance, dénivelé, difficulté et tracé GPS.",
  alternates: {
    canonical: "https://www.neve-rando.fr/explorer",
  },
};

// Fully dynamic: the hikes list must reflect rows added to Supabase immediately.
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ lat?: string; lng?: string; name?: string; radius?: string }>;
};

/*
 * Vue par defaut, faute de lieu demande : Paris plutot que le centre
 * geographique de la France, ou il n'y a rien. 359 des 923 randonnees sont en
 * Ile-de-France, c'est donc le cadre qui en montre le plus d'emblee.
 */
const DEFAULT_VIEW: { lat: number; lng: number } = { lat: 48.8566, lng: 2.3522 };

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const lat = params.lat ? parseFloat(params.lat) : null;
  const lng = params.lng ? parseFloat(params.lng) : null;
  const hasLocation = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);

  /*
   * `null` vaut « depuis le marqueur » : on garde le centre pour la carte et on
   * cesse de borner la recherche. Sans lieu du tout, c'est aussi ce qu'on fait.
   */
  const radiusKm = parseRadius(params.radius);

  /*
   * Sans lieu explicite, le serveur ne charge rien : c'est le client qui
   * demandera le cadre visible dès que la carte s'est posée. Lui faire envoyer
   * les 923 randonnées serait payer un catalogue entier pour n'en afficher
   * qu'un écran — et cette page n'a pas de rôle de référencement qui
   * justifierait de tout exposer.
   *
   * Un lien qui nomme un lieu et un rayon reste servi côté serveur : il promet
   * un contenu précis, et l'attendre d'un aller-retour client le ferait
   * clignoter.
   */
  const { hikes, error } =
    hasLocation && radiusKm !== null
      ? await getHikesNearby({ lat: lat as number, lng: lng as number, radiusKm, limit: 1000 })
      : { hikes: [], error: null };

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-light text-brand-dark">Chargement...</div>}>
      <ExplorerMapView
        areaName={params.name}
        radiusKm={radiusKm}
        hasLocation={hasLocation}
        hikes={hikes}
        fetchError={error}
        centerLat={hasLocation ? (lat as number) : DEFAULT_VIEW.lat}
        centerLng={hasLocation ? (lng as number) : DEFAULT_VIEW.lng}
      />
    </Suspense>
  );
}
