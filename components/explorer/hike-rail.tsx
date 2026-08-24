"use client";

import { useState } from "react";
import type { HikeSummary } from "@/types/hike";
import { formatDistance, formatDuration } from "@/lib/format-hike";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=200&auto=format&fit=crop";

interface HikeRailProps {
  hikes: HikeSummary[];
  activeId?: string | null;
  onSelect?: (hikeId: string) => void;
  onHover?: (hikeId: string | null) => void;
}

interface HoveredHike {
  hike: HikeSummary;
  /** Coordonnées écran de la vignette, l'étiquette étant en position fixe. */
  top: number;
  left: number;
}

/**
 * Panneau replié : une colonne de vignettes, rien d'autre.
 *
 * Une vignette seule n'identifie pas une randonnée — deux forêts se
 * ressemblent, et on ne retrouve pas celle qu'on regardait. D'où le libellé
 * flottant qui sort à droite au survol : il rend son nom au rail sans lui
 * reprendre la largeur qu'on vient de donner à la carte.
 *
 * L'étiquette est en `position: fixed` et non posée dans le rail. Le rail
 * défile verticalement, et dès qu'un axe est en `auto`, CSS force l'autre à
 * `auto` lui aussi : un `overflow-x: visible` y serait ignoré et l'étiquette
 * rognée au bord du panneau. Sortie du flux, elle ne dépend plus de personne.
 */
export default function HikeRail({ hikes, activeId, onSelect, onHover }: HikeRailProps) {
  const [hovered, setHovered] = useState<HoveredHike | null>(null);

  const show = (hike: HikeSummary, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setHovered({ hike, top: rect.top + rect.height / 2, left: rect.right + 12 });
    onHover?.(hike.id);
  };

  const hide = () => {
    setHovered(null);
    onHover?.(null);
  };

  return (
    <>
      <ul className="flex flex-col items-center gap-3 px-3 pb-8">
        {hikes.map((hike) => (
          <li key={hike.id}>
            <button
              type="button"
              onClick={() => onSelect?.(hike.id)}
              onMouseEnter={(event) => show(hike, event.currentTarget)}
              onMouseLeave={hide}
              onFocus={(event) => show(hike, event.currentTarget)}
              onBlur={hide}
              aria-label={hike.title}
              className={`block size-14 cursor-pointer overflow-hidden rounded-xl transition ${
                activeId === hike.id
                  ? "ring-2 ring-neve-tint ring-offset-2 ring-offset-neve-card"
                  : "hover:opacity-90"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hike.cover_image_url || DEFAULT_IMAGE}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      {hovered && (
        <div
          className="pointer-events-none fixed z-40 -translate-y-1/2"
          style={{ top: hovered.top, left: hovered.left }}
        >
          <div className="max-w-[260px] rounded-xl border border-neve-border bg-neve-card px-3 py-2 shadow-lg">
            <p className="truncate font-bricolage text-sm font-semibold text-neve-text">
              {hovered.hike.title}
            </p>
            <p className="mt-0.5 truncate font-satoshi text-xs text-neve-text-muted">
              {formatDistance(hovered.hike.distance_km)} ·{" "}
              {formatDuration(hovered.hike.duration_minutes)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
