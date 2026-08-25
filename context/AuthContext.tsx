"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-errors";
import AuthModal from "@/components/auth/AuthModal";

/* Sur l'apex et non le www, contrairement au reste du site : cette URL doit
   figurer telle quelle dans la liste des redirections autorisees de Supabase.
   La changer ici sans l'ajouter la-bas casserait la confirmation d'inscription. */
const EMAIL_REDIRECT_TO = "https://neve-rando.fr/auth/confirmed";

export type AuthModalStep = "entry" | "login" | "signup" | "verify-email" | "forgot-password";

export interface OpenAuthModalOptions {
  initialEmail?: string;
  initialStep?: AuthModalStep;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  defaultStation?: string;
  homeLocation?: string;
  homeLat?: number;
  homeLng?: number;
  transportPasses: string[];
  newsletterConsent: boolean;
  hasNavigo: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  // Auth Modal State & Controls
  isAuthModalOpen: boolean;
  authModalEmail: string;
  authModalInitialStep: AuthModalStep;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  // Auth Actions
  checkUserProvider: (email: string) => Promise<{ exists: boolean; providers: string[] }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    /** Consentement à l'infolettre, demandé à l'inscription. Faux par défaut. */
    newsletterConsent?: boolean
  ) => Promise<{ error: string | null; isResent?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalEmail, setAuthModalEmail] = useState("");
  const [authModalInitialStep, setAuthModalInitialStep] = useState<AuthModalStep>("entry");

  const loadUserProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      const meta = currentUser.user_metadata || {};
      const rawPasses =
        data?.transport_passes ||
        meta.transport_passes ||
        meta.transportPasses ||
        (meta.has_navigo ? ["navigo"] : []);
      const passes = Array.isArray(rawPasses) ? rawPasses : [];
      const hasNavigo = passes.includes("navigo") || Boolean(meta.has_navigo);

      setProfile({
        id: currentUser.id,
        fullName:
          data?.full_name ||
          meta.full_name ||
          currentUser.email?.split("@")[0] ||
          "Randonneur",
        avatarUrl: data?.avatar_url || meta.avatar_url || meta.picture,
        defaultStation: data?.default_station || "Paris Gare de Lyon",
        homeLocation: data?.home_location || meta.home_location || meta.homeLocation,
        homeLat: data?.home_lat != null ? Number(data.home_lat) : undefined,
        homeLng: data?.home_lng != null ? Number(data.home_lng) : undefined,
        transportPasses: passes,
        newsletterConsent: data?.newsletter_consent ?? meta.newsletter_consent ?? false,
        hasNavigo,
      });
    } catch {
      const meta = currentUser.user_metadata || {};
      const rawPasses =
        meta.transport_passes ||
        meta.transportPasses ||
        (meta.has_navigo ? ["navigo"] : []);
      const passes = Array.isArray(rawPasses) ? rawPasses : [];
      setProfile({
        id: currentUser.id,
        fullName: meta.full_name || currentUser.email?.split("@")[0] || "Randonneur",
        avatarUrl: meta.avatar_url || meta.picture,
        defaultStation: "Paris Gare de Lyon",
        homeLocation: meta.home_location || meta.homeLocation,
        transportPasses: passes,
        newsletterConsent: meta.newsletter_consent ?? false,
        hasNavigo: passes.includes("navigo") || Boolean(meta.has_navigo),
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user);
    }
  }, [user, loadUserProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadUserProfile(currentUser).then(() => {
        setIsLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadUserProfile(currentUser).then(() => {
        setIsLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  // Check URL params on mount to auto-open modal if requested (e.g. /?auth=open or /?auth=signin)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth");
      if (authParam) {
        if (authParam === "signin" || authParam === "login") {
          setIsAuthModalOpen(true);
          setAuthModalInitialStep("entry");
        } else if (authParam === "signup" || authParam === "register") {
          setIsAuthModalOpen(true);
          setAuthModalInitialStep("entry");
        } else if (authParam === "open") {
          setIsAuthModalOpen(true);
        }
      }
    }
  }, []);

  const openAuthModal = useCallback((options?: OpenAuthModalOptions) => {
    setAuthModalEmail(options?.initialEmail || "");
    setAuthModalInitialStep(options?.initialStep || "entry");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const checkUserProvider = async (
    email: string
  ): Promise<{ exists: boolean; providers: string[] }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.rpc("check_user_provider", {
        email_input: cleanEmail,
      });

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          exists: !!row.user_exists,
          providers: Array.isArray(row.providers) ? row.providers : [],
        };
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      return {
        exists: !!profileData,
        providers: profileData ? ["email"] : [],
      };
    } catch {
      return { exists: false, providers: [] };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { error: translateAuthError(error) };
      }

      return { error: null };
    } catch (e) {
      return { error: translateAuthError(e) };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    newsletterConsent = false
  ): Promise<{ error: string | null; isResent?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: EMAIL_REDIRECT_TO,
          data: {
            full_name: fullName?.trim(),
            default_station: "Paris Gare de Lyon",
            newsletter_consent: newsletterConsent,
          },
        },
      });

      if (error) {
        if (
          error.message?.includes("User already registered") ||
          error.message?.includes("user_already_exists")
        ) {
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: cleanEmail,
            options: { emailRedirectTo: EMAIL_REDIRECT_TO },
          });
          if (!resendError) {
            return { error: null, isResent: true };
          }
        }
        return { error: translateAuthError(error) };
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName?.trim() || cleanEmail.split("@")[0],
          default_station: "Paris Gare de Lyon",
          newsletter_consent: false,
          updated_at: new Date().toISOString(),
        });
      }

      return { error: null };
    } catch (e) {
      return { error: translateAuthError(e) };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: translateAuthError(error) };
      }

      return { error: null };
    } catch (e) {
      return { error: translateAuthError(e) };
    }
  };

  const displayName =
    profile?.fullName?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    null;

  const avatarUrl =
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        displayName,
        avatarUrl,
        refreshProfile,
        signOut,
        isAuthModalOpen,
        authModalEmail,
        authModalInitialStep,
        openAuthModal,
        closeAuthModal,
        checkUserProvider,
        signIn,
        signUp,
        resetPassword,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
