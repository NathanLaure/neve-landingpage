import type { HikeDifficulty } from "@/types/hike";

const DIFFICULTY_LABELS: Record<HikeDifficulty, string> = {
  facile: "Facile",
  modere: "Modéré",
  difficile: "Difficile",
  expert: "Expert",
};

const DIFFICULTY_COLORS: Record<HikeDifficulty, string> = {
  facile: "text-emerald-600",
  modere: "text-brand-orange-hover",
  difficile: "text-rose-600",
  expert: "text-rose-700",
};

export function formatDifficultyLabel(difficulty: HikeDifficulty): string {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

export function formatDifficultyColor(difficulty: HikeDifficulty): string {
  return DIFFICULTY_COLORS[difficulty] ?? "text-brand-dark/70";
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${String(mins).padStart(2, "0")}`;
}

export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

export function formatElevation(meters: number): string {
  return `+${Math.round(meters)}m`;
}
