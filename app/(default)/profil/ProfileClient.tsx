"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Train,
  Check,
  LogOut,
  Trash2,
  CheckCircle2,
  Info,
  Loader2,
  KeyRound,
  Camera,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";

const TRANSPORT_PASS_OPTIONS = [
  {
    id: "navigo",
    label: "Pass Navigo (Île-de-France)",
    description: "Accès illimité aux trains Transilien, RER et métros franciliens.",
  },
  {
    id: "sncf_avantage",
    label: "Carte Avantage SNCF",
    description: "Réductions sur TGV INOUI et Intercités en France.",
  },
  {
    id: "sncf_liberte",
    label: "Carte Liberté SNCF",
    description: "Tarifs réduits professionnels et loisirs flexibles.",
  },
  {
    id: "ter",
    label: "Abonnement TER Régional",
    description: "Trajets illimités sur le réseau régional de votre choix.",
  },
];

type EditingField = "name" | "email" | "home" | "passes" | null;

export default function ProfileClient() {
  const router = useRouter();
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    openAuthModal,
    signOut,
    resetPassword,
    refreshProfile,
  } = useAuth();

  // Avatar Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarImgFailed, setAvatarImgFailed] = useState(false);

  // Saved / Persisted States
  const [savedName, setSavedName] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedHomeLocation, setSavedHomeLocation] = useState("");
  const [selectedPasses, setSelectedPasses] = useState<string[]>([]);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  // Active Inline Editing Field
  const [editingField, setEditingField] = useState<EditingField>(null);

  // Temporary Form States during edit
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempHomeLocation, setTempHomeLocation] = useState("");
  const [tempPasses, setTempPasses] = useState<string[]>([]);

  // Status & Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessField, setSaveSuccessField] = useState<string | null>(null);
  const [emailChangePending, setEmailChangePending] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      const currentName = profile?.fullName || meta.full_name || "";
      const currentEmail = user.email || "";
      const currentHome = profile?.homeLocation || meta.home_location || meta.homeLocation || "";

      setSavedName(currentName);
      setSavedEmail(currentEmail);
      setSavedHomeLocation(currentHome);

      const passes =
        profile?.transportPasses ||
        meta.transport_passes ||
        meta.transportPasses ||
        (meta.has_navigo ? ["navigo"] : []);
      if (Array.isArray(passes)) {
        setSelectedPasses(passes);
      }

      setNewsletterConsent(
        profile?.newsletterConsent ??
          meta.newsletter_consent ??
          meta.newsletterConsent ??
          false
      );
    }
  }, [user, profile]);

  const isEmailAccount =
    user?.app_metadata?.provider === "email" || !user?.app_metadata?.provider;

  // Open edit mode with fresh temporary copy
  const startEditing = (field: EditingField) => {
    setErrorMessage(null);
    setSaveSuccessField(null);
    if (field === "name") setTempName(savedName);
    if (field === "email") setTempEmail(savedEmail);
    if (field === "home") setTempHomeLocation(savedHomeLocation);
    if (field === "passes") setTempPasses([...selectedPasses]);
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setErrorMessage(null);
  };

  // 1. Save Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = tempName.trim();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: trimmed,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) throw error;

      await refreshProfile();
      setSavedName(trimmed);
      setEditingField(null);
      setSaveSuccessField("name");
      setTimeout(() => setSaveSuccessField(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement du nom.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Save Email
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const clean = tempEmail.trim().toLowerCase();
    if (!clean || clean === savedEmail.toLowerCase()) {
      setEditingField(null);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser(
        { email: clean },
        { emailRedirectTo: "https://neve-rando.fr/auth/confirmed" }
      );
      if (error) throw error;

      setEmailChangePending(clean);
      setEditingField(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la modification de l'e-mail.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Save Home Location
  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = tempHomeLocation.trim();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          home_location: trimmed,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      const { error } = await supabase.auth.updateUser({
        data: { home_location: trimmed },
      });
      if (error) throw error;

      await refreshProfile();
      setSavedHomeLocation(trimmed);
      setEditingField(null);
      setSaveSuccessField("home");
      setTimeout(() => setSaveSuccessField(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement du domicile.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Save Passes
  const handleSavePasses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          transport_passes: tempPasses,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      const { error } = await supabase.auth.updateUser({
        data: {
          transport_passes: tempPasses,
          has_navigo: tempPasses.includes("navigo"),
        },
      });
      if (error) throw error;

      await refreshProfile();
      setSelectedPasses(tempPasses);
      setEditingField(null);
      setSaveSuccessField("passes");
      setTimeout(() => setSaveSuccessField(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement des forfaits.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Toggle Newsletter Consent immediately
  const handleToggleNewsletter = async (accepted: boolean) => {
    setNewsletterConsent(accepted);
    if (!user) return;
    try {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          newsletter_consent: accepted,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      await supabase.auth.updateUser({
        data: { newsletter_consent: accepted },
      });
      await refreshProfile();
    } catch {}
  };

  // 6. Avatar Upload & Remove Handlers
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    e.target.value = ""; // Permet de resélectionner la même image si besoin

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Veuillez sélectionner un fichier image valide (PNG, JPEG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage(null);

    try {
      const path = `${user.id}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const avatarUrlWithTimestamp = `${publicData.publicUrl}?v=${Date.now()}`;

      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          avatar_url: avatarUrlWithTimestamp,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrlWithTimestamp },
      });

      setAvatarImgFailed(false);
      await refreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible d'envoyer la photo de profil.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setIsUploadingAvatar(true);
    setErrorMessage(null);

    try {
      const path = `${user.id}/avatar`;
      try {
        await supabase.storage.from("avatars").remove([path]);
      } catch {}

      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      setAvatarImgFailed(false);
      await refreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de retirer la photo de profil.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 7. Request Password Reset Link
  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    setResetSuccessMessage(null);
    try {
      const { error } = await resetPassword(user.email);
      if (error) throw new Error(error);
      setResetSuccessMessage(`Un e-mail de changement de mot de passe part vers ${user.email}.`);
      setTimeout(() => setResetSuccessMessage(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible d'envoyer l'e-mail de réinitialisation.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const initial = (savedName || user?.email || "?").trim().charAt(0).toUpperCase();
  const showAvatar = !!profile?.avatarUrl && !avatarImgFailed;

  const passesSummary = selectedPasses.length
    ? selectedPasses
        .map((id) => TRANSPORT_PASS_OPTIONS.find((p) => p.id === id)?.label)
        .filter(Boolean)
        .join(", ")
    : "Aucun abonnement déclaré";

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-36 pb-28 text-[#1C1914]">
      <div className="mx-auto max-w-[760px] px-6 sm:px-8 space-y-12">
        
        {/* Loading Skeleton */}
        {isAuthLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 rounded-xl bg-[#EAE6DC]/60" />
            <div className="h-20 bg-[#EAE6DC]/30 rounded-2xl" />
            <div className="h-20 bg-[#EAE6DC]/30 rounded-2xl" />
            <div className="h-20 bg-[#EAE6DC]/30 rounded-2xl" />
          </div>
        ) : !user ? (
          /* Unauthenticated Prompt */
          <div className="max-w-md mx-auto my-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FFF0E8] flex items-center justify-center text-[#EB490B]">
              <UserIcon className="w-8 h-8 text-[#EB490B]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-bricolage font-extrabold text-2xl sm:text-3xl text-[#1C1914]">
                Connectez-vous à votre compte
              </h2>
              <p className="font-satoshi text-sm sm:text-base text-[#575246] leading-relaxed">
                Accédez à vos informations de profil, vos abonnements de transport et vos randonnées favorites.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => openAuthModal({ initialStep: "entry" })}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Se connecter / S&apos;inscrire
              </Button>
              <Link
                href="/explorer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-[#1C1914] hover:text-[#EB490B] transition"
              >
                Explorer le catalogue
              </Link>
            </div>
          </div>
        ) : (
          /* Main Authenticated Layout */
          <div className="space-y-12">
            
            {/* Header: Identity Row with Clickable Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-[#D6D0C2]/70">
              <div className="flex items-center gap-4 sm:gap-5">
                
                {/* Avatar with click-to-upload */}
                <div className="relative group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    aria-label="Changer la photo de profil"
                    className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-[#EB490B] text-white flex items-center justify-center font-bricolage font-bold text-2xl sm:text-3xl shadow-sm overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EB490B]/40 transition hover:opacity-95"
                  >
                    {showAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile!.avatarUrl!}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarImgFailed(true)}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{initial}</span>
                    )}

                    {/* Hover Camera Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>

                    {/* Upload Spinner */}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </button>

                  {/* Badge Pencil icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1C1914] text-white border-2 border-white flex items-center justify-center shadow-xs hover:scale-105 transition cursor-pointer"
                    title="Changer la photo"
                  >
                    <Pencil className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="font-bricolage font-bold text-3xl sm:text-4xl text-[#1C1914]">
                      {savedName || "Mon Compte"}
                    </h1>
                  </div>
                  <p className="font-satoshi text-sm sm:text-base text-[#575246] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#A8A190]" />
                    <span>{user.email}</span>
                  </p>
                  
                  {showAvatar && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="text-xs font-semibold text-[#7A7363] hover:text-red-600 hover:underline cursor-pointer"
                      >
                        Retirer la photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email Pending Notification */}
            {emailChangePending && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 animate-in fade-in duration-200">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Confirmez votre nouvelle adresse e-mail 📩</p>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    Un lien de confirmation vient d&apos;être envoyé à <strong>{emailChangePending}</strong>. Votre adresse actuelle (<strong>{user.email}</strong>) reste active jusqu&apos;à ce que vous ouvriez ce lien.
                  </p>
                </div>
              </div>
            )}

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            {/* 1. INFORMATIONS PERSONNELLES (Style Airbnb : affichage épuré + modification en ligne) */}
            <div className="space-y-6">
              <h2 className="font-bricolage font-bold text-2xl text-[#1C1914]">
                Informations personnelles
              </h2>

              <div className="divide-y divide-[#D6D0C2]/60">
                
                {/* --- Row 1: Nom complet --- */}
                <div className="py-5">
                  {editingField === "name" ? (
                    <form onSubmit={handleSaveName} className="space-y-4">
                      <div>
                        <label htmlFor="edit_name" className="block text-sm font-bold text-[#1C1914] mb-1">
                          Nom complet
                        </label>
                        <p className="text-xs text-[#575246] mb-2.5">
                          Indiquez votre nom tel qu&apos;il apparaîtra sur votre compte Névé.
                        </p>
                        <input
                          id="edit_name"
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Ex: Nathan Laure"
                          autoFocus
                          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[#D6D0C2] bg-white text-base text-[#1C1914] focus:border-[#1C1914] focus:outline-none transition"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-[#1C1914] hover:bg-black text-white font-satoshi font-bold text-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2.5 text-sm font-bold text-[#1C1914] hover:underline cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-satoshi font-bold text-base text-[#1C1914]">
                          Nom complet
                        </p>
                        <p className={`font-satoshi text-sm ${savedName ? "text-[#575246]" : "text-[#A8A190]"}`}>
                          {savedName || "Information non fournie"}
                        </p>
                        {saveSuccessField === "name" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 pt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Modifié
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditing("name")}
                        className="underline font-bold text-sm text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer shrink-0"
                      >
                        {savedName ? "Modifier" : "Ajouter"}
                      </button>
                    </div>
                  )}
                </div>

                {/* --- Row 2: Adresse e-mail --- */}
                <div className="py-5">
                  {editingField === "email" ? (
                    <form onSubmit={handleSaveEmail} className="space-y-4">
                      <div>
                        <label htmlFor="edit_email" className="block text-sm font-bold text-[#1C1914] mb-1">
                          Adresse e-mail
                        </label>
                        <p className="text-xs text-[#575246] mb-2.5">
                          Un e-mail de confirmation sera envoyé à votre nouvelle adresse pour valider le changement.
                        </p>
                        <input
                          id="edit_email"
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          placeholder="votre@email.fr"
                          autoFocus
                          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[#D6D0C2] bg-white text-base text-[#1C1914] focus:border-[#1C1914] focus:outline-none transition"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-[#1C1914] hover:bg-black text-white font-satoshi font-bold text-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2.5 text-sm font-bold text-[#1C1914] hover:underline cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-satoshi font-bold text-base text-[#1C1914]">
                          Adresse e-mail
                        </p>
                        <p className="font-satoshi text-sm text-[#575246]">
                          {savedEmail}
                        </p>
                      </div>
                      {isEmailAccount ? (
                        <button
                          type="button"
                          onClick={() => startEditing("email")}
                          className="underline font-bold text-sm text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer shrink-0"
                        >
                          Modifier
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-[#7A7363] shrink-0">
                          Connecté avec {user?.app_metadata?.provider === "google" ? "Google" : user?.app_metadata?.provider === "apple" ? "Apple" : "votre compte tiers"}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* --- Row 3: Gare / Ville de départ habituelle --- */}
                <div className="py-5">
                  {editingField === "home" ? (
                    <form onSubmit={handleSaveHome} className="space-y-4">
                      <div>
                        <label htmlFor="edit_home" className="block text-sm font-bold text-[#1C1914] mb-1">
                          Gare ou ville de départ habituelle
                        </label>
                        <p className="text-xs text-[#575246] mb-2.5">
                          Calculera automatiquement vos temps d&apos;accès en train depuis votre domicile.
                        </p>
                        <input
                          id="edit_home"
                          type="text"
                          value={tempHomeLocation}
                          onChange={(e) => setTempHomeLocation(e.target.value)}
                          placeholder="Ex: Paris Gare de Lyon, Annecy, Strasbourg..."
                          autoFocus
                          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[#D6D0C2] bg-white text-base text-[#1C1914] focus:border-[#1C1914] focus:outline-none transition"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-[#1C1914] hover:bg-black text-white font-satoshi font-bold text-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2.5 text-sm font-bold text-[#1C1914] hover:underline cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-satoshi font-bold text-base text-[#1C1914]">
                          Gare ou ville de départ
                        </p>
                        <p className={`font-satoshi text-sm ${savedHomeLocation ? "text-[#575246]" : "text-[#A8A190]"}`}>
                          {savedHomeLocation || "Information non fournie"}
                        </p>
                        {saveSuccessField === "home" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 pt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Modifié
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditing("home")}
                        className="underline font-bold text-sm text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer shrink-0"
                      >
                        {savedHomeLocation ? "Modifier" : "Ajouter"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 2. ABONNEMENTS ET CARTES DE TRANSPORT */}
            <div className="space-y-6">
              <h2 className="font-bricolage font-bold text-2xl text-[#1C1914]">
                Abonnements & cartes de transport
              </h2>

              <div className="divide-y divide-[#D6D0C2]/60">
                <div className="py-5">
                  {editingField === "passes" ? (
                    <form onSubmit={handleSavePasses} className="space-y-5">
                      <div>
                        <p className="text-xs text-[#575246] mb-3">
                          Sélectionnez vos cartes et abonnements pour activer les badges et tarifs correspondants sur les fiches de randonnées.
                        </p>

                        <div className="space-y-2.5 max-w-xl">
                          {TRANSPORT_PASS_OPTIONS.map((pass) => {
                            const isChecked = tempPasses.includes(pass.id);
                            return (
                              <button
                                type="button"
                                key={pass.id}
                                onClick={() => {
                                  setTempPasses((prev) =>
                                    prev.includes(pass.id)
                                      ? prev.filter((p) => p !== pass.id)
                                      : [...prev, pass.id]
                                  );
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-4 cursor-pointer ${
                                  isChecked
                                    ? "bg-[#FFF0E8]/70 border-[#EB490B] text-[#1C1914]"
                                    : "bg-white border-[#D6D0C2] hover:bg-gray-50 text-[#1C1914]"
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <p className="font-satoshi font-bold text-sm">
                                    {pass.label}
                                  </p>
                                  <p className="font-satoshi text-xs text-[#575246]">
                                    {pass.description}
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition ${
                                    isChecked
                                      ? "bg-[#EB490B] border-[#EB490B] text-white"
                                      : "border-[#D6D0C2] bg-white"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-[#1C1914] hover:bg-black text-white font-satoshi font-bold text-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2.5 text-sm font-bold text-[#1C1914] hover:underline cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-satoshi font-bold text-base text-[#1C1914]">
                          Titres de transport déclarés
                        </p>
                        <p className={`font-satoshi text-sm ${selectedPasses.length ? "text-[#575246]" : "text-[#A8A190]"}`}>
                          {passesSummary}
                        </p>
                        {saveSuccessField === "passes" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 pt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Modifié
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditing("passes")}
                        className="underline font-bold text-sm text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer shrink-0"
                      >
                        {selectedPasses.length ? "Modifier" : "Ajouter"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. COMMUNICATIONS */}
            <div className="space-y-6">
              <h2 className="font-bricolage font-bold text-2xl text-[#1C1914]">
                Communications
              </h2>

              <div className="divide-y divide-[#D6D0C2]/60">
                <div className="py-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-satoshi font-bold text-base text-[#1C1914]">
                      Newsletter Névé
                    </p>
                    <p className="font-satoshi text-sm text-[#575246] max-w-md">
                      Quelques nouvelles par an : nouveaux sentiers sans voiture, actualités du projet. Aucun démarchage commercial.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={newsletterConsent}
                      onChange={(e) => handleToggleNewsletter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#D6D0C2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EB490B]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. SÉCURITÉ */}
            <div className="space-y-6">
              <h2 className="font-bricolage font-bold text-2xl text-[#1C1914]">
                Sécurité
              </h2>

              <div className="divide-y divide-[#D6D0C2]/60">
                <div className="py-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-satoshi font-bold text-base text-[#1C1914]">
                      Mot de passe
                    </p>
                    <p className="font-satoshi text-sm text-[#575246]">
                      {isEmailAccount
                        ? "••••••••••••"
                        : user?.app_metadata?.provider === "google"
                        ? "Compte connecté avec Google"
                        : user?.app_metadata?.provider === "apple"
                        ? "Compte connecté avec Apple"
                        : "Compte connecté avec un service tiers"}
                    </p>
                    {resetSuccessMessage && (
                      <p className="text-xs font-bold text-emerald-700 pt-1">
                        {resetSuccessMessage}
                      </p>
                    )}
                  </div>

                  {isEmailAccount ? (
                    <button
                      type="button"
                      onClick={handleRequestPasswordReset}
                      disabled={isResettingPassword}
                      className="underline font-bold text-sm text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isResettingPassword ? "Envoi..." : "Modifier"}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[#7A7363] shrink-0">
                      Géré par {user?.app_metadata?.provider === "google" ? "Google" : user?.app_metadata?.provider === "apple" ? "Apple" : "fournisseur externe"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 5. SESSION ET SUPPRESSION */}
            <div className="pt-8 border-t border-[#D6D0C2]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1C1914] hover:text-[#EB490B] transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#575246]" />
                <span>Se déconnecter</span>
              </button>

              <Link
                href="/suppression-compte"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7A7363] hover:text-red-600 transition cursor-pointer"
              >
                <span>Supprimer mon compte Névé</span>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
