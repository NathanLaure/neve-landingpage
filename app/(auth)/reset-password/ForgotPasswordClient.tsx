"use client";

import { useState } from "react";
import { Loader2, Mail, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translateAuthError, isValidEmail } from "@/lib/auth-errors";
import Button from "@/components/ui/button";
import CustomLink from "@/components/ui/link";

// Kept in sync with the mobile app's recovery redirect (context/AuthContext.tsx)
// so both platforms land on the same "set a new password" bridge page.
const RESET_REDIRECT_TO = "https://neve-rando.fr/auth/reset-password";

export default function ForgotPasswordClient() {
  const [status, setStatus] = useState<"form" | "success">("form");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: RESET_REDIRECT_TO,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(translateAuthError(error));
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6ed] border-2 border-[#0f172b]">
          <Mail className="h-7 w-7 text-[#eb490b]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Si un compte Névé existe pour{" "}
            <span className="font-semibold text-gray-900">{email.trim()}</span>, un lien de
            réinitialisation vient de lui être envoyé.
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
      <div className="mb-10 space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6ed] border-2 border-[#0f172b]">
          <KeyRound className="h-6 w-6 text-[#eb490b]" />
        </div>
        <h1 className="text-4xl font-bold">Mot de passe oublié</h1>
        <p className="text-sm text-gray-600">
          Entrez l&apos;adresse e-mail associée à votre compte Névé pour recevoir un lien de
          réinitialisation.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">{submitError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
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
                <span>Envoi en cours...</span>
              </>
            ) : (
              <span>Envoyer le lien de réinitialisation</span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <CustomLink
          href="/signin"
          variant="unstyled"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#eb490b] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la connexion</span>
        </CustomLink>
      </div>
    </>
  );
}
