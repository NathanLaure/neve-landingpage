"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHikeById } from "@/lib/hikes";
import type { HikeDetail, HikeSummary } from "@/types/hike";
import { formatDifficultyColor, formatDifficultyLabel, formatDistance, formatDuration, formatElevation } from "@/lib/format-hike";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

type Props = {
  summary: HikeSummary;
  onClose: () => void;
};

export default function HikeDetailPanel({ summary, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();
  const [detail, setDetail] = useState<HikeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isFavorited = isFavorite(summary.id);
  const isTogglingFavorite = isFavoritePending(summary.id);

  const handleFavoriteClick = () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    toggleFavorite(summary.id);
  };

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    setLoading(true);

    getHikeById(summary.id).then(({ hike, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError || !hike) {
        setError(fetchError ?? "Randonnée introuvable.");
      } else {
        setDetail(hike);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [summary.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const gpsPointCount =
    detail?.geometry && Array.isArray(detail.geometry.coordinates)
      ? (detail.geometry.type === "LineString"
          ? (detail.geometry.coordinates as number[][]).length
          : (detail.geometry.coordinates as number[][][]).reduce((sum, line) => sum + line.length, 0))
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-0 md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full md:max-w-lg max-h-[88vh] md:max-h-[80vh] overflow-y-auto bg-brand-light rounded-t-3xl md:rounded-3xl shadow-2xl border border-brand-dark/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={summary.title}
      >
        {/* Cover image */}
        <div className="relative aspect-video w-full bg-brand-dark/5">
          {summary.cover_image_url && (
            <img src={summary.cover_image_url} alt={summary.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              aria-pressed={isFavorited}
              aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              className="w-9 h-9 rounded-full bg-brand-light/90 hover:bg-brand-light shadow-md flex items-center justify-center transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <svg
                className={`w-4.5 h-4.5 stroke-current transition ${
                  isFavorited ? "fill-rose-500 text-rose-500" : "fill-none text-brand-dark"
                }`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="w-9 h-9 rounded-full bg-brand-light/90 hover:bg-brand-light shadow-md flex items-center justify-center transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <h2 className="text-lg font-extrabold text-brand-dark font-bricolage leading-snug">{summary.title}</h2>
          <p className="text-[11px] text-brand-dark/50 font-bold mt-1">{summary.location_name}</p>

          {/* Immediately-available stats (from the light query, no loading needed) */}
          <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/70 mt-3 font-semibold flex-wrap">
            <span className={`font-black ${formatDifficultyColor(summary.difficulty)}`}>
              {formatDifficultyLabel(summary.difficulty)}
            </span>
            <span className="text-brand-dark/20 font-light">•</span>
            <span>{formatDistance(summary.distance_km)}</span>
            <span className="text-brand-dark/20 font-light">•</span>
            <span>{formatDuration(summary.duration_minutes)}</span>
            <span className="text-brand-dark/20 font-light">•</span>
            <span>{formatElevation(summary.elevation_gain_m)} / -{Math.round(summary.elevation_loss_m)}m</span>
          </div>

          {/* Full detail: description + geometry, fetched on open */}
          <div className="mt-4 pt-4 border-t border-brand-dark/5">
            {error ? (
              <p className="text-xs text-rose-600 font-semibold">
                Impossible de charger le détail de cette randonnée pour le moment.
              </p>
            ) : loading ? (
              <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Chargement du détail">
                <div className="h-3 bg-brand-dark/10 rounded-full w-full" />
                <div className="h-3 bg-brand-dark/10 rounded-full w-11/12" />
                <div className="h-3 bg-brand-dark/10 rounded-full w-4/5" />
                <div className="h-3 bg-brand-dark/10 rounded-full w-3/5" />
              </div>
            ) : (
              <p className="text-[13px] text-brand-dark/75 leading-relaxed whitespace-pre-line">
                {detail?.description || "Pas de description disponible pour cette randonnée."}
              </p>
            )}
          </div>

          {/* GPS trace teaser (mirrors the app-download CTA already used on this page) */}
          {!loading && !error && (
            <div className="bg-neve-gray border border-brand-dark/5 rounded-xl p-3.5 mt-4">
              <div className="text-[8px] font-bold uppercase tracking-wider text-brand-orange mb-1">
                📍 Tracé GPS
              </div>
              <p className="text-[10px] font-bold text-brand-dark/85 leading-snug">
                {gpsPointCount
                  ? `Ce tracé contient ${gpsPointCount.toLocaleString("fr-FR")} points GPS.`
                  : "Tracé GPS disponible."}{" "}
                Téléchargez-le hors-ligne dans l'application Névé.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
