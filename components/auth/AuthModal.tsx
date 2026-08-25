"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  MailCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail } from "@/lib/auth-errors";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/ui/social-icon";
import { supabase } from "@/lib/supabase";

type OAuthProvider = "google" | "apple" | "facebook";

const OAUTH_PROVIDERS: {
  id: OAuthProvider;
  label: string;
  icon: (className: string) => React.ReactNode;
}[] = [
  {
    id: "google",
    label: "Continuer avec Google",
    icon: (c) => <GoogleIcon className={c} />,
  },
  {
    id: "apple",
    label: "Continuer avec Apple",
    icon: (c) => <AppleIcon className={c} />,
  },
  {
    id: "facebook",
    label: "Continuer avec Facebook",
    icon: (c) => <FacebookIcon className={c} />,
  },
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


export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalEmail,
    authModalInitialStep,
    checkUserProvider,
    signIn,
    signUp,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState<"entry" | "login" | "signup" | "verify-email" | "forgot-password">("entry");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  /* Décoché par défaut : un consentement pré-coché n'en est pas un. Déclaré
     ici, avec les autres états — plus bas, après le `return null` qui ferme la
     modale, le hook n'aurait été appelé qu'une fois celle-ci ouverte. */
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setInfoMessage(null);
      setSuccessMessage(null);
      setPassword("");
      setShowPassword(false);
      if (authModalEmail) {
        setEmail(authModalEmail);
      }
      setStep(authModalInitialStep || "entry");
    }
  }, [isAuthModalOpen, authModalEmail, authModalInitialStep]);

  // Handle ESC key and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    if (isAuthModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Password validation criteria
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.number &&
    passwordCriteria.special;

  // Step 1: Check Email
  const handleContinueEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail) || isLoading) return;

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    const { exists, providers } = await checkUserProvider(cleanEmail);
    setIsLoading(false);

    if (exists) {
      const hasEmailProvider = providers.includes("email");
      const oAuthProvider = providers.find(
        (p) => p === "google" || p === "apple" || p === "facebook"
      );

      if (!hasEmailProvider && oAuthProvider) {
        const providerName =
          oAuthProvider === "google"
            ? "Google"
            : oAuthProvider === "apple"
            ? "Apple"
            : "Facebook";
        setInfoMessage(
          `Ce compte Névé a été créé avec ${providerName}. Connectez-vous avec le bouton ci-dessous.`
        );
      } else {
        setStep("login");
      }
    } else {
      setStep("signup");
    }
  };

  // Step 2A: Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const res = await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      closeAuthModal();
    }
  };

  // Step 2B: Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !isPasswordValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    const res = await signUp(email.trim().toLowerCase(), password, fullName.trim(), newsletterConsent);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep("verify-email");
    }
  };

  // Step 3: Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail) || isLoading) return;

    setIsLoading(true);
    setError(null);

    const res = await resetPassword(cleanEmail);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Un e-mail de réinitialisation sécurisé vient d'être envoyé à ${cleanEmail}.`);
    }
  };

  // OAuth Handling
  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setInfoMessage(null);
    setLoadingProvider(provider);

    /* La page courante voyage avec la demande : l'aller-retour OAuth quitte le
       site et revient par `/auth/callback`, qui sans cela renvoie tout le monde
       sur l'explorateur. Une invitation ouverte sans compte se perdait donc à
       l'instant même où l'on créait le compte pour la lire. */
    const next = `${window.location.pathname}${window.location.search}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Topbar */}
        <div className="flex items-center justify-between mb-4">
          {step !== "entry" && step !== "verify-email" ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                setSuccessMessage(null);
                if (step === "forgot-password") {
                  setStep("login");
                } else {
                  setStep("entry");
                }
              }}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Global Info Banner (OAuth account hint) */}
        {infoMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs sm:text-sm text-amber-900 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1 font-medium">{infoMessage}</div>
          </div>
        )}

        {/* STEP 1: ENTRY (Email + OAuth) */}
        {step === "entry" && (
          <div className="flex flex-col gap-5">
            {/* Logo Mountain Header */}
            <div className="flex flex-col items-center text-center gap-3 pt-1">
              <svg
                className="w-12 h-12 fill-current text-[#111111]"
                viewBox="0 0 4989 4989"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2178.56 507.406C2266.67 450.963 2373.71 432.392 2475.61 455.869L2475.64 455.878C2533.78 469.145 2590.41 500.366 2644.96 538.753C2699.57 577.189 2750.75 621.794 2798.94 661.527L2798.94 661.53C3176.78 973.035 3477.24 1366.19 3715.59 1794.86L3715.62 1794.92C3773.23 1897.51 3825.79 2002.86 3873.13 2110.6L3873.16 2110.68C3887.23 2142.23 3900.73 2177.17 3916.57 2209.74C3921.8 2220.53 3925.54 2232.05 3930.41 2245.39C3934.92 2257.74 3940.29 2271.2 3948.42 2283.56C3956.93 2302.98 3964.86 2323.57 3971.48 2343.63V2343.64C4010.96 2463.14 4055.65 2582.51 4089.18 2702.39L4089.19 2702.42L4089.2 2702.45C4128.99 2842.46 4158.67 2984.87 4178.14 3128.58L4178.17 3128.75L4178.17 3128.77C4178.17 3128.79 4178.18 3128.82 4178.18 3128.86C4178.2 3128.95 4178.21 3129.09 4178.24 3129.28C4178.29 3129.67 4178.38 3130.25 4178.48 3131.03C4178.7 3132.58 4179.01 3134.92 4179.4 3138C4180.18 3144.16 4181.28 3153.3 4182.52 3165.11C4185.02 3188.74 4188.13 3223.06 4190.53 3265.67C4195.34 3350.9 4197.34 3469.15 4186.12 3601.18C4185.38 3609.91 4191.83 3617.59 4200.54 3618.34C4209.25 3619.08 4216.91 3612.61 4217.65 3603.87C4229.03 3470 4227 3350.2 4222.13 3263.87C4219.69 3220.7 4216.54 3185.85 4214 3161.77C4212.72 3149.72 4211.6 3140.36 4210.79 3134C4210.71 3133.3 4210.61 3132.64 4210.53 3132.02C4213.26 3129.26 4217 3125.52 4221.68 3120.93C4232.39 3110.41 4248.01 3095.48 4267.5 3077.9C4306.52 3042.72 4360.93 2997.08 4422.65 2955.06C4484.49 2912.96 4553.01 2874.94 4620.29 2854.4C4687.62 2833.86 4752 2831.32 4807.21 2857.61C4861.18 2883.31 4900.04 2933.53 4927.68 2996.9C4955.29 3060.21 4971 3135.08 4979.54 3207.37C4988.06 3279.54 4989.34 3448.38 4988.48 3399.24C4988.05 3424.65 4987.09 3445.52 4986.24 3460.01C4985.91 3465.72 4985.58 3470.44 4985.31 3474.05C4981.96 3475.86 4977.51 3478.26 4972.05 3481.17C4958.56 3488.37 4938.9 3498.73 4914.26 3511.35C4864.97 3536.6 4795.79 3570.88 4716.26 3607.02C4556.84 3679.45 4357.12 3758.73 4192.74 3788.21C4065.12 3811.1 3920.23 3824.16 3796.68 3826.85C3734.91 3828.19 3678.71 3826.93 3632.83 3823.06C3586.39 3819.14 3552.24 3812.67 3533.41 3804.45C3495.83 3788.06 3465.82 3753.66 3444.47 3694.56C3423.69 3637.05 3411.66 3557.52 3408.76 3452.29L3408.51 3442.03C3404.71 3097.01 3360.53 2853.64 3282.28 2636.26C3204.17 2419.24 3092.28 2228.68 2954.53 1989.97C2923.18 1935.67 2887.85 1885.06 2852.6 1835.27C2817.24 1785.31 2782.02 1736.27 2750.14 1684.33L2740.55 1668.71L2726.52 1680.47C2721.63 1684.57 2718.01 1687.23 2714.7 1689.77C2711.65 1692.1 2707.94 1694.99 2704.86 1698.84C2698.27 1707.08 2696.63 1717.29 2694.7 1730.14C2685.97 1788.29 2675.55 1849.21 2663.37 1906.52C2633.98 2038.96 2598.38 2169.95 2556.69 2299.04L2556.69 2299.05C2524.5 2398.96 2481.19 2499.87 2439.17 2597.1C2236.84 3065.33 1873.84 3509.55 1388.48 3693.69L1380.01 3696.79C1292.42 3728.59 1202.1 3752.36 1110.2 3767.82L1110.14 3767.83L1110.09 3767.83C958.759 3794.38 856.679 3797.26 703.964 3783.57L703.928 3783.56L703.89 3783.56L692.572 3782.56C681.259 3781.53 669.959 3780.39 658.672 3779.15C543.838 3766.46 430.464 3742.63 320.153 3707.99C263.748 3689.92 211.585 3668.6 153.316 3647.26C145.108 3644.26 136.023 3648.49 133.025 3656.72C130.029 3664.96 134.253 3674.07 142.462 3677.07C199.283 3697.88 253.349 3719.9 310.521 3738.22L310.568 3738.23L310.609 3738.25C420.305 3772.7 532.979 3796.64 647.107 3809.77C648.958 3813.12 651.429 3817.64 654.396 3823.22C661.422 3836.45 671.264 3855.61 682.458 3879.25C704.868 3926.58 732.596 3991.65 754.052 4062.86C775.548 4134.19 790.502 4210.89 787.98 4281.69C785.46 4352.39 765.602 4415.93 718.828 4463.09C680.807 4501.43 623.509 4523.62 556.686 4534.44C490.095 4545.22 415.885 4544.41 346.111 4538.36C276.437 4532.33 211.779 4521.12 164.499 4511.41C140.877 4506.56 121.635 4502.08 108.325 4498.83C103.903 4497.75 100.138 4496.8 97.0847 4496.02C96.6578 4493.92 96.1639 4491.47 95.6115 4488.69C93.3912 4477.5 90.1943 4460.88 86.296 4439.2C78.4989 4395.85 67.9049 4332.3 56.7552 4251.66C34.4541 4090.36 9.9322 3860.72 1.08793 3587.57C-7.71793 3315.6 38.1045 3135.59 96.121 3026.26C125.138 2971.57 156.998 2934.94 186.228 2913.1C215.767 2881.03 241.157 2885.03 258.15 2888.05C302.892 2896.01 342.686 2907.68 371.313 2917.36C385.609 2922.2 397.078 2926.54 404.937 2929.64C408.865 2931.19 411.89 2932.44 413.911 2933.29C414.92 2933.71 415.678 2934.04 416.175 2934.25C416.421 2934.36 416.605 2934.43 416.72 2934.49C416.777 2934.51 416.82 2934.53 416.844 2934.54L416.866 2934.55L416.948 2934.59L417.036 2934.62C481.124 2962.04 547.524 2983.68 615.446 2999.26L615.57 2999.29C821.577 3044.84 1082.37 3040.8 1266.57 2915.91C1525.7 2740.22 1695.26 2475.54 1807.1 2183.15C1918.92 1890.77 1973.4 1569.69 2001.77 1279.72C2010.2 1193.33 2009.73 1098.12 2014.97 1012.84L2015 1012.34V1011.83C2014.78 910.693 2007.97 815.082 2025.5 728.141C2042.72 642.783 2083.33 567.102 2178.43 507.491L2178.5 507.449L2178.56 507.406Z" />
              </svg>
              <h2 className="font-bricolage font-extrabold text-2xl text-[#111111] leading-tight">
                Commencez avec votre mail
              </h2>
            </div>

            {/* Email Form */}
            <form onSubmit={handleContinueEmail} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="auth-email">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Entrer votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#EB490B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EB490B]/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValidEmail(email) || isLoading}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <span>Continuer</span>
                )}
              </button>
            </form>

            {/* Divider: "ou" */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">ou</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2.5">
              {OAUTH_PROVIDERS.filter(({ id }) => !DISABLED_PROVIDERS.includes(id)).map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleOAuth(id)}
                  disabled={loadingProvider !== null}
                  className="flex items-center justify-center gap-3 w-full py-2.5 sm:py-3 px-4 rounded-2xl border-2 border-[#0f172b] bg-white hover:bg-gray-50 active:scale-[0.99] text-xs sm:text-sm font-bold text-[#0f172b] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingProvider === id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0f172b]" />
                  ) : (
                    icon("w-4 h-4 shrink-0")
                  )}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Legal Disclaimer Footer */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                En continuant, vous acceptez nos{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-gray-900 underline hover:text-[#EB490B]"
                >
                  Conditions d’utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-gray-900 underline hover:text-[#EB490B]"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {/* STEP 2A: LOGIN (Password) */}
        {step === "login" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-1.5">
              <h2 className="font-bricolage font-extrabold text-2xl text-[#111111]">
                Bon retour parmi nous !
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200/60 text-xs text-gray-700">
                <span className="font-medium truncate max-w-[220px]">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep("entry")}
                  className="text-[#EB490B] font-bold hover:underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700" htmlFor="login-password">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("forgot-password")}
                    className="text-xs font-semibold text-[#EB490B] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#EB490B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EB490B]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2B: SIGNUP (Name + Password) */}
        {step === "signup" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center text-center gap-1.5">
              <h2 className="font-bricolage font-extrabold text-2xl text-[#111111]">
                Créer votre compte
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200/60 text-xs text-gray-700">
                <span className="font-medium truncate max-w-[220px]">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep("entry")}
                  className="text-[#EB490B] font-bold hover:underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>
            </div>

            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-name">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Corey Barker"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#EB490B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EB490B]/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-password">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#EB490B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EB490B]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Criteria Checklist */}
              {password.length > 0 && (
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100 space-y-1.5">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { ok: passwordCriteria.length, label: "8+ caractères" },
                      { ok: passwordCriteria.uppercase, label: "1 majuscule" },
                      { ok: passwordCriteria.number, label: "1 chiffre" },
                      { ok: passwordCriteria.special, label: "1 caractère spécial" },
                    ].map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          c.ok ? "text-emerald-700" : "text-gray-400"
                        }`}
                      >
                        {c.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        )}
                        <span>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/*
                * Consentement à l'infolettre, demandé ici et non plus jamais.
                *
                * L'inscription du site écrivait `newsletter_consent: false` en
                * dur : personne n'était consulté, et le réglage n'existait que
                * sur la page profil, où il faut penser à aller. L'application
                * le demande, elle, à son inscription.
                *
                * Décoché par défaut : un consentement pré-coché n'en est pas un.
                */}
              <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 text-[#EB490B] focus:ring-[#EB490B]"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Recevoir nos plus belles idées de randonnées accessibles en train, une fois par
                  semaine. Désinscription en un clic, à tout moment.
                </span>
              </label>

              <button
                type="submit"
                disabled={!fullName.trim() || !isPasswordValid || isLoading}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <span>Créer mon compte</span>
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-500 pt-1">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-gray-900 underline">
                Conditions
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-gray-900 underline">
                Confidentialité
              </Link>
              .
            </p>
          </div>
        )}

        {/* STEP 2C: VERIFY EMAIL */}
        {step === "verify-email" && (
          <div className="text-center space-y-5 py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-[#111111]">
              <MailCheck className="h-10 w-10 text-[#111111]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-bricolage font-extrabold text-2xl text-gray-900">
                Vérifiez votre boîte mail
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Un e-mail de confirmation vient d&apos;être envoyé à{" "}
                <strong className="text-gray-900">{email}</strong>. Cliquez sur le lien reçu pour
                activer votre compte Névé.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full py-3 px-4 rounded-2xl bg-[#0f172b] hover:bg-gray-800 text-white font-bold text-sm transition-all cursor-pointer"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FORGOT PASSWORD */}
        {step === "forgot-password" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-1.5">
              <h2 className="font-bricolage font-extrabold text-2xl text-[#111111]">
                Mot de passe oublié
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé.
              </p>
            </div>

            {successMessage ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-800">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] text-white font-bold text-sm transition-all cursor-pointer"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="forgot-email">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Entrer votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#EB490B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EB490B]/20 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValidEmail(email) || isLoading}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer le lien</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
