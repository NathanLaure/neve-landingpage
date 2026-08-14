"use client";

import React from "react";
import Image from "next/image";
import { Route, Clock, Mountain, MapPin, ChevronRight, Lock } from "lucide-react";
import type { HikeSnapshot } from "@/types/adventure";

interface AdventureHikeCardProps {
  hike: HikeSnapshot;
  shareToken: string;
  onOpenAuth?: () => void;
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
  onOpenAuth,
}: AdventureHikeCardProps) {
  const imageUrl =
    hike.imageUrl ||
    hike.cover_image_url ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop";

  const location = hike.location || hike.location_name || hike.startStation;
  const distance = formatDistance(hike.distance);
  const duration = formatDuration(hike.durationHours);
  const elevation = formatElevation(hike.elevation);

  const handleClick = (e: React.MouseEvent) => {
    if (onOpenAuth) {
      e.preventDefault();
      onOpenAuth();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-3xl p-3.5 sm:p-4 border-2 border-[#111111]/10 hover:border-[#EB490B]/60 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] flex flex-col gap-3 cursor-pointer overflow-hidden text-left w-full select-none"
      role="button"
      tabIndex={0}
      aria-label={`Randonnée ${hike.title || ""}`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#EB490B] bg-[#FFF0E8] px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-colors group-hover:bg-[#FFE5D6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EB490B] animate-pulse" />
          Randonnée de l'aventure
        </span>
        <span className="text-[11px] font-semibold text-[#7C7C7C] group-hover:text-[#EB490B] flex items-center gap-0.5 transition-all">
          <span>Voir le tracé GPS</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* Card Content Row */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Thumbnail Picture with smooth zoom on hover */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-inner">
          <Image
            src={imageUrl}
            alt={hike.title || "Randonnée"}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            sizes="120px"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
        </div>

        {/* Text Info */}
        <div className="flex flex-col justify-between min-w-0 grow py-0.5 gap-1.5">
          <div className="min-w-0">
            <h3 className="font-bricolage font-bold text-base sm:text-lg text-[#111111] group-hover:text-[#EB490B] transition-colors duration-200 leading-tight line-clamp-2">
              {hike.title || "Randonnée sans voiture"}
            </h3>
            {location && (
              <div className="flex items-center gap-1 text-xs text-[#7C7C7C] mt-1 truncate">
                <MapPin className="w-3 h-3 text-[#EB490B] shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* Key Metric Pills */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-[#292929] pt-0.5">
            {distance !== "—" && (
              <div className="flex items-center gap-1 bg-[#FFF7F2] group-hover:bg-[#FFECE0] px-2 py-0.5 rounded-lg border border-[#F5E6DD] transition-colors">
                <Route className="w-3 h-3 text-[#EB490B]" />
                <span>{distance}</span>
              </div>
            )}

            {duration ? (
              <div className="flex items-center gap-1 bg-[#FFF7F2] group-hover:bg-[#FFECE0] px-2 py-0.5 rounded-lg border border-[#F5E6DD] transition-colors">
                <Clock className="w-3 h-3 text-[#EB490B]" />
                <span>{duration}</span>
              </div>
            ) : null}

            {elevation ? (
              <div className="flex items-center gap-1 bg-[#FFF7F2] group-hover:bg-[#FFECE0] px-2 py-0.5 rounded-lg border border-[#F5E6DD] transition-colors">
                <Mountain className="w-3 h-3 text-[#EB490B]" />
                <span>{elevation}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Incentive Strip to prompt Account Creation / App Access */}
      <div className="bg-[#FAF8F5] group-hover:bg-[#FFF0E8] rounded-xl px-3 py-2 border border-gray-200/60 group-hover:border-[#EB490B]/30 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-2 text-xs text-[#525252]">
          <Lock className="w-3.5 h-3.5 text-[#EB490B] shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="font-medium">
            Accéder au tracé GPX interactif et guidage GPS
          </span>
        </div>
        <span className="text-xs font-bold text-[#EB490B] shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Créer un compte</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
