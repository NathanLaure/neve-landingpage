import { Suspense } from "react";
import ExplorerMapView from "@/components/explorer-map-view";
import { getAllHikes, getHikesNearby, DEFAULT_HIKE_RADIUS_KM } from "@/lib/hikes";

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
  searchParams: Promise<{ lat?: string; lng?: string; name?: string }>;
};

// Roughly the geographic center of mainland France, used only as a fallback
// map center when no location is given and there happen to be zero hikes.
const FRANCE_CENTER: { lat: number; lng: number } = { lat: 46.6034, lng: 2.2137 };

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const lat = params.lat ? parseFloat(params.lat) : null;
  const lng = params.lng ? parseFloat(params.lng) : null;
  const hasLocation = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);

  const { hikes, error } = hasLocation
    ? await getHikesNearby({ lat: lat as number, lng: lng as number, radiusKm: DEFAULT_HIKE_RADIUS_KM, limit: 100 })
    : await getAllHikes();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-light text-brand-dark">Chargement...</div>}>
      <ExplorerMapView
        areaName={params.name}
        hikes={hikes}
        fetchError={error}
        centerLat={hasLocation ? (lat as number) : FRANCE_CENTER.lat}
        centerLng={hasLocation ? (lng as number) : FRANCE_CENTER.lng}
      />
    </Suspense>
  );
}
