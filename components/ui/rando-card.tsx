"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, Route, TrendingUp, Clock } from "lucide-react";
import type { HikeDifficulty, HikeSummary } from "@/types/hike";
import {
  formatDifficultyLabel,
  formatDistance,
  formatDuration,
  formatElevation,
} from "@/lib/format-hike";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface RandoCardProps {
  hike: HikeSummary;
  isFavorited?: boolean;
  isFavoritePending?: boolean;
  onFavoriteClick?: (hikeId: string) => void;
  onClick?: (hikeId: string) => void;
  className?: string;
}

/**
 * Semantic Tag Styles matching the Névé Mobile App (Tag.tsx / Colors.ts)
 */
function getTagStyles(difficulty: HikeDifficulty) {
  switch (difficulty) {
    case "facile":
      return "bg-[#DCFCE7] text-[#0D542B]"; // Success subtle
    case "modere":
      return "bg-[#FFEDD4] text-[#7B3306]"; // Warning subtle
    case "difficile":
    case "expert":
      return "bg-[#FFE2E2] text-[#82181A]"; // Error subtle
    default:
      return "bg-[#F5F3EC] text-[#575246]";
  }
}

export default function RandoCard({
  hike,
  isFavorited = false,
  isFavoritePending = false,
  onFavoriteClick,
  onClick,
  className = "",
}: RandoCardProps) {
  const router = useRouter();
  const imageSrc = hike.cover_image_url || DEFAULT_IMAGE;

  const handleClick = () => {
    if (onClick) {
      onClick(hike.id);
    } else {
      router.push(`/rando/${hike.id}`);
    }
  };

  // Mini Map thumbnail URL (identical to mobile app static map generation)
  const getMapThumbnailUrl = () => {
    const defaultLat = hike.start_lat || 48.8566;
    const defaultLon = hike.start_lng || 2.3522;

    if (!MAPBOX_TOKEN) {
      return null;
    }

    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-s-pitch+eb490b(${defaultLon.toFixed(
      4
    )},${defaultLat.toFixed(4)})/${defaultLon.toFixed(4)},${defaultLat.toFixed(
      4
    )},11,0/120x120@2x?access_token=${MAPBOX_TOKEN}`;
  };

  const mapThumb = getMapThumbnailUrl();

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col cursor-pointer select-none active:opacity-95 ${className}`}
    >
      {/* 1. Image Container (Rounded-2xl with heart button & mini-map) */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F5F3EC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={hike.title}
          className="w-full h-full object-cover"
        />

        {/* Subtle bottom gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Favorite Heart Button (Top-Right pastille) */}
        {onFavoriteClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick(hike.id);
            }}
            disabled={isFavoritePending}
            aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-xs flex items-center justify-center cursor-pointer z-10 disabled:opacity-60"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? "text-[#EF4444] fill-[#EF4444]" : "text-gray-700"
              }`}
            />
          </button>
        )}

        {/* Mini-map thumbnail (Bottom-Right overlay like in the app) */}
        {mapThumb && (
          <div className="absolute bottom-2.5 right-2.5 w-12 h-12 rounded-lg border border-white/80 bg-white shadow-sm overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapThumb} alt="Tracé" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* 2. Content Container (Title, Location, Metrics Row directly below image) */}
      <div className="pt-3 px-0.5 flex flex-col gap-1.5">
        {/* Title and Location */}
        <div>
          <h3 className="font-bricolage font-semibold text-lg sm:text-[19px] text-[#1C1914] leading-snug line-clamp-1">
            {hike.title}
          </h3>
          <p className="font-satoshi text-sm text-[#575246] mt-0.5 line-clamp-1">
            {hike.location_name || "Lieu non précisé"}
          </p>
        </div>

        {/* Metrics Row (Difficulty Tag · Distance · Duration · D+) */}
        <div className="flex items-center gap-2 text-sm font-satoshi font-medium text-[#575246] flex-wrap pt-0.5">
          {/* Difficulty Tag */}
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium leading-tight ${getTagStyles(
              hike.difficulty
            )}`}
          >
            {formatDifficultyLabel(hike.difficulty)}
          </span>

          <span className="text-[#A8A190] select-none">·</span>

          {/* Distance */}
          <div className="inline-flex items-center gap-1">
            <Route className="w-3.5 h-3.5 text-[#575246] shrink-0" />
            <span>{formatDistance(hike.distance_km)}</span>
          </div>

          <span className="text-[#A8A190] select-none">·</span>

          {/* Duration */}
          <div className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#575246] shrink-0" />
            <span>{formatDuration(hike.duration_minutes)}</span>
          </div>

          {hike.elevation_gain_m > 0 && (
            <>
              <span className="text-[#A8A190] select-none">·</span>
              {/* D+ */}
              <div className="inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#575246] shrink-0" />
                <span>{formatElevation(hike.elevation_gain_m)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
