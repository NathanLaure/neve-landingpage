"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-errors";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/ui/social-icon";

type OAuthProvider = "google" | "apple" | "facebook";

const PROVIDERS: { id: OAuthProvider; label: string; icon: (className: string) => React.ReactNode }[] = [
  { id: "apple", label: "Continuer avec Apple", icon: (c) => <AppleIcon className={c} /> },
  { id: "google", label: "Continuer avec Google", icon: (c) => <GoogleIcon className={c} /> },
  { id: "facebook", label: "Continuer avec Facebook", icon: (c) => <FacebookIcon className={c} /> },
];

/**
 * Fournisseurs momentanement retires de l'ecran de connexion.
 *
 * Apple y figure le temps de finaliser sa configuration. Le code du bouton,
 * son icone et le chemin OAuth restent en place : vider ce tableau suffit a le
 * retablir, sans rien reconstruire.
 *
 * A savoir si l'application arrive un jour sur l'App Store : Apple impose
 * "Se connecter avec Apple" des lors qu'un autre service tiers est propose.
 * Cette mise en sommeil ne peut donc pas durer cote iOS.
 */
const DISABLED_PROVIDERS: OAuthProvider[] = ["apple"];


export default function OAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setLoadingProvider(provider);

    // On success this navigates the browser away to the provider, so it never
    // resolves — the callback page (app/(default)/auth/callback) takes over.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (oauthError) {
      setError(translateAuthError(oauthError));
      setLoadingProvider(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium italic text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {PROVIDERS.filter(({ id }) => !DISABLED_PROVIDERS.includes(id)).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleOAuth(id)}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#0f172b] bg-white px-6 py-3 text-sm font-bold text-[#0f172b] transition duration-150 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingProvider === id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              icon("h-5 w-5 shrink-0")
            )}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
