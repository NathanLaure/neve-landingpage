"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Lock, Compass, Smartphone, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Logo from "@/components/ui/logo";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-errors";
import { AppleIcon, GoogleIcon } from "@/components/ui/social-icon";
import type { HikeSnapshot } from "@/types/adventure";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  hike?: HikeSnapshot | null;
  shareToken: string;
}

type OAuthProvider = "google" | "apple";

export default function AuthRequiredModal({
  isOpen,
  onClose,
  hike,
  shareToken,
}: AuthRequiredModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setLoadingProvider(provider);

    const redirectUrl = `${window.location.origin}/auth/callback?redirect=/share/${shareToken}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (oauthError) {
      setError(translateAuthError(oauthError));
      setLoadingProvider(null);
    }
  };

  const signupUrl = `/signup?redirect=/share/${shareToken}`;
  const signinUrl = `/signin?redirect=/share/${shareToken}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] border border-[#EB490B]/20 flex items-center justify-center text-[#EB490B] shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2
              id="auth-modal-title"
              className="font-bricolage font-extrabold text-2xl text-[#111111] leading-tight"
            >
              Accédez au tracé complet
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#525252] leading-relaxed font-satoshi">
              {hike?.title ? (
                <>
                  Connectez-vous ou créez un compte gratuit pour débloquer le tracé GPX de{" "}
                  <strong>{hike.title}</strong> et profiter du guidage GPS en direct.
                </>
              ) : (
                "Créez un compte gratuit pour accéder au tracé GPX interactif et au guidage GPS en direct."
              )}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] text-xs sm:text-sm font-semibold text-[#111111] transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Continuer avec Google</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] text-xs sm:text-sm font-semibold text-[#111111] transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            {loadingProvider === "apple" ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
            ) : (
              <AppleIcon className="w-4 h-4 text-[#111111]" />
            )}
            <span>Continuer avec Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-[#7C7C7C]">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Action Options: Email Signup / Signin */}
        <div className="flex flex-col gap-2">
          <Link
            href={signupUrl}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm text-center"
          >
            <span>Créer un compte avec mon e-mail</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="text-center pt-1">
            <span className="text-xs text-[#525252]">Déjà inscrit ? </span>
            <Link
              href={signinUrl}
              className="text-xs font-bold text-[#111111] hover:text-[#EB490B] underline transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* App Universal Link Callout */}
        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <Smartphone className="w-4 h-4 text-[#EB490B] shrink-0" />
            <span className="text-xs font-medium text-[#525252] truncate">
              Déjà l'app Névé installée ?
            </span>
          </div>
          <a
            href={`neve://share/${shareToken}`}
            className="text-xs font-bold text-[#EB490B] hover:underline shrink-0"
          >
            Ouvrir l'app
          </a>
        </div>

      </div>
    </div>
  );
}
