"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Heart, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { supabase } from "@/lib/supabase";
import type { HikeSummary } from "@/types/hike";
import Button from "@/components/ui/button";
import RandoCard from "@/components/ui/rando-card";

const LIST_COLUMNS =
  "id, title, distance_km, elevation_gain_m, elevation_loss_m, duration_minutes, difficulty, start_lat, start_lng, location_name, cover_image_url, gallery_urls";

export default function FavoritesClient() {
  const { user, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();

  const [hikes, setHikes] = useState<HikeSummary[]>([]);
  const [isLoadingHikes, setIsLoadingHikes] = useState(true);

  // Fetch favorite hikes when user is authenticated
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      setHikes([]);
      setIsLoadingHikes(false);
      return;
    }

    let cancelled = false;
    setIsLoadingHikes(true);

    async function loadFavoriteHikes() {
      // 1. Fetch user favorite hike IDs and their added timestamp
      const { data: favData, error: favError } = await supabase
        .from("user_favorites")
        .select("hike_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (favError || !favData || favData.length === 0) {
        if (!cancelled) {
          setHikes([]);
          setIsLoadingHikes(false);
        }
        return;
      }

      const hikeIds = favData.map((f) => f.hike_id);

      // 2. Fetch full hike objects for these IDs
      const { data: hikeData, error: hikeError } = await supabase
        .from("hikes")
        .select(LIST_COLUMNS)
        .in("id", hikeIds);

      if (!cancelled) {
        if (!hikeError && hikeData) {
          // Preserve the ordering of `favData` (most recent first by default)
          const idToHikeMap = new Map((hikeData as unknown as HikeSummary[]).map((h) => [h.id, h]));
          const orderedHikes = hikeIds
            .map((id) => idToHikeMap.get(id))
            .filter((h): h is HikeSummary => h !== undefined);
          setHikes(orderedHikes);
        } else {
          setHikes([]);
        }
        setIsLoadingHikes(false);
      }
    }

    loadFavoriteHikes();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

  // Filter active favorite hikes
  const favoriteHikes = useMemo(() => {
    return hikes.filter((hike) => isFavorite(hike.id));
  }, [hikes, isFavorite]);

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-36 pb-24 text-[#1C1914]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-bricolage font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#1C1914] tracking-tight">
            Mes Favoris
          </h1>
          <p className="font-satoshi text-sm sm:text-base text-[#575246] mt-2 max-w-xl">
            Retrouvez toutes vos randonnées coups de cœur, synchronisées instantanément avec votre application mobile Névé.
          </p>
        </div>

        {/* STATE 1: Loading Skeleton */}
        {isAuthLoading || isLoadingHikes ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse space-y-3"
              >
                <div className="aspect-[16/10] w-full rounded-2xl bg-[#EAE6DC]/60" />
                <div className="space-y-2 pt-1">
                  <div className="h-5 w-3/4 rounded-md bg-[#EAE6DC]/60" />
                  <div className="h-4 w-1/2 rounded-md bg-[#EAE6DC]/40" />
                </div>
                <div className="h-4 w-2/3 rounded-md bg-[#EAE6DC]/40" />
              </div>
            ))}
          </div>
        ) : !user ? (
          /* STATE 2: Unauthenticated User Prompt */
          <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-[32px] bg-white border border-[#D6D0C2] shadow-sm space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FFF0E8] border border-[#EB490B]/20 flex items-center justify-center text-[#EB490B]">
              <Heart className="w-8 h-8 fill-current text-[#EB490B]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-bricolage font-extrabold text-2xl sm:text-3xl text-[#1C1914]">
                Connectez-vous pour voir vos favoris
              </h2>
              <p className="font-satoshi text-sm sm:text-base text-[#575246] leading-relaxed">
                Connectez-vous ou créez un compte gratuit pour enregistrer vos itinéraires préférés et y accéder depuis votre ordinateur ou l&apos;app Névé.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => openAuthModal({ initialStep: "entry" })}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Se connecter / S&apos;inscrire
              </Button>
              <Link
                href="/explorer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#D6D0C2] bg-white text-sm font-bold text-[#1C1914] hover:bg-gray-50 transition"
              >
                Explorer sans compte
              </Link>
            </div>
          </div>
        ) : favoriteHikes.length === 0 ? (
          /* STATE 3: Empty State (No favorites yet) */
          <div className="max-w-lg mx-auto my-12 p-8 sm:p-12 text-center rounded-[32px] bg-white border border-[#D6D0C2] shadow-sm space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#D6D0C2] flex items-center justify-center text-[#575246]">
              <Heart className="w-8 h-8 text-[#A8A190]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-bricolage font-extrabold text-2xl sm:text-3xl text-[#1C1914]">
                Aucun favori pour l&apos;instant
              </h2>
              <p className="font-satoshi text-sm sm:text-base text-[#575246] leading-relaxed">
                Explorez notre sélection de randonnées sans voiture et cliquez sur le cœur ❤️ pour sauvegarder vos parcours préférés.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/explorer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] text-white font-bold text-sm shadow-xs transition active:scale-98"
              >
                <Compass className="w-4 h-4" />
                <span>Explorer les randonnées</span>
              </Link>
            </div>
          </div>
        ) : (
          /* STATE 4: Favorite Hikes Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteHikes.map((hike) => (
              <RandoCard
                key={hike.id}
                hike={hike}
                isFavorited={isFavorite(hike.id)}
                isFavoritePending={isFavoritePending(hike.id)}
                onFavoriteClick={() => toggleFavorite(hike.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
