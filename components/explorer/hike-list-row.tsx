"use client";

import { Route, Clock } from "lucide-react";
import type { HikeDifficulty, HikeSummary } from "@/types/hike";
import { formatDifficultyLabel, formatDistance, formatDuration } from "@/lib/format-hike";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=400&auto=format&fit=crop";

/** Mêmes teintes que le composant `Tag` de l'application. */
function difficultyClasses(difficulty: HikeDifficulty) {
  switch (difficulty) {
    case "facile":
      return "bg-brand-green-light text-brand-green-hover";
    case "modere":
      return "bg-brand-warning-light text-brand-warning";
    case "difficile":
    case "expert":
      return "bg-[#ffe2e2] text-[#82181a]";
    default:
      return "bg-neve-surface text-neve-text-muted";
  }
}

interface HikeListRowProps {
  hike: HikeSummary;
  isActive?: boolean;
  onSelect?: (hikeId: string) => void;
  onHover?: (hikeId: string | null) => void;
}

/**
 * Ligne de la liste compacte du panneau.
 *
 * Deux fois plus dense que la carte : l'image passe en vignette à gauche et le
 * texte occupe la largeur, ce qui met sept randonnées à l'écran là où la carte
 * en montre trois. C'est le mode qu'on choisit quand on compare, pas quand on
 * flâne.
 *
 * Pas de note : les 923 randonnées en portent une en base, aucune n'a d'avis
 * derrière elle. Même règle que sur la fiche de l'application.
 */
export default function HikeListRow({ hike, isActive, onSelect, onHover }: HikeListRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(hike.id)}
      onMouseEnter={() => onHover?.(hike.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl p-2 text-left transition ${
        isActive ? "bg-neve-surface" : "hover:bg-neve-surface/70"
      }`}
    >
      <div className="size-[88px] shrink-0 overflow-hidden rounded-xl bg-neve-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hike.cover_image_url || DEFAULT_IMAGE}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate font-bricolage text-[17px] leading-snug font-semibold text-neve-text">
          {hike.title}
        </h3>
        <p className="truncate font-satoshi text-[13px] text-neve-text-muted">
          {hike.location_name || "Lieu non précisé"}
        </p>

        <div className="mt-0.5 flex items-center gap-2 font-satoshi text-[13px] font-medium text-neve-text-muted">
          <span
            className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[11px] leading-tight font-medium ${difficultyClasses(
              hike.difficulty,
            )}`}
          >
            {formatDifficultyLabel(hike.difficulty)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Route className="size-3.5 shrink-0" />
            {formatDistance(hike.distance_km)}
          </span>

          <span className="text-neve-text-tertiary select-none">·</span>

          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 shrink-0" />
            {formatDuration(hike.duration_minutes)}
          </span>
        </div>
      </div>
    </button>
  );
}
