"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Rows3, LayoutGrid } from "lucide-react";
import type { HikeSummary } from "@/types/hike";
import RandoCard from "@/components/ui/rando-card";
import HikeListRow from "@/components/explorer/hike-list-row";
import HikeRail from "@/components/explorer/hike-rail";

export type PanelDensity = "cards" | "list";

export type HikeSort = "nearest" | "distance" | "duration";

const SORT_LABELS: Record<HikeSort, string> = {
  nearest: "Le plus proche",
  distance: "Le plus court",
  duration: "Le plus rapide",
};

/**
 * Nombre de randonnées montées d'emblée, puis ajoutées à chaque palier.
 *
 * Le panneau reçoit toute la liste d'un coup — elle sert aussi à poser les
 * marqueurs — mais n'en monte qu'une tranche : cinq cents cartes rendues
 * ensemble bloquent le fil principal une seconde entière, et personne ne
 * descend jusqu'à la cinq centième.
 */
const PAGE_SIZE = 20;

interface HikePanelProps {
  hikes: HikeSummary[];
  activeId?: string | null;
  onSelect?: (hikeId: string) => void;
  onHover?: (hikeId: string | null) => void;
  sort: HikeSort;
  onSortChange: (sort: HikeSort) => void;
  /** Désactive « Le plus proche » quand aucune position n'est connue. */
  canSortByProximity?: boolean;
  isFavorite?: (hikeId: string) => boolean;
  isFavoritePending?: (hikeId: string) => boolean;
  /** Absent, le cœur n'est pas rendu sur les cartes. */
  onFavoriteClick?: (hikeId: string) => void;
  /** Le badge Navigo depend du randonneur : c'est a l'appelant de trancher. */
  showsNavigoBadge?: (hike: HikeSummary) => boolean;
}

/**
 * Panneau des itinéraires, à gauche de la carte.
 *
 * Trois états : cartes (par défaut), liste compacte, et replié en rail de
 * vignettes. Le premier bouton replie, le second change la densité — deux
 * gestes distincts pour deux besoins distincts : gagner de la carte, ou
 * comparer davantage d'itinéraires.
 *
 * Absent sur mobile : la carte n'y est pas rendue du tout, la page se réduit à
 * la liste. Une carte utile demande de la place et deux mains ; celle de la
 * fiche randonnée et celle de l'application font mieux le travail.
 */
export default function HikePanel({
  hikes,
  activeId,
  onSelect,
  onHover,
  sort,
  onSortChange,
  canSortByProximity = false,
  isFavorite,
  isFavoritePending,
  onFavoriteClick,
  showsNavigoBadge,
}: HikePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [density, setDensity] = useState<PanelDensity>("cards");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Une nouvelle recherche remet la liste à son premier palier : garder le
     précédent afficherait d'emblée cent résultats qu'on n'a pas demandés. */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [hikes]);

  const visibleHikes = useMemo(() => hikes.slice(0, visibleCount), [hikes, visibleCount]);
  const hasMore = visibleCount < hikes.length;

  /*
   * Chargement au défilement par sentinelle : un observateur d'intersection
   * plutôt qu'un écouteur de `scroll`, qui se déclencherait des dizaines de
   * fois par seconde pour une décision qu'on prend une fois par palier.
   */
  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, hikes.length));
  }, [hikes.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      /* Une longueur d'avance : la tranche suivante est montée avant que le
         bas de la liste n'arrive à l'écran, le défilement ne marque pas. */
      { root: scrollRef.current, rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (isCollapsed) {
    return (
      <aside className="hidden h-full w-[92px] shrink-0 flex-col bg-neve-card md:flex">
        <div className="flex items-center justify-center px-3 py-4">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            aria-label="Déplier la liste des itinéraires"
            className="flex size-9 cursor-pointer items-center justify-center text-neve-text-muted transition-colors hover:text-neve-text"
          >
            <PanelLeftOpen className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <HikeRail hikes={hikes} activeId={activeId} onSelect={onSelect} onHover={onHover} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col bg-neve-card md:w-[420px] lg:w-[452px]">
      <header className="flex items-center justify-between px-6 pt-4 pb-4">
        <h1 className="font-bricolage text-2xl font-bold text-neve-text">Itinéraires</h1>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          aria-label="Replier la liste des itinéraires"
          className="hidden size-9 cursor-pointer items-center justify-center text-neve-text-muted transition-colors hover:text-neve-text md:flex"
        >
          <PanelLeftClose className="size-5" />
        </button>
      </header>

      <div className="flex items-center justify-between gap-3 px-6 pb-3">
        <p className="font-satoshi text-[13px] text-neve-text-muted">
          {hikes.length} {hikes.length > 1 ? "itinéraires" : "itinéraire"}
        </p>

        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="hike-sort">
            Trier les itinéraires
          </label>
          <select
            id="hike-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as HikeSort)}
            className="cursor-pointer rounded-lg border-0 bg-transparent py-1 pr-7 pl-2 font-satoshi text-[13px] font-medium text-neve-text focus:ring-2 focus:ring-neve-tint"
          >
            {(Object.keys(SORT_LABELS) as HikeSort[]).map((value) => (
              <option
                key={value}
                value={value}
                disabled={value === "nearest" && !canSortByProximity}
              >
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setDensity(density === "cards" ? "list" : "cards")}
            aria-label={
              density === "cards" ? "Afficher en liste compacte" : "Afficher en cartes"
            }
            className="flex size-8 cursor-pointer items-center justify-center text-neve-text-muted transition-colors hover:text-neve-text"
          >
            {density === "cards" ? (
              <Rows3 className="size-[18px]" />
            ) : (
              <LayoutGrid className="size-[18px]" />
            )}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-8">
        {hikes.length === 0 ? (
          <p className="py-12 text-center font-satoshi text-sm text-neve-text-muted">
            Aucun itinéraire dans cette zone. Élargis la recherche ou déplace la carte.
          </p>
        ) : (
          <>
            {/* `-mx-2` en mode cartes : le rembourrage qui porte le fond de
                survol déborderait sinon vers l'intérieur, et les images ne
                seraient plus alignées sur les bords du panneau. */}
            <div
              className={
                density === "cards" ? "-mx-2 flex flex-col gap-6" : "flex flex-col gap-1"
              }
            >
              {visibleHikes.map((hike) =>
                density === "cards" ? (
                  /* Le survol passe par une enveloppe : `RandoCard` sert aussi
                     ailleurs sur le site, et n'a pas à connaître la carte. */
                  <div
                    key={hike.id}
                    onMouseEnter={() => onHover?.(hike.id)}
                    onMouseLeave={() => onHover?.(null)}
                  >
                  <RandoCard
                    hike={hike}
                    onClick={onSelect}
                    isFavorited={isFavorite?.(hike.id)}
                    isFavoritePending={isFavoritePending?.(hike.id)}
                    onFavoriteClick={onFavoriteClick}
                    showNavigoBadge={showsNavigoBadge?.(hike)}
                    className={`rounded-2xl p-2 transition-colors hover:bg-neve-surface ${
                      activeId === hike.id ? "bg-neve-surface" : ""
                    }`}
                  />
                  </div>
                ) : (
                  <HikeListRow
                    key={hike.id}
                    hike={hike}
                    isActive={activeId === hike.id}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                ),
              )}
            </div>

            <div ref={sentinelRef} aria-hidden className="h-px" />

            {hasMore && (
              <p className="py-6 text-center font-satoshi text-[13px] text-neve-text-muted">
                Chargement…
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
