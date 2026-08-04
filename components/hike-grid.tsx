"use client";

import { useState } from "react";
import HikeDetailPanel from "@/components/hike-detail-panel";
import type { HikeDifficulty, HikeSummary } from "@/types/hike";
import { formatDifficultyColor, formatDifficultyLabel, formatDistance, formatDuration, formatElevation } from "@/lib/format-hike";

type Props = {
  hikes: HikeSummary[];
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80";

const DIFFICULTY_OPTIONS: (HikeDifficulty | "All")[] = ["All", "facile", "modere", "difficile", "expert"];

export default function HikeGrid({ hikes }: Props) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<HikeDifficulty | "All">("All");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [detailHikeId, setDetailHikeId] = useState<string | null>(null);

  const filteredHikes = hikes.filter(
    (hike) => selectedDifficulty === "All" || hike.difficulty === selectedDifficulty
  );
  const detailHike = detailHikeId ? hikes.find((h) => h.id === detailHikeId) : undefined;

  const toggleFavorite = (hikeId: string) => {
    setFavorites((prev) => ({ ...prev, [hikeId]: !prev[hikeId] }));
  };

  return (
    <div>
      {/* Difficulty Filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Difficulté :</span>
        <div className="flex gap-1.5 flex-wrap">
          {DIFFICULTY_OPTIONS.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedDifficulty === level
                  ? "bg-[color:var(--color-brand-orange)] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {level === "All" ? "Toutes" : formatDifficultyLabel(level)}
            </button>
          ))}
        </div>
      </div>

      {filteredHikes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-500 font-semibold text-sm mb-2">Aucun sentier ne correspond à ce filtre</p>
          {selectedDifficulty !== "All" && (
            <button
              onClick={() => setSelectedDifficulty("All")}
              className="text-[color:var(--color-brand-orange)] font-bold text-xs hover:underline cursor-pointer"
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHikes.map((hike) => {
            const imageSrc = hike.cover_image_url || DEFAULT_IMAGE;
            const isFavorited = !!favorites[hike.id];

            return (
              <div
                key={hike.id}
                onClick={() => setDetailHikeId(hike.id)}
                className="group flex flex-col cursor-pointer rounded-2xl border border-gray-150 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition duration-200"
              >
                <div className="relative aspect-4/3 w-full bg-slate-100">
                  <img
                    src={imageSrc}
                    alt={hike.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(hike.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <svg
                      className={`w-4.5 h-4.5 stroke-current transition ${
                        isFavorited ? "fill-rose-500 text-rose-500" : "fill-none text-slate-700"
                      }`}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-[color:var(--color-brand-orange)] text-white shadow-md">
                    🥾 {formatDifficultyLabel(hike.difficulty)}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[color:var(--color-brand-orange)] transition">
                    {hike.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1 truncate">{hike.location_name}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3 font-semibold flex-wrap">
                    <span className={`font-black ${formatDifficultyColor(hike.difficulty)}`}>
                      {formatDifficultyLabel(hike.difficulty)}
                    </span>
                    <span className="text-slate-300 font-light">•</span>
                    <span>{formatDistance(hike.distance_km)}</span>
                    <span className="text-slate-300 font-light">•</span>
                    <span>{formatDuration(hike.duration_minutes)}</span>
                    <span className="text-slate-300 font-light">•</span>
                    <span>{formatElevation(hike.elevation_gain_m)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailHikeId(hike.id);
                    }}
                    className="mt-4 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-[color:var(--color-brand-orange)] hover:opacity-90 text-white text-xs font-bold shadow-sm transition duration-150 cursor-pointer"
                  >
                    Voir la fiche
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailHike && <HikeDetailPanel summary={detailHike} onClose={() => setDetailHikeId(null)} />}
    </div>
  );
}
