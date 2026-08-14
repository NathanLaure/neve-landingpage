"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteHikeIds, addFavorite, removeFavorite } from "@/lib/favorites";

interface FavoritesContextType {
  isLoading: boolean;
  isFavorite: (hikeId: string) => boolean;
  isPending: (hikeId: string) => boolean;
  toggleFavorite: (hikeId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    getFavoriteHikeIds(user.id).then(({ ids, error }) => {
      if (cancelled) return;
      if (!error) setFavoriteIds(new Set(ids));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Only called by UI that has already confirmed `user` is set — an anonymous
  // visitor is redirected to /signin before this is ever invoked.
  const toggleFavorite = useCallback(
    async (hikeId: string) => {
      if (!user || pendingIds.has(hikeId)) return;
      const wasFavorited = favoriteIds.has(hikeId);

      setPendingIds((prev) => new Set(prev).add(hikeId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.delete(hikeId) : next.add(hikeId);
        return next;
      });

      const { error } = wasFavorited
        ? await removeFavorite(user.id, hikeId)
        : await addFavorite(user.id, hikeId);

      if (error) {
        // Roll back the optimistic update if the write failed server-side.
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          wasFavorited ? next.add(hikeId) : next.delete(hikeId);
          return next;
        });
      }

      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(hikeId);
        return next;
      });
    },
    [user, favoriteIds, pendingIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        isLoading,
        isFavorite: (hikeId) => favoriteIds.has(hikeId),
        isPending: (hikeId) => pendingIds.has(hikeId),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
