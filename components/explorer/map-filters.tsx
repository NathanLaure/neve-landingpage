"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleDotDashed, Clock, Route, Signal, SlidersHorizontal } from "lucide-react";
import type { HikeDifficulty } from "@/types/hike";
import {
  DIFFICULTY_LABELS,
  DISTANCE_BOUNDS,
  DURATION_BOUNDS,
  RADIUS_OPTIONS,
  countActiveFilters,
  type ExplorerFilters,
} from "@/lib/explorer-filters";

/** Habillage commun, pour qu'aucune chip ne dérive des autres. */
const PILL =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[12px] border px-3.5 font-satoshi text-[13px] font-medium transition";
const PILL_IDLE = "border-neve-border bg-neve-card text-neve-text hover:bg-neve-surface";
/*
 * État sélectionné, tel que la barre de chips de l'accueil de l'application le
 * rend : seule la bordure passe à la teinte de marque, à 1,5 px. Le texte et
 * l'icône restent neutres — `FilterChipsBar` force d'ailleurs
 * `textStyle={{ color: theme.text }}` pour écraser l'orange que `Chip`
 * appliquerait au libellé.
 *
 * Le fond ne bouge pas. Un fond sombre était une invention de ma part.
 */
const PILL_ACTIVE =
  "border-[1.5px] border-neve-tint bg-neve-card text-neve-text hover:bg-neve-surface";
const MENU =
  "absolute top-full left-0 z-30 mt-2 min-w-[200px] rounded-[12px] border border-neve-border bg-neve-card p-1.5 shadow-lg";
const MENU_ITEM =
  "block w-full cursor-pointer rounded-[12px] px-3 py-2 text-left font-satoshi text-[13px] transition hover:bg-neve-surface";

/**
 * Raccourcis de distance, en kilomètres. Ils écrivent dans la même plage que le
 * curseur de la modale : une chip est un raccourci, pas un filtre parallèle.
 */
const DISTANCE_SHORTCUTS: { label: string; range: [number, number] }[] = [
  { label: "Toutes", range: [...DISTANCE_BOUNDS] as [number, number] },
  { label: "Moins de 5 km", range: [0, 5] },
  { label: "5 à 10 km", range: [5, 10] },
  { label: "10 à 20 km", range: [10, 20] },
  { label: "Plus de 20 km", range: [20, DISTANCE_BOUNDS[1]] },
];

