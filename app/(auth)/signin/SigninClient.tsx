"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translateAuthError, isValidEmail } from "@/lib/auth-errors";
import Button from "@/components/ui/button";
import CustomLink from "@/components/ui/link";
import OAuthButtons from "@/components/auth/oauth-buttons";
import { useAuth } from "@/context/AuthContext";

export default function SigninClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/explorer");
    }
  }, [isAuthLoading, user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = isValidEmail(email) && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setSubmitError(translateAuthError(error));
      setIsSubmitting(false);
      return;
    }

    router.push("/explorer");
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Se connecter</h1>
        <p className="mt-2 text-sm text-gray-600">
          Retrouvez vos randonnées Névé sur le site ou dans l&apos;app.
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
                autoComplete="current-password"
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
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </Button>
        </div>
      </form>

      <OAuthButtons />

      {/* Bottom links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <CustomLink
          className="text-sm text-gray-700 underline hover:no-underline"
          href="/reset-password"
        >
          Mot de passe oublié
        </CustomLink>
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <CustomLink href="/signup" variant="brand">
            Créer un compte
          </CustomLink>
        </p>
      </div>
    </>
  );
}
