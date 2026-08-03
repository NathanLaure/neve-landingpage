"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  KeyRound,
  AlertCircle,
  Smartphone,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import PromoPhone3 from "@/public/images/promo-phone-3.png";

type PasswordCriteria = {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

function ResetPasswordContent() {
  const [status, setStatus] = useState<"loading" | "form" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form inputs & toggle visibility
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Mobile detection & auto-redirection countdown
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Criteria evaluation
  const criteria: PasswordCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword),
  };

  const isPasswordValid =
    criteria.length &&
    criteria.uppercase &&
    criteria.number &&
    criteria.special;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = isPasswordValid && passwordsMatch;

  // 1. Detect platform (mobile vs desktop)
  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        typeof navigator !== "undefined"
          ? navigator.userAgent || navigator.vendor || (window as any).opera
          : "";
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice =
        mobileRegex.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Parse URL tokens / auth state & validate Supabase recovery session
  useEffect(() => {
    let isMounted = true;

    // Listen to Supabase auth state change (e.g. PASSWORD_RECOVERY event)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setStatus("form");
        }
      }
    );

    const initSession = async () => {
      try {
        if (typeof window === "undefined") return;

        const hash = window.location.hash;
        const search = window.location.search;
        const searchParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

        // Check for error in query or hash params
        const errorDesc =
          searchParams.get("error_description") ||
          hashParams.get("error_description");

        if (errorDesc) {
          if (isMounted) {
            setErrorMessage(
              decodeURIComponent(errorDesc).replace(/\+/g, " ")
            );
            setStatus("error");
          }
          return;
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        const code = searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session from hash:", error.message);
            if (isMounted) {
              setErrorMessage("Le lien de réinitialisation est invalide ou a expiré.");
              setStatus("error");
            }
            return;
          }

          if (isMounted) setStatus("form");
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Error exchanging code for session:", error.message);
            if (isMounted) {
              setErrorMessage("Le lien de réinitialisation est invalide ou a expiré.");
              setStatus("error");
            }
            return;
          }

          if (isMounted) setStatus("form");
          return;
        }

        // Check active existing session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (isMounted) setStatus("form");
        } else if (type === "recovery") {
          // Recovery link without explicit session set yet
          if (isMounted) setStatus("form");
        } else {
          // No session & no valid token
          if (isMounted) {
            setErrorMessage(
              "Aucun jeton de réinitialisation trouvé. Le lien est peut-être expiré ou déjà utilisé."
            );
            setStatus("error");
          }
        }
      } catch (err: any) {
        console.error("Unexpected session check error:", err);
        if (isMounted) {
          setErrorMessage(
            err.message || "Une erreur inattendue est survenue."
          );
          setStatus("error");
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Optional soft auto-redirection to mobile app after 5s on success
  useEffect(() => {
    if (status !== "success" || !isMobile) return;

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          window.location.href = "neve://auth/callback";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, isMobile]);

  // Handle password update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setSubmitError(
          error.message ||
            "Erreur lors de la mise à jour. Veuillez demander un nouveau lien."
        );
        setIsSubmitting(false);
        return;
      }

      setStatus("success");
    } catch (err: any) {
      setSubmitError(
        err.message || "Une erreur inattendue est survenue. Veuillez réessayer."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
      <div className="relative rounded-3xl bg-white p-8 sm:p-12 md:p-14 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300">
        
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center space-y-6 py-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#eb490b]" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Vérification du lien...
              </h1>
              <p className="text-base text-gray-500">
                Nous vérifions votre demande de réinitialisation, veuillez patienter un instant.
              </p>
            </div>
          </div>
        )}

        {/* Password Reset Form State */}
        {status === "form" && (
          <div className="space-y-8">
            {/* Header Icon & Titles */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6ed] border-2 border-[#0f172b]">
                <KeyRound className="h-7 w-7 text-[#eb490b]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Nouveau mot de passe
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                Choisissez un nouveau mot de passe sécurisé pour votre compte Névé.
              </p>
            </div>

            {/* Submit error alert */}
            {submitError && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">{submitError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#eb490b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb490b]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={
                      showNewPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#eb490b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb490b]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs font-medium text-red-600 pt-1 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </div>

              {/* Validation Criteria Checklist */}
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 space-y-2.5">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Exigences du mot de passe :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <li
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      criteria.length ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {criteria.length ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 mx-1 shrink-0" />
                    )}
                    <span>Au moins 8 caractères</span>
                  </li>

                  <li
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      criteria.uppercase ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {criteria.uppercase ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 mx-1 shrink-0" />
                    )}
                    <span>Au moins 1 majuscule</span>
                  </li>

                  <li
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      criteria.number ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {criteria.number ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 mx-1 shrink-0" />
                    )}
                    <span>Au moins 1 chiffre</span>
                  </li>

                  <li
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      criteria.special ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {criteria.special ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 mx-1 shrink-0" />
                    )}
                    <span>Au moins 1 caractère spécial (!@#$...)</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-base py-4 px-8 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  onClick={undefined}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Mise à jour en cours...</span>
                    </>
                  ) : (
                    <span>Mettre à jour le mot de passe</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Mot de passe mis à jour avec succès ! 🎉
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto pt-1">
                Votre nouveau mot de passe a été enregistré. Vous pouvez maintenant vous connecter à votre compte Névé.
              </p>
            </div>

            {/* Actions Block */}
            <div className="pt-2 sm:pt-4 space-y-8">
              {isMobile ? (
                <div className="space-y-4">
                  <Button
                    href="neve://auth/callback"
                    variant="primary"
                    className="w-full text-base py-4 px-8 shadow-md flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-5 w-5" />
                    <span>Ouvrir l'application Névé</span>
                  </Button>

                  {countdown !== null && countdown > 0 && (
                    <p className="text-xs text-gray-500 animate-pulse pt-1">
                      Redirection automatique vers l'application dans {countdown}s...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    href="neve://auth/callback"
                    variant="primary"
                    className="w-full text-base py-4 px-8 shadow-md flex items-center justify-center gap-2"
                  >
                    <Compass className="h-5 w-5" />
                    <span>Se connecter à Névé</span>
                  </Button>
                </div>
              )}

              {/* Clean App Download Box with Black Border (Matching confirmed style) */}
              <div className="rounded-3xl bg-[#fff6ed] p-6 sm:p-8 border-2 border-[#0f172b] text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Phone Visual Container */}
                  <div className="w-28 sm:w-36 shrink-0 flex justify-center py-1 sm:py-0">
                    <div className="relative drop-shadow-xl">
                      <Image
                        src={PromoPhone3}
                        alt="Application Névé Carte et Itinéraire"
                        className="w-full h-auto object-contain"
                        priority
                      />
                    </div>
                  </div>

                  {/* Content & Store Badges */}
                  <div className="flex-1 space-y-4 text-center sm:text-left min-w-0">
                    <div className="space-y-2">
                      <span className="font-bricolage font-extrabold text-xl sm:text-2xl text-[#292929] block leading-snug">
                        Emportez Névé dans votre poche
                      </span>
                      <p className="font-satoshi text-xs sm:text-sm text-[#525252] leading-relaxed font-medium">
                        Retrouvez vos cartes hors-ligne, tracés GPX et la géolocalisation en temps réel sur les sentiers.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <a
                        href="#download-ios"
                        className="hover:scale-105 transition-transform"
                      >
                        <Image
                          src="/images/app-apple-fr-FR.d5bac4a9.svg"
                          alt="Télécharger dans l'App Store"
                          width={135}
                          height={40}
                          className="h-[40px] w-auto object-contain"
                        />
                      </a>
                      <a
                        href="#download-android"
                        className="hover:scale-105 transition-transform"
                      >
                        <Image
                          src="/images/app-google-fr-FR.922a8286.svg"
                          alt="Disponible sur Google Play"
                          width={135}
                          height={40}
                          className="h-[40px] w-auto object-contain"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-500 hover:text-[#eb490b] underline underline-offset-4 transition-colors"
                >
                  Retourner à l'accueil
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center space-y-8 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-2 border-red-200 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Lien expiré ou invalide
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                {errorMessage ||
                  "Le lien de réinitialisation est invalide ou a expiré. Pour des raisons de sécurité, les liens d'activation ne peuvent être utilisés qu'une seule fois."}
              </p>
            </div>

            <div className="pt-2 space-y-4">
              {isMobile ? (
                <Button
                  href="neve://auth/callback"
                  variant="primary"
                  className="w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>Demander un nouveau lien depuis l'application</span>
                </Button>
              ) : (
                <Button
                  href="/"
                  variant="primary"
                  className="w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  <Compass className="h-5 w-5" />
                  <span>Demander un nouveau lien</span>
                </Button>
              )}

              <div className="pt-1">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#eb490b] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retourner à l'accueil</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
          <div className="relative rounded-3xl bg-white p-14 text-center shadow-lg border border-gray-100">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#eb490b]" />
            <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
