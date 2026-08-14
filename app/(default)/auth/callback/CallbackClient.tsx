"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Compass } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-errors";
import Button from "@/components/ui/button";

function CallbackContent() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_IN" && session) {
        router.replace("/explorer");
      }
    });

    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(window.location.search);

        const errorDesc =
          searchParams.get("error_description") || hashParams.get("error_description");
        if (errorDesc) {
          if (isMounted) setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, " "));
          return;
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            if (isMounted) setErrorMessage(translateAuthError(error));
            return;
          }
          router.replace("/explorer");
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) setErrorMessage(translateAuthError(error));
            return;
          }
          router.replace("/explorer");
          return;
        }

        // No token/code in the URL: detectSessionInUrl may already have handled it,
        // or there's simply already an active session.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/explorer");
        } else if (isMounted) {
          setErrorMessage("La connexion a échoué. Veuillez réessayer.");
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "Une erreur inattendue est survenue.");
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
      <div className="relative rounded-3xl bg-white p-10 sm:p-14 text-center shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100">
        {errorMessage ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border-2 border-red-200">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Connexion impossible</h1>
              <p className="text-sm text-gray-600 leading-relaxed">{errorMessage}</p>
            </div>
            <Button href="/signin" variant="primary" className="inline-flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Retour à la connexion</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#eb490b]" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Connexion en cours...</h1>
              <p className="text-sm text-gray-500">Un instant, nous finalisons votre connexion.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackClient() {
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
      <CallbackContent />
    </Suspense>
  );
}
