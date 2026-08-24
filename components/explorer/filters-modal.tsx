"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  DIFFICULTY_LABELS,
  DISTANCE_BOUNDS,
  DURATION_BOUNDS,
  ELEVATION_BOUNDS,
  EMPTY_FILTERS,
  ROUTE_TYPE_LABELS,
  type ExplorerFilters,
} from "@/lib/explorer-filters";

interface RangeFieldProps {
  label: string;
  value: [number, number];
  bounds: [number, number];
  step: number;
  /** Rend la valeur affichée à droite du libellé : « 0-34 km ». */
  format: (range: [number, number]) => string;
  onChange: (value: [number, number]) => void;
}

/**
 * Curseur à deux poignées.
 *
 * Deux `input[type=range]` superposés plutôt qu'une dépendance : le conteneur
 * ne reçoit aucun pointeur, seules les poignées en captent. Sans cela le
 * curseur du dessus intercepterait tous les clics et celui du dessous serait
 * inatteignable.
 */
function RangeField({ label, value, bounds, step, format, onChange }: RangeFieldProps) {
  const [min, max] = bounds;
  const [low, high] = value;

  /* Les poignées ne se croisent pas : chacune bute sur l'autre. Croisées, la
     plage s'inverserait et ne filtrerait plus rien. */
  const setLow = (next: number) => onChange([Math.min(next, high), high]);
  const setHigh = (next: number) => onChange([low, Math.max(next, low)]);

  const percent = (n: number) => ((n - min) / (max - min)) * 100;

  return (
    <div className="py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-satoshi text-sm text-neve-text">{label}</span>
        <span className="font-satoshi text-sm text-neve-text-muted">{format(value)}</span>
      </div>

      <div className="relative h-5">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-neve-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-neve-text"
          style={{ left: `${percent(low)}%`, right: `${100 - percent(high)}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(event) => setLow(Number(event.target.value))}
          aria-label={`${label} — minimum`}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(event) => setHigh(Number(event.target.value))}
          aria-label={`${label} — maximum`}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 font-satoshi text-base font-bold text-neve-text">{children}</h3>;
}

interface FiltersModalProps {
  open: boolean;
  filters: ExplorerFilters;
  onChange: (filters: ExplorerFilters) => void;
  onClose: () => void;
  /** Nombre d'itinéraires que donnerait le réglage courant. */
  resultCount: number;
}

/**
 * Modale des filtres : la liste complète, là où les chips n'offrent que les
 * plus courants.
 *
 * Les deux écrivent dans le même objet — la difficulté figure aux deux
 * endroits, ce qui n'a de sens que si elles disent la même chose. Le chip est
 * un raccourci, pas un filtre parallèle.
 *
 * Ne portent ici que les critères qu'une colonne alimente réellement. Type
 * d'activité, points d'intérêts, fréquentation, accessibilité aux chiens ou
 * aux poussettes, altitude maximale et note figurent sur la maquette mais
 * n'existent pas en base : rendus, ils renverraient toujours les mêmes
 * résultats, ce qui apprend surtout à se méfier des filtres.
 */
export default function FiltersModal({
  open,
  filters,
  onChange,
  onClose,
  resultCount,
}: FiltersModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    /* La page derrière ne défile pas pendant que la modale est ouverte. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleDifficulty = (value: (typeof DIFFICULTY_LABELS)[number]["value"]) => {
    const next = filters.difficulties.includes(value)
      ? filters.difficulties.filter((item) => item !== value)
      : [...filters.difficulties, value];
    onChange({ ...filters, difficulties: next });
  };

  const toggleRouteType = (value: (typeof ROUTE_TYPE_LABELS)[number]["value"]) => {
    const next = filters.routeTypes.includes(value)
      ? filters.routeTypes.filter((item) => item !== value)
      : [...filters.routeTypes, value];
    onChange({ ...filters, routeTypes: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer les filtres"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-[570px] flex-col overflow-hidden rounded-[20px] bg-neve-card shadow-2xl">
        <header className="flex items-center justify-between px-7 pt-7 pb-4">
          <h2 className="font-bricolage text-[22px] font-bold text-neve-text">Filtres</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-7 cursor-pointer items-center justify-center text-neve-text transition-colors hover:text-neve-text-muted"
          >
            <X className="size-[22px]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 pb-6">
          <section className="pb-6">
            <SectionTitle>Difficulté</SectionTitle>
            {DIFFICULTY_LABELS.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center justify-between py-2.5 font-satoshi text-sm text-neve-text"
              >
                {label}
                <input
                  type="checkbox"
                  checked={filters.difficulties.includes(value)}
                  onChange={() => toggleDifficulty(value)}
                  className="size-5 cursor-pointer rounded border-neve-border-strong text-neve-tint focus:ring-neve-tint"
                />
              </label>
            ))}
          </section>

          <section className="border-t border-neve-border-subtle py-2">
            <RangeField
              label="Distance du parcours"
              value={filters.distanceKm}
              bounds={DISTANCE_BOUNDS}
              step={1}
              format={([lo, hi]) => `${lo}-${hi}${hi >= DISTANCE_BOUNDS[1] ? "+" : ""} km`}
              onChange={(distanceKm) => onChange({ ...filters, distanceKm })}
            />
            <RangeField
              label="Durée"
              value={filters.durationMin}
              bounds={DURATION_BOUNDS}
              step={30}
              format={([lo, hi]) =>
                `${Math.round(lo / 60)}-${Math.round(hi / 60)}${hi >= DURATION_BOUNDS[1] ? "+" : ""} h`
              }
              onChange={(durationMin) => onChange({ ...filters, durationMin })}
            />
            <RangeField
              label="Dénivelé positif"
              value={filters.elevationM}
              bounds={ELEVATION_BOUNDS}
              step={50}
              format={([lo, hi]) => `${lo}-${hi}${hi >= ELEVATION_BOUNDS[1] ? "+" : ""} m`}
              onChange={(elevationM) => onChange({ ...filters, elevationM })}
            />
          </section>

          <section className="border-t border-neve-border-subtle py-6">
            <SectionTitle>Accessibilité</SectionTitle>
            <p className="mb-3 font-satoshi text-[13px] text-neve-text-muted">
              Zone géographique pour limiter vos résultats en priorité
            </p>

            <div className="flex overflow-hidden rounded-xl border border-neve-border">
              {(
                [
                  { value: "idf", label: "Île-de-France", hint: "Pass Navigo" },
                  { value: "all", label: "France entière", hint: null },
                ] as const
              ).map(({ value, label, hint }) => {
                const isSelected = filters.zone === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange({ ...filters, zone: value })}
                    className={`flex-1 cursor-pointer px-3 py-2 font-satoshi text-[13px] transition ${
                      isSelected
                        ? "bg-neve-button-secondary text-neve-button-secondary-text"
                        : "bg-neve-card text-neve-text hover:bg-neve-surface"
                    }`}
                  >
                    <span className="block font-medium">{label}</span>
                    {hint && <span className="block text-[11px] opacity-75">{hint}</span>}
                  </button>
                );
              })}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between font-satoshi text-sm text-neve-text">
              Départ desservi par une gare
              <input
                type="checkbox"
                checked={filters.transitOnly}
                onChange={(event) => onChange({ ...filters, transitOnly: event.target.checked })}
                className="size-5 cursor-pointer rounded border-neve-border-strong text-neve-tint focus:ring-neve-tint"
              />
            </label>
          </section>

          <section className="border-t border-neve-border-subtle py-6">
            <SectionTitle>Type de parcours</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROUTE_TYPE_LABELS.map(({ value, label }) => {
                const isSelected = filters.routeTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRouteType(value)}
                    className={`cursor-pointer rounded-[12px] px-3 py-1.5 font-satoshi text-[13px] transition ${
                      isSelected
                        ? "bg-neve-button-secondary text-neve-button-secondary-text"
                        : "bg-neve-surface text-neve-text hover:bg-neve-border"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-neve-border-subtle px-7 py-4">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="cursor-pointer font-satoshi text-sm font-medium text-neve-text underline-offset-4 hover:underline"
          >
            Tout effacer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl bg-neve-button-primary px-6 py-3 font-satoshi text-sm font-bold text-neve-text-on-brand transition hover:bg-neve-button-primary-hover"
          >
            Afficher les {resultCount} résultats
          </button>
        </footer>
      </div>
    </div>
  );
}
