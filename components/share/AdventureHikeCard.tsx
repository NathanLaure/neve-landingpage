"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Route } from "lucide-react";
import type { HikeSnapshot } from "@/types/adventure";

interface AdventureHikeCardProps {
  hike: HikeSnapshot;
  shareToken: string;
  hikeId?: string;
}

function formatDistance(dist?: string | number): string {
  if (!dist) return "—";
  if (typeof dist === "string" && dist.toLowerCase().includes("km")) {
    return dist.replace(".", ",");
  }
  const num = typeof dist === "string" ? parseFloat(dist) : dist;
  if (isNaN(num)) return String(dist);
  return `${num.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

function formatElevation(elev?: string | number): string {
  if (!elev) return "";
  if (typeof elev === "string" && (elev.includes("m") || elev.includes("+"))) {
    return elev;
  }
  const num = typeof elev === "string" ? parseFloat(elev) : elev;
  if (isNaN(num)) return String(elev);
  return `+${Math.round(num)} m`;
}

function formatDuration(dur?: string | number): string {
  if (!dur) return "";
  if (typeof dur === "string") {
    if (dur.includes("h")) return dur;
    const num = parseFloat(dur);
    if (!isNaN(num)) {
      if (num > 20) {
        const h = Math.floor(num / 60);
        const m = Math.round(num % 60);
        return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
      }
      const h = Math.floor(num);
      const m = Math.round((num - h) * 60);
      return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
    }
    return dur;
  }
  if (typeof dur === "number") {
    if (dur > 20) {
      const h = Math.floor(dur / 60);
      const m = Math.round(dur % 60);
      return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
    }
    const h = Math.floor(dur);
    const m = Math.round((dur - h) * 60);
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
  }
  return String(dur);
}

export default function AdventureHikeCard({
  hike,
  shareToken,
  hikeId: explicitHikeId,
}: AdventureHikeCardProps) {
  const resolvedHikeId =
    explicitHikeId || (hike as any).id || (hike as any).hike_id;

  const imageUrl =
    hike.imageUrl ||
    hike.cover_image_url ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop";

  const location = hike.location || hike.location_name || hike.startStation;
  const distance = formatDistance(hike.distance);
  const duration = formatDuration(hike.durationHours);
  const elevation = formatElevation(hike.elevation);

  const cardContent = (
    <div
      className="relative bg-white rounded-[8px] p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-4 h-[126px] sm:h-[132px] shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#EAE6DC] w-full cursor-pointer text-left select-none font-satoshi overflow-hidden transition-all hover:border-[#D6D0C2]"
      role="button"
      tabIndex={0}
      aria-label={`Randonnée ${hike.title || ""}`}
    >
      {/* Vignette Photo */}
      <div className="relative w-[108px] sm:w-[116px] h-full rounded-[8px] overflow-hidden shrink-0 bg-[#EAE6DC]">
        <Image
          src={imageUrl}
          alt={hike.title || "Randonnée"}
          fill
          unoptimized
          className="object-cover"
          sizes="130px"
        />
      </div>

      {/* Contenu textuel & métriques */}
      <div className="flex flex-col justify-between h-full py-1.5 grow min-w-0 gap-1">
        <div className="min-w-0">
          <h3 className="font-bricolage font-bold text-[15px] sm:text-[17px] text-[#1C1914] leading-snug line-clamp-2">
            {hike.title || "Randonnée sans voiture"}
          </h3>
          {location && (
            <p className="text-xs font-medium text-[#575246] mt-0.5 truncate font-satoshi">
              {location}
            </p>
          )}
        </div>

        {/* Ligne des métriques clés (Distance · Durée · Dénivelé) */}
        <div className="flex items-center gap-2 text-xs text-[#1C1914] font-satoshi overflow-hidden pt-1">
          {distance !== "—" && (
            <div className="flex items-center gap-1 shrink-0">
              <Route className="w-3.5 h-3.5 text-[#575246]" />
              <span className="font-bold">{distance}</span>
            </div>
          )}

          {distance !== "—" && duration && <span className="text-[#A8A190]">·</span>}

          {duration ? (
            <span className="font-bold shrink-0">{duration}</span>
          ) : null}

          {duration && elevation && <span className="text-[#A8A190]">·</span>}

          {elevation ? (
            <span className="font-bold shrink-0">{elevation}</span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (resolvedHikeId) {
    return (
      <Link href={`/rando/${resolvedHikeId}`} className="block w-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}


