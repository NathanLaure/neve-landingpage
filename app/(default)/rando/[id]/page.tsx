import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHikeById } from "@/lib/hikes";
import { formatDistance, formatDuration } from "@/lib/format-hike";
import RandoDetailClient from "./RandoDetailClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { hike } = await getHikeById(id);

  if (!hike) {
    return {
      title: "Randonnée introuvable - Névé",
      description: "La randonnée demandée est introuvable.",
    };
  }

  const title = `${hike.title} - Randonnée sans voiture | Névé`;
  const description = `${hike.title} à ${hike.location_name || "France"} : distance ${formatDistance(
    hike.distance_km
  )}, dénivelé +${hike.elevation_gain_m}m, durée estimée ${formatDuration(
    hike.duration_minutes
  )}. Itinéraire accessible en train.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://neve-rando.fr/rando/${hike.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://neve-rando.fr/rando/${hike.id}`,
      images: hike.cover_image_url ? [{ url: hike.cover_image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: hike.cover_image_url ? [hike.cover_image_url] : [],
    },
  };
}

export default async function RandoPage({ params }: Props) {
  const { id } = await params;
  const { hike, error } = await getHikeById(id);

  if (error || !hike) {
    notFound();
  }

  return <RandoDetailClient hike={hike} />;
}
