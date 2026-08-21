"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import SharedAdventureView from "@/components/share/shared-adventure-view";
import type { UserAdventure } from "@/types/adventure";

/**
 * Garde d'accès à une feuille de route partagée.
 *
 * Composant client, et c'est tout l'enjeu : la page est rendue côté serveur, où
 * le client Supabase n'a aucune session — il y est toujours anonyme. Tant que
 * la lecture s'y faisait, « réservé aux connectés » ne pouvait rien vouloir
 * dire : le serveur n'avait aucun moyen de savoir qui demandait.
 *
 * Ici la session existe, `get_shared_adventure` n'est ouverte qu'au rôle
 * `authenticated`, et l'accès est donc réellement fermé — pas seulement caché.
 */
export default function SharedAdventureGate({ token }: { token: string }) {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [adventure, setAdventure] = useState<UserAdventure | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing">("idle");

  useEffect(() => {
    if (!user) return;

    let isStale = false;
    setStatus("loading");

    supabase
      .rpc("get_shared_adventure", { p_token: token })
      .maybeSingle()
      .then(({ data, error }) => {
        if (isStale) return;
        setAdventure((data as UserAdventure) ?? null);
        setStatus(error || !data ? "missing" : "ready");
      });

    return () => {
      isStale = true;
    };
  }, [user, token]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    /* Le jeton voyage dans la redirection : après connexion, on revient sur
       cette feuille de route et non sur l'accueil. Perdre le lien à la porte
       serait la façon la plus sûre de perdre l'invité avec. */
    const signinUrl = `/signin?redirect=/share/${token}`;

    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f3ec]">
          <Lock className="h-6 w-6 text-[#1C1914]" />
        </div>
        <h2 className="font-bricolage text-2xl font-extrabold tracking-tight text-[#1C1914] sm:text-3xl">
          Connectez-vous pour voir cette aventure
        </h2>
        <p className="mx-auto mt-3 max-w-md font-satoshi text-[#575246]">
          Quelqu&apos;un vous a partagé sa feuille de route : horaires de train, correspondances et
          itinéraire de la randonnée. Créez un compte gratuit ou connectez-vous pour la consulter,
          et l&apos;ajouter à vos propres aventures.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={signinUrl}>Se connecter</Button>
          <Button href={`/signup?redirect=/share/${token}`} variant="secondary">
            Créer un compte
          </Button>
        </div>
      </div>
    );
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === "missing" || !adventure) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h2 className="font-bricolage text-2xl font-extrabold tracking-tight text-[#1C1914]">
          Aventure introuvable
        </h2>
        <p className="mx-auto mt-3 max-w-md font-satoshi text-[#575246]">
          Ce lien n&apos;est plus valide. Son auteur a peut-être annulé la sortie, ou l&apos;adresse
          a été recopiée en partie.
        </p>
      </div>
    );
  }

  return <SharedAdventureView adventure={adventure} />;
}
