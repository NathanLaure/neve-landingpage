"use client";

import { Locate, Minus, Navigation, Plus } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onResetBearing: () => void;
  /** Orientation de la carte en degrés, pour faire tourner la boussole. */
  bearing: number;
  isLocating?: boolean;
}

/**
 * Contrôles flottants à droite de la carte, dans l'ordre de la maquette :
 * boussole, position, puis zoom.
 *
 * Chacun est une pastille claire, comme les boutons ronds de l'application —
 * un bouton posé sur une photo satellite ne peut pas compter sur le thème pour
 * rester lisible.
 */
export default function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onResetBearing,
  bearing,
  isLocating = false,
}: MapControlsProps) {
  const pill =
    "flex size-10 cursor-pointer items-center justify-center rounded-full border border-neve-border bg-neve-card text-neve-text shadow-sm transition hover:bg-neve-surface";

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2">
      <button type="button" onClick={onResetBearing} aria-label="Remettre le nord en haut" className={pill}>
        {/* L'aiguille suit l'orientation de la carte : elle indique le nord, et
            c'est cet écart qui dit qu'il y a quelque chose à remettre droit. */}
        <Navigation
          className="size-[18px] fill-neve-tint text-neve-tint"
          style={{ transform: `rotate(${-bearing}deg)` }}
        />
      </button>

      <button
        type="button"
        onClick={onLocate}
        disabled={isLocating}
        aria-label="Centrer sur ma position"
        className={`${pill} disabled:opacity-60`}
      >
        <Locate className="size-[18px]" />
      </button>

      {/* Zoom groupé : deux gestes du même geste, contrairement aux deux
          au-dessus qui n'ont rien à voir l'un avec l'autre. */}
      <div className="flex flex-col overflow-hidden rounded-full border border-neve-border bg-neve-card shadow-sm">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoomer"
          className="flex size-10 cursor-pointer items-center justify-center text-neve-text transition hover:bg-neve-surface"
        >
          <Plus className="size-[18px]" />
        </button>
        <div className="mx-2 h-px bg-neve-border" />
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Dézoomer"
          className="flex size-10 cursor-pointer items-center justify-center text-neve-text transition hover:bg-neve-surface"
        >
          <Minus className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
