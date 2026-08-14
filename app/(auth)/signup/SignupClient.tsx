"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Mail,
  User,
  AlertCircle,
  MailCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translateAuthError, isValidEmail } from "@/lib/auth-errors";
import Button from "@/components/ui/button";
import CustomLink from "@/components/ui/link";
import OAuthButtons from "@/components/auth/oauth-buttons";
import { useAuth } from "@/context/AuthContext";

// Kept in sync with the mobile app's confirmation redirect (context/AuthContext.tsx)
// so both platforms land on the same "email confirmed" bridge page.
const EMAIL_REDIRECT_TO = "https://neve-rando.fr/auth/confirmed";

type PasswordCriteria = {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

export default function SignupClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<"form" | "success">("form");

  // Only redirect an already-signed-in visitor away from the form itself —
  // not once they've just submitted and are looking at the "check your email" screen.
  useEffect(() => {
    if (!isAuthLoading && user && status === "form") {
      router.replace("/explorer");
    }
  }, [isAuthLoading, user, status, router]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const criteria: PasswordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid =
    criteria.length && criteria.uppercase && criteria.number && criteria.special;
  const isFormValid = fullName.trim().length > 1 && isValidEmail(email) && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: EMAIL_REDIRECT_TO,
        data: {
          full_name: fullName.trim(),
          default_station: "Paris Gare de Lyon",
          newsletter_consent: false,
        },
      },
    });

    if (error) {
      // Same fallback as the mobile app: a duplicate signup just re-sends the confirmation email.
      if (
        error.message?.includes("User already registered") ||
        error.message?.includes("user_already_exists")
      ) {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
          options: { emailRedirectTo: EMAIL_REDIRECT_TO },
        });
        setIsSubmitting(false);
        if (!resendError) {
          setStatus("success");
          return;
        }
      }
      setSubmitError(translateAuthError(error));
      setIsSubmitting(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: cleanEmail,
        full_name: fullName.trim(),
        default_station: "Paris Gare de Lyon",
        newsletter_consent: false,
        updated_at: new Date().toISOString(),
      });
    }

    setIsSubmitting(false);
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6ed] border-2 border-[#0f172b]">
          <MailCheck className="h-7 w-7 text-[#eb490b]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un e-mail de confirmation vient d&apos;être envoyé à{" "}
            <span className="font-semibold text-gray-900">{email.trim()}</span>. Cliquez sur le
            lien reçu pour activer votre compte Névé.
          </p>
        </div>
        <div className="pt-2">
          <CustomLink href="/signin" variant="brand" className="text-sm">
            Retour à la connexion
          </CustomLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Créer votre compte</h1>
        <p className="mt-2 text-sm text-gray-600">
          Explorez les randonnées sans voiture dès maintenant. La planification complète se fait
          ensuite dans l&apos;app Névé.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">{submitError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="fullName">
              Nom complet
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="fullName"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#eb490b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb490b]/20 transition-colors"
                type="text"
                autoComplete="name"
                placeholder="Corey Barker"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#eb490b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb490b]/20 transition-colors"
                type="email"
                autoComplete="email"
                placeholder="corybarker@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#eb490b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb490b]/20 transition-colors"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 space-y-2">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { ok: criteria.length, label: "Au moins 8 caractères" },
                  { ok: criteria.uppercase, label: "Au moins 1 majuscule" },
                  { ok: criteria.number, label: "Au moins 1 chiffre" },
                  { ok: criteria.special, label: "Au moins 1 caractère spécial" },
                ].map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      c.ok ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {c.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <span>Créer mon compte</span>
            )}
          </Button>
        </div>
      </form>

      <OAuthButtons />

      <div className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <CustomLink href="/signin" variant="brand">
          Se connecter
        </CustomLink>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          En créant un compte, vous acceptez nos{" "}
          <Link className="underline hover:text-gray-600" href="/terms">
            Conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link className="underline hover:text-gray-600" href="/privacy">
            Politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </>
  );
}
