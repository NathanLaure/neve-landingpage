"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, Compass, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import PromoPhone3 from "@/public/images/promo-phone-3.png";

function ConfirmedContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 1. Detect platform (mobile vs desktop)
  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        typeof navigator !== "undefined"
          ? navigator.userAgent || navigator.vendor || (window as any).opera
          : "";
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Parse URL tokens / code & validate session with Supabase
  useEffect(() => {
    let isMounted = true;

    const handleAuthConfirmation = async () => {
      try {
        if (typeof window === "undefined") return;

        const hash = window.location.hash;
        const search = window.location.search;
        const searchParams = new URLSearchParams(search);

        // Check for error in query or hash params
        const errorDesc =
          searchParams.get("error_description") ||
          new URLSearchParams(hash.replace(/^#/, "")).get("error_description");

        if (errorDesc) {
          if (isMounted) {
            setErrorMessage(decodeURIComponent(errorDesc));
            setStatus("error");
          }
          return;
        }

        // Parse hash params (#access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // Parse query params (?code=...)
        const code = searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting Supabase session:", error.message);
            if (isMounted) {
              setErrorMessage(error.message);
              setStatus("error");
            }
            return;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Error exchanging code for session:", error.message);
            if (isMounted) {
              setErrorMessage(error.message);
              setStatus("error");
            }
            return;
          }
        } else {
          // If no parameters in URL, check if active session exists
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            console.log("No explicit session params in URL, treating landing as valid user response.");
          }
        }

        if (isMounted) {
          setStatus("success");
        }
      } catch (err: any) {
        console.error("Unexpected authentication error:", err);
        if (isMounted) {
          setErrorMessage(err.message || "Une erreur inattendue est survenue.");
          setStatus("error");
        }
      }
    };

    handleAuthConfirmation();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Optional soft auto-redirection to deep link on mobile after 5s on success
  useEffect(() => {
    if (status !== "success" || !isMobile) return;

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Trigger soft deep link redirection
          window.location.href = "neve://auth/callback";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, isMobile]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
      <div className="relative rounded-3xl bg-white p-10 sm:p-14 md:p-16 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300">
        
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center space-y-6 py-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#eb490b]" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Validation de votre e-mail...
              </h1>
              <p className="text-base text-gray-500">
                Nous vérifions votre compte, veuillez patienter un instant.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-[40px] leading-tight sm:leading-tight">
                Votre adresse e-mail est confirmée !
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto pt-2">
                Bienvenue sur Névé. Votre compte est prêt pour vos prochaines aventures outdoor sans voiture.
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
                <div>
                  <Button
                    href="/"
                    variant="primary"
                    className="w-full text-base py-4 px-8 shadow-md flex items-center justify-center gap-2"
                  >
                    <Compass className="h-5 w-5" />
                    <span>Explorer les randonnées</span>
                  </Button>
                </div>
              )}

              {/* Clean App Download Box with Black Border (No 3D Shadow) */}
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
                      <a href="#download-ios" className="hover:scale-105 transition-transform">
                        <Image
                          src="/images/app-apple-fr-FR.d5bac4a9.svg"
                          alt="Télécharger dans l'App Store"
                          width={135}
                          height={40}
                          className="h-[40px] w-auto object-contain"
                        />
                      </a>
                      <a href="#download-android" className="hover:scale-105 transition-transform">
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

              {isMobile && (
                <div className="pt-1">
                  <Link
                    href="/"
                    className="text-sm font-medium text-gray-500 hover:text-[#eb490b] underline underline-offset-4 transition-colors"
                  >
                    Continuer sur le site web
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center space-y-8 py-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Confirmation de l'e-mail
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                {errorMessage ||
                  "Le lien de confirmation est invalide ou a expiré. Votre compte a peut-être déjà été validé."}
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
                  <span>Ouvrir l'application Névé</span>
                </Button>
              ) : (
                <Button
                  href="/"
                  variant="primary"
                  className="w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  <Compass className="h-5 w-5" />
                  <span>Retourner à l'accueil</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmedClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
          <div className="relative rounded-3xl bg-white p-14 text-center shadow-lg border border-gray-100">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#eb490b]" />
            <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
          </div>
        </div>
      }
    >
      <ConfirmedContent />
    </Suspense>
  );
}
