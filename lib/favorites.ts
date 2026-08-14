import { supabase } from "./supabase";

// Mirrors the mobile app's `user_favorites` table (supabase/migrations/20260804_create_hikes_favorites_comments.sql
// in the neve repo) so a save on the web shows up in the app and vice versa.

export async function getFavoriteHikeIds(
  userId: string
): Promise<{ ids: string[]; error: string | null }> {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("hike_id")
    .eq("user_id", userId);

  if (error) return { ids: [], error: error.message };
  return { ids: (data ?? []).map((row) => row.hike_id as string), error: null };
}

export async function addFavorite(userId: string, hikeId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_favorites")
    .insert({ user_id: userId, hike_id: hikeId });
  return { error: error ? error.message : null };
}

export async function removeFavorite(userId: string, hikeId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("hike_id", hikeId);
  return { error: error ? error.message : null };
}
