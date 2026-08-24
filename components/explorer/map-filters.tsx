"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { HikeDifficulty } from "@/types/hike";

export type DistanceBucket = "all" | "short" | "medium" | "long" | "very-long";
export type DurationBucket = "all" | "short" | "half-day" | "day" | "long";

export interface ExplorerFilters {
  difficulty: HikeDifficulty | "all";
  distance: DistanceBucket;
  duration: DurationBucket;
}

export const EMPTY_FILTERS: ExplorerFilters = {
  difficulty: "all",
  distance: "all",
  duration: "all",
};

const DIFFICULTY_OPTIONS: { value: HikeDifficulty | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "facile", label: "Facile" },
  { value: "modere", label: "Modéré" },
  { value: "difficile", label: "Difficile" },
];

/** Bornes en kilomètres, `null` pour « sans limite ». */
export const DISTANCE_BUCKETS: { value: DistanceBucket; label: string; max: number | null }[] = [
  { value: "all", label: "Toutes", max: null },
  { value: "short", label: "Moins de 5 km", max: 5 },
  { value: "medium", label: "5 à 10 km", max: 10 },
  { value: "long", label: "10 à 20 km", max: 20 },
  { value: "very-long", label: "Plus de 20 km", max: null },
];

/** Bornes en minutes. */
export const DURATION_BUCKETS: { value: DurationBucket; label: string; max: number | null }[] = [
  { value: "all", label: "Toutes", max: null },
  { value: "short", label: "Moins de 2 h", max: 120 },
  { value: "half-day", label: "2 à 4 h", max: 240 },
  { value: "day", label: "4 à 6 h", max: 360 },
  { value: "long", label: "Plus de 6 h", max: null },
];

function useDismissOnOutside(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onDismiss();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onDismiss]);

  return ref;
}

interface FilterPillProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/**
 * Chip de filtre, reprise de `FilterChip` de l'application : elle porte son
 * intitulé au repos, et la valeur choisie dès qu'on en sort le défaut. On lit
 * l'état du filtre sans avoir à l'ouvrir.
 */
function FilterPill<T extends string>({ label, value, options, onChange }: FilterPillProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissOnOutside(() => setIsOpen(false));

  const selected = options.find((option) => option.value === value);
  const isActive = value !== ("all" as T);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 font-satoshi text-[13px] font-medium transition ${
          isActive
            ? "border-neve-button-secondary bg-neve-button-secondary text-neve-button-secondary-text"
            : "border-neve-border bg-neve-card text-neve-text hover:bg-neve-surface"
        }`}
      >
        {isActive ? selected?.label : label}
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 min-w-[180px] rounded-xl border border-neve-border bg-neve-card p-1.5 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left font-satoshi text-[13px] transition hover:bg-neve-surface ${
                option.value === value ? "font-bold text-neve-tint" : "text-neve-text"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const RADIUS_OPTIONS = [5, 10, 15, 25, 50] as const;

interface MapFiltersProps {
  filters: ExplorerFilters;
  onChange: (filters: ExplorerFilters) => void;
  /** Nombre d'itinéraires restants, montré quand un filtre est actif. */
  resultCount: number;
  /** Rayon courant en kilomètres, ou `null` faute de point de référence. */
  radiusKm: number | null;
  onRadiusChange: (radiusKm: number) => void;
  /** Demande la position quand aucun centre n'est encore connu. */
  onRequestLocation: () => void;
}

/**
 * Chip de rayon.
 *
 * D'une autre nature que les trois autres : ceux-là trient ce qui est déjà
 * chargé, celui-ci change la requête — et un rayon suppose un centre. Sans
 * point de référence il ne ment pas en affichant une distance, il propose d'en
 * obtenir un.
 */
function RadiusPill({
  radiusKm,
  onChange,
  onRequestLocation,
}: {
  radiusKm: number | null;
  onChange: (radiusKm: number) => void;
  onRequestLocation: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissOnOutside(() => setIsOpen(false));

  if (radiusKm === null) {
    return (
      <button
        type="button"
        onClick={onRequestLocation}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neve-border bg-neve-card px-3.5 font-satoshi text-[13px] font-medium text-neve-text transition hover:bg-neve-surface"
      >
        Autour de moi
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neve-border bg-neve-card px-3.5 font-satoshi text-[13px] font-medium text-neve-text transition hover:bg-neve-surface"
      >
        Dans un rayon de {radiusKm} km
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 min-w-[180px] rounded-xl border border-neve-border bg-neve-card p-1.5 shadow-lg">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left font-satoshi text-[13px] transition hover:bg-neve-surface ${
                option === radiusKm ? "font-bold text-neve-tint" : "text-neve-text"
              }`}
            >
              {option} km
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Barre de filtres posée en haut de la carte.
 *
 * « Filtres » n'ouvre rien de plus que les trois autres réunis : c'est la
 * porte pour qui ne sait pas encore ce qu'il cherche, et le bouton de remise à
 * zéro dès qu'un filtre est actif.
 */
export default function MapFilters({
  filters,
  onChange,
  resultCount,
  radiusKm,
  onRadiusChange,
  onRequestLocation,
}: MapFiltersProps) {
  const hasActiveFilter =
    filters.difficulty !== "all" || filters.distance !== "all" || filters.duration !== "all";

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {hasActiveFilter ? (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neve-border bg-neve-card px-3.5 font-satoshi text-[13px] font-medium text-neve-text transition hover:bg-neve-surface"
        >
          <X className="size-4" />
          {resultCount} {resultCount > 1 ? "résultats" : "résultat"}
        </button>
      ) : (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neve-border bg-neve-card px-3.5 font-satoshi text-[13px] font-medium text-neve-text">
          <SlidersHorizontal className="size-4" />
          Filtres
        </span>
      )}

      <RadiusPill
        radiusKm={radiusKm}
        onChange={onRadiusChange}
        onRequestLocation={onRequestLocation}
      />

      <FilterPill
        label="Difficulté"
        value={filters.difficulty}
        options={DIFFICULTY_OPTIONS}
        onChange={(difficulty) => onChange({ ...filters, difficulty })}
      />
      <FilterPill
        label="Distance"
        value={filters.distance}
        options={DISTANCE_BUCKETS.map(({ value, label }) => ({ value, label }))}
        onChange={(distance) => onChange({ ...filters, distance })}
      />
      <FilterPill
        label="Durée"
        value={filters.duration}
        options={DURATION_BUCKETS.map(({ value, label }) => ({ value, label }))}
        onChange={(duration) => onChange({ ...filters, duration })}
      />
    </div>
  );
}