/** Raccourcis de durée, en minutes. */
const DURATION_SHORTCUTS: { label: string; range: [number, number] }[] = [
  { label: "Toutes", range: [...DURATION_BOUNDS] as [number, number] },
  { label: "Moins de 2 h", range: [0, 120] },
  { label: "2 à 4 h", range: [120, 240] },
  { label: "4 à 6 h", range: [240, 360] },
  { label: "Plus de 6 h", range: [360, DURATION_BOUNDS[1]] },
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

interface PillOption {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

/** Chip générique : intitulé au repos, valeur choisie dès qu'on sort du défaut. */
function Pill({
  label,
  activeLabel,
  icon,
  options,
}: {
  label: string;
  activeLabel: string | null;
  icon: React.ReactNode;
  options: PillOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissOnOutside(() => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`${PILL} ${activeLabel ? PILL_ACTIVE : PILL_IDLE}`}
      >
        {/* L'icône garde la couleur du texte, sélectionnée ou non : c'est la
            bordure qui porte l'état. */}
        {icon}
        {activeLabel ?? label}
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className={MENU}>
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                option.onSelect();
                setIsOpen(false);
              }}
              className={`${MENU_ITEM} ${
                option.isSelected ? "font-bold text-neve-tint" : "text-neve-text"
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

/**
 * Chip de rayon.
 *
 * D'une autre nature que les autres : ceux-là trient ce qui est déjà chargé,
 * celui-ci change la requête — et un rayon suppose un centre.
 *
 * « Depuis le marqueur » ouvre la liste, comme chez Komoot : ce n'est pas
 * l'absence de réglage mais le réglage qui ne borne rien, et le seul qui ne
 * cache aucune randonnée. Choisir un rayon sans centre connu demande d'abord la
 * position — le menu ne propose jamais un réglage qu'il ne saurait appliquer.
 */
function RadiusPill({
  radiusKm,
  hasLocation,
  onChange,
  onRequestLocation,
}: {
  radiusKm: number | null;
  hasLocation: boolean;
  onChange: (radiusKm: number | null) => void;
  onRequestLocation: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissOnOutside(() => setIsOpen(false));

  const label = !hasLocation
    ? "Autour de moi"
    : radiusKm === null
      ? "Position actuelle"
      : `Dans un rayon de ${radiusKm} km`;

  const select = (next: number | null) => {
    setIsOpen(false);
    if (!hasLocation) {
      onRequestLocation();
      return;
    }
    onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`${PILL} ${radiusKm !== null ? PILL_ACTIVE : PILL_IDLE}`}
      >
        <CircleDotDashed className="size-4" />
        {label}
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className={MENU}>
          <button
            type="button"
            onClick={() => select(null)}
            className={`${MENU_ITEM} ${
              radiusKm === null ? "font-bold text-neve-tint" : "text-neve-text"
            }`}
          >
            Position actuelle
          </button>
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => select(option)}
              className={`${MENU_ITEM} ${
                option === radiusKm ? "font-bold text-neve-tint" : "text-neve-text"
              }`}
            >
              dans un rayon de {option} km
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Libellé d'une plage : le nom du raccourci s'il y en a un, ses bornes sinon.
 *
 * Une plage réglée au curseur ne correspond à aucun raccourci ; retomber sur
 * l'intitulé laisserait croire qu'aucun filtre n'est actif.
 */
function rangeLabel(
  range: [number, number],
  shortcuts: { label: string; range: [number, number] }[],
  unit: string,
): string | null {
  const match = shortcuts.find(
    (shortcut) => shortcut.range[0] === range[0] && shortcut.range[1] === range[1],
  );
  if (match) return match.label === "Toutes" ? null : match.label;
  return `${range[0]}-${range[1]} ${unit}`;
}

interface MapFiltersProps {
  filters: ExplorerFilters;
  onChange: (filters: ExplorerFilters) => void;
  /** Ouvre la modale, qui porte la liste complète. */
  onOpenAll: () => void;
  radiusKm: number | null;
  hasLocation: boolean;
  onRadiusChange: (radiusKm: number | null) => void;
  onRequestLocation: () => void;
}

/**
 * Barre de filtres posée au-dessus de la carte.
 *
 * Elle ne porte que les critères les plus courants ; « Filtres » ouvre la liste
 * complète et compte ceux qui sont actifs, où qu'ils aient été réglés.
 */
export default function MapFilters({
  filters,
  onChange,
  onOpenAll,
  radiusKm,
  hasLocation,
  onRadiusChange,
  onRequestLocation,
}: MapFiltersProps) {
  const activeCount = countActiveFilters(filters);

  const difficultyLabel =
    filters.difficulties.length === 0
      ? null
      : filters.difficulties.length === 1
        ? (DIFFICULTY_LABELS.find((item) => item.value === filters.difficulties[0])?.label ?? null)
        : `${filters.difficulties.length} difficultés`;

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onOpenAll}
        className={`${PILL} ${activeCount > 0 ? PILL_ACTIVE : PILL_IDLE}`}
      >
        <SlidersHorizontal className="size-4" />
        Filtres
        {/* Badge du nombre de filtres actifs, comme sur l'application : une fois
            la modale refermée, c'est le seul indice qu'un réglage invisible
            restreint encore la liste. */}
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-neve-button-primary text-[11px] font-bold text-neve-text-on-brand">
            {activeCount}
          </span>
        )}
      </button>

      <RadiusPill
        radiusKm={radiusKm}
        hasLocation={hasLocation}
        onChange={onRadiusChange}
        onRequestLocation={onRequestLocation}
      />

      <Pill
        label="Difficulté"
        activeLabel={difficultyLabel}
        icon={<Signal className="size-4" />}
        options={[
          {
            label: "Toutes",
            isSelected: filters.difficulties.length === 0,
            onSelect: () => onChange({ ...filters, difficulties: [] }),
          },
          ...DIFFICULTY_LABELS.map(({ value, label }) => ({
            label,
            isSelected: filters.difficulties.includes(value),
            onSelect: () => onChange({ ...filters, difficulties: [value as HikeDifficulty] }),
          })),
        ]}
      />

      <Pill
        label="Distance"
        activeLabel={rangeLabel(filters.distanceKm, DISTANCE_SHORTCUTS, "km")}
        icon={<Route className="size-4" />}
        options={DISTANCE_SHORTCUTS.map(({ label, range }) => ({
          label,
          isSelected: filters.distanceKm[0] === range[0] && filters.distanceKm[1] === range[1],
          onSelect: () => onChange({ ...filters, distanceKm: range }),
        }))}
      />

      <Pill
        label="Durée"
        activeLabel={rangeLabel(filters.durationMin, DURATION_SHORTCUTS, "min")}
        icon={<Clock className="size-4" />}
        options={DURATION_SHORTCUTS.map(({ label, range }) => ({
          label,
          isSelected: filters.durationMin[0] === range[0] && filters.durationMin[1] === range[1],
          onSelect: () => onChange({ ...filters, durationMin: range }),
        }))}
      />
    </div>
  );
}
