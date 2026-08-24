"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface MapStyleOption {
  id: string;
  label: string;
  url: string;
  /** Vignette d'aperçu — une capture du style, pas une photo d'ambiance. */
  preview: string;
}

/**
 * Les trois styles de la maquette. Même trio que la feuille « Type de carte »
 * de l'application, et dans le même ordre.
 *
 * Les aperçus sont des tuiles statiques du style lui-même : une jolie photo de
 * montagne ne dirait pas à quoi ressemblera la carte, ce qui est pourtant la
 * seule question posée ici.
 */
export function buildStyleOptions(token: string): MapStyleOption[] {
  const preview = (style: string) =>
    `https://api.mapbox.com/styles/v1/mapbox/${style}/static/6.8694,45.9237,9,0/120x120@2x?access_token=${token}&attribution=false&logo=false`;

  return [
    {
      id: "outdoors",
      label: "Par défaut",
      url: "mapbox://styles/mapbox/outdoors-v12",
      preview: preview("outdoors-v12"),
    },
    {
      id: "satellite",
      label: "Satellite",
      url: "mapbox://styles/mapbox/satellite-streets-v12",
      preview: preview("satellite-streets-v12"),
    },
    {
      id: "dark",
      label: "Sombre",
      url: "mapbox://styles/mapbox/dark-v11",
      preview: preview("dark-v11"),
    },
  ];
}

interface MapStylePickerProps {
  options: MapStyleOption[];
  value: string;
  onChange: (url: string) => void;
}

/**
 * Bouton « Calques » en bas à gauche de la carte, et sa feuille de choix.
 *
 * Le bouton porte l'aperçu du style courant plutôt qu'une icône : il dit à la
 * fois ce qu'il ouvre et où l'on en est.
 */
export default function MapStylePicker({ options, value, onChange }: MapStylePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((option) => option.url === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="pointer-events-auto relative">
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-[220px] rounded-2xl border border-neve-border bg-neve-card p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bricolage text-base font-bold text-neve-text">Type de carte</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-neve-text-muted transition hover:bg-neve-surface"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex items-start justify-between gap-2">
            {options.map((option) => {
              const isSelected = option.url === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.url);
                    setIsOpen(false);
                  }}
                  className="flex cursor-pointer flex-col items-center gap-1.5"
                >
                  <span
                    className={`block size-[56px] overflow-hidden rounded-lg border-2 transition ${
                      isSelected ? "border-neve-tint" : "border-transparent hover:border-neve-border"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={option.preview} alt="" className="size-full object-cover" />
                  </span>
                  <span
                    className={`font-satoshi text-[11px] ${
                      isSelected ? "font-bold text-neve-text" : "text-neve-text-muted"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="relative block size-[64px] cursor-pointer overflow-hidden rounded-xl border-2 border-neve-card shadow-lg transition hover:brightness-95"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.preview} alt="" className="size-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 bg-black/45 py-1 text-center font-satoshi text-[11px] font-bold text-white">
          Calques
        </span>
      </button>
    </div>
  );
}
