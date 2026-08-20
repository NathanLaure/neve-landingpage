"use client";

import { useState } from "react";
import type { HikeDifficulty, HikeSummary } from "@/types/hike";
import { formatDifficultyLabel } from "@/lib/format-hike";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import RandoCard from "@/components/ui/rando-card";

type Props = {
  hikes: HikeSummary[];
};

const DIFFICULTY_OPTIONS: (HikeDifficulty | "All")[] = ["All", "facile", "modere", "difficile"];

export default function HikeGrid({ hikes }: Props) {
  const { user, openAuthModal } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();
  const [selectedDifficulty, setSelectedDifficulty] = useState<HikeDifficulty | "All">("All");

  const filteredHikes = hikes.filter((hike) => {
    if (selectedDifficulty === "All") return true;
    if (selectedDifficulty === "difficile") {
      return hike.difficulty === "difficile" || hike.difficulty === "expert";
    }
    return hike.difficulty === selectedDifficulty;
  });

  // Anonymous visitors are prompted with the auth modal before a favorite can be saved.
  const handleFavoriteClick = (hikeId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    toggleFavorite(hikeId);
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
                  ? "bg-[#0f172b] text-white shadow-xs"
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
              className="text-[#EB490B] font-bold text-xs hover:underline cursor-pointer"
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHikes.map((hike) => (
            <RandoCard
              key={hike.id}
              hike={hike}
              isFavorited={isFavorite(hike.id)}
              isFavoritePending={isFavoritePending(hike.id)}
              onFavoriteClick={handleFavoriteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
