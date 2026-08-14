"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock4,
  MapPin,
  Navigation,
  Share2,
  Train,
  Check,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { TransportLineBadge } from "@/components/share/TransportLineBadge";
import JourneyTimeline from "@/components/share/JourneyTimeline";
import AdventureHikeCard from "@/components/share/AdventureHikeCard";
import AuthRequiredModal from "@/components/share/AuthRequiredModal";
import {
  AdventureStepConnector,
  AdventureTimelineCaption,
} from "@/components/share/AdventureStepConnector";
import type { UserAdventure, AdventureTrainInfo } from "@/types/adventure";

interface SharedAdventureViewProps {
  adventure: UserAdventure;
}

// Format date into full French: "Samedi 20 août 2026"
function formatFullDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      const formatted = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    const d = new Date(dateStr);
    const formatted = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

// Format date into short format: "20 août"
function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Format range of dates: "Du 20 au 22 août 2026" ou "Samedi 20 août 2026"
function formatAdventureRange(outwardDate: string, returnDate?: string | null): string {
  if (!returnDate || returnDate === outwardDate) {
    return formatFullDate(outwardDate);
  }
  return `Du ${formatShortDate(outwardDate)} au ${formatFullDate(returnDate)}`;
}

// Generate an ICS calendar file and trigger download
function downloadAdventureCalendar(adventure: UserAdventure) {
  const hikeTitle = adventure.hike_snapshot?.title || "Randonnée sans voiture";
  const outward = adventure.outward_train;
  const returnTrain = adventure.return_train;

  const formatDateForICS = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;
    const cleanDate = dateStr.replace(/-/g, "");
    let cleanTime = "080000";
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2})[h:](\d{2})/);
      if (match) {
        cleanTime = `${match[1].padStart(2, "0")}${match[2]}00`;
      }
    }
    return `${cleanDate}T${cleanTime}`;
  };

  const nowICS = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const events: string[] = [];

  // Outward event
  const outwardStart = formatDateForICS(
    adventure.outward_date,
    outward?.departureTime || outward?.time
  );
  if (outwardStart) {
    const outwardEnd =
      formatDateForICS(
        adventure.outward_date,
        outward?.arrivalTime
      ) || outwardStart;

    const summary = `Train Aller : ${adventure.departure_station_name} -> ${
      outward?.arrivalStation ||
      adventure.hike_snapshot?.startStation ||
      "Gare d'arrivée"
    }`;
    const description = `Feuille de route Névé pour la rando : ${hikeTitle}\\nTrain : ${
      outward?.line || outward?.trainNumber || "TER/Transilien"
    }\\nLien : https://neve-rando.fr/share/${adventure.share_token}`;

    events.push(`BEGIN:VEVENT
UID:neve-outward-${adventure.share_token}-${Date.now()}@neve-rando.fr
DTSTAMP:${nowICS}
DTSTART:${outwardStart}
DTEND:${outwardEnd}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${adventure.departure_station_name}
STATUS:CONFIRMED
END:VEVENT`);
  }

  // Return event
  const returnDate = adventure.return_date || adventure.outward_date;
  const returnStart = formatDateForICS(
    returnDate,
    returnTrain?.departureTime || returnTrain?.time
  );
  if (returnStart && returnTrain) {
    const returnEnd =
      formatDateForICS(returnDate, returnTrain?.arrivalTime) || returnStart;
    const summary = `Train Retour : ${
      returnTrain?.departureStation ||
      adventure.hike_snapshot?.endStation ||
      adventure.hike_snapshot?.startStation ||
      "Gare de départ"
    } -> ${adventure.return_station_name || adventure.departure_station_name}`;
    const description = `Retour de la rando Névé : ${hikeTitle}\\nTrain : ${
      returnTrain?.line || returnTrain?.trainNumber || "TER/Transilien"
    }\\nLien : https://neve-rando.fr/share/${adventure.share_token}`;

    events.push(`BEGIN:VEVENT
UID:neve-return-${adventure.share_token}-${Date.now()}@neve-rando.fr
DTSTAMP:${nowICS}
DTSTART:${returnStart}
DTEND:${returnEnd}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${returnTrain?.departureStation || "Gare"}
STATUS:CONFIRMED
END:VEVENT`);
  }

  if (events.length === 0) return;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Névé//Feuille de Route//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Névé — ${hikeTitle}
${events.join("\n")}
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `neve-rando-${adventure.share_token}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Sous-composant affichant un trajet (Aller ou Retour) avec transitions douces
 */
function JourneyCardBlock({
  phase,
  dateFormatted,
  originName,
  destinationName,
  train,
}: {
  phase: "outward" | "return";
  dateFormatted: string;
  originName: string;
  destinationName: string;
  train?: AdventureTrainInfo | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isOutward = phase === "outward";
  const phaseLabel = isOutward ? "Aller" : "Retour";
  const phaseBadgeClass = isOutward
    ? "text-[#EB490B] bg-[#FFF0E8] border border-[#EB490B]/20"
    : "text-[#292929] bg-gray-100 border border-gray-200";

  const departureTime = train?.departureTime || train?.time || "—";
  const arrivalTime = train?.arrivalTime || "—";
  const duration = train?.durationFormatted || train?.duration;

  const legs = Array.isArray(train?.legs) && train.legs.length > 0 ? train.legs : null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col gap-3">
      {/* En-tête Phase & Date */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${phaseBadgeClass} transition-colors`}>
          {phaseLabel}
        </span>
        <span className="text-xs font-medium text-[#7C7C7C]">
          {dateFormatted}
        </span>
      </div>

      {/* Carte Trajet structurée (alignement vertical type app mobile) */}
      <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-gray-200/60 flex flex-col gap-2.5 shadow-2xs">
        
        {/* Point de départ : Heure alignée à gauche + Lieu */}
        <div className="flex items-center gap-3">
          <span className="font-bricolage font-bold text-lg sm:text-xl text-[#111111] min-w-[56px] text-left shrink-0 leading-none">
            {departureTime}
          </span>
          <span className="text-sm font-semibold text-[#111111] truncate">
            {originName}
          </span>
        </div>

        {/* Bandeau Accordéon Milieu : Durée + Lignes + Bouton Voir le trajet */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full bg-white hover:bg-gray-50/90 active:scale-[0.99] border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {duration ? (
              <div className="flex items-center gap-1 text-[#525252] shrink-0 font-medium">
                <Clock4 className="w-3.5 h-3.5 text-[#EB490B]" />
                <span>{duration}</span>
              </div>
            ) : null}

            {duration ? <div className="w-px h-3.5 bg-gray-200 shrink-0" /> : null}

            {/* Aperçu rapide des badges de ligne */}
            {legs ? (
              <div className="flex items-center gap-1 shrink-0 overflow-hidden">
                {legs.slice(0, 3).map((leg, idx) => (
                  <div key={idx} className="transition-transform duration-200 hover:scale-105">
                    <TransportLineBadge
                      mode={leg.mode}
                      lineName={leg.lineName}
                      lineColor={leg.lineColor}
                      size={16}
                      hideModeIcon={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              (train?.line || train?.trainNumber) && (
                <TransportLineBadge
                  mode={train?.mode}
                  lineName={train?.line || train?.trainNumber}
                  lineColor={train?.lineColor}
                  size={16}
                  hideModeIcon={false}
                />
              )
            )}

            <span className="text-xs text-[#EB490B] font-semibold truncate ml-1 group-hover:underline">
              {isExpanded ? "Masquer le détail" : "Détail du trajet"}
            </span>
          </div>

          <ChevronRight
            className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-90 text-[#EB490B]" : "group-hover:translate-x-0.5"
            }`}
          />
        </button>

        {/* Point d'arrivée : Heure alignée à gauche + Lieu */}
        <div className="flex items-center gap-3">
          <span className="font-bricolage font-bold text-lg sm:text-xl text-[#111111] min-w-[56px] text-left shrink-0 leading-none">
            {arrivalTime}
          </span>
          <span className="text-sm font-semibold text-[#111111] truncate">
            {destinationName}
          </span>
        </div>

        {/* Détail pas-à-pas dépliable (JourneyTimeline) avec transition fluide */}
        {isExpanded && train && (
          <div className="pt-3 border-t border-gray-200/80 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <JourneyTimeline
              train={train}
              originName={originName}
              destinationName={destinationName}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default function SharedAdventureView({
  adventure,
}: SharedAdventureViewProps) {
  const [copied, setCopied] = useState(false);
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const hike = adventure.hike_snapshot || {};
  const outward = adventure.outward_train;
  const returnTrain = adventure.return_train;

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://neve-rando.fr/share/${adventure.share_token}`;
    const title = `${hike.title || "Randonnée"} — Feuille de route Névé`;
    const text = `Consulte les horaires de train et l'itinéraire pour notre rando prévue le ${adventure.outward_date} !`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleAddToCalendar = () => {
    downloadAdventureCalendar(adventure);
    setCalendarDownloaded(true);
    setTimeout(() => setCalendarDownloaded(false), 3500);
  };

  const formattedOutwardDate = formatFullDate(adventure.outward_date);
  const formattedReturnDate = formatFullDate(
    adventure.return_date || adventure.outward_date
  );

  const placeName =
    hike.location?.split(",")[0]?.trim() ||
    hike.location_name ||
    hike.startStation ||
    hike.title ||
    "Randonnée";

  const outwardOrigin = adventure.departure_station_name;
  const outwardDestination = outward?.arrivalStation || hike.startStation || "Gare d'arrivée";

  const returnOrigin =
    returnTrain?.departureStation ||
    hike.endStation ||
    hike.startStation ||
    "Gare de départ";
  const returnDestination =
    adventure.return_station_name || adventure.departure_station_name;

  return (
    <div className="min-h-screen bg-[#FFF7F2] text-[#292929] px-4 py-6 sm:py-10 animate-in fade-in duration-300">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        
        {/* 1. Header avec Logo Névé & Action Partage */}
        <header className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#F0EAE1] shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center gap-3">
            <Logo
              iconClassName="h-7 w-7"
              typoClassName="h-5.5"
              className="hover:opacity-85 transition-opacity"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden xs:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-[#FFEDD4] text-[#7B3306] rounded-full border border-amber-200/60 transition-transform hover:scale-105">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB490B] animate-pulse" />
              Feuille de route
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-[#F5F3EC] hover:bg-[#EAE6DC] active:scale-95 text-[#292929] rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="Partager le lien"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in duration-200" />
                  <span className="text-emerald-700 font-bold">Copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#525252] transition-transform group-hover:scale-110" />
                  <span>Partager</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 2. Titre de l'aventure & Calendrier */}
        <div className="flex items-start justify-between gap-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col gap-1">
            <h1 className="font-bricolage font-extrabold text-2xl sm:text-3xl text-[#111111] leading-tight tracking-tight">
              Votre aventure à {placeName}
            </h1>
            <p className="text-sm font-medium text-[#7C7C7C] font-satoshi">
              {formatAdventureRange(adventure.outward_date, adventure.return_date)}
            </p>
          </div>

          <button
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E8] active:scale-95 text-[#EB490B] border border-gray-200/80 shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer mt-1"
            title="Ajouter les horaires à mon calendrier"
          >
            {calendarDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in duration-200" />
                <span className="text-emerald-700 font-bold">Ajouté !</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>Ajouter à l'agenda</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Frise Chronologique de l'Aventure (Aller -> Rando au centre -> Retour) */}
        <section className="flex flex-col gap-0 animate-in slide-in-from-bottom-3 duration-400">
          
          {/* Légende début */}
          <AdventureTimelineCaption label="C'est le début de l'aventure !" arrow="below" />

          {/* Étape 1 : Trajet Aller */}
          <div className="mt-2">
            <JourneyCardBlock
              phase="outward"
              dateFormatted={formattedOutwardDate}
              originName={outwardOrigin}
              destinationName={outwardDestination}
              train={outward}
            />
          </div>

          {/* Connecteur Aller -> Rando */}
          <AdventureStepConnector label={formatShortDate(adventure.outward_date)} />

          {/* Étape 2 : Card Rando au centre de la timeline (ouvre la modale d'auth au clic) */}
          <AdventureHikeCard
            hike={hike}
            shareToken={adventure.share_token}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Étape 3 : Trajet Retour (si présent) */}
          {returnTrain || adventure.return_date ? (
            <>
              <AdventureStepConnector
                label={formatShortDate(adventure.return_date || adventure.outward_date)}
              />

              <JourneyCardBlock
                phase="return"
                dateFormatted={formattedReturnDate}
                originName={returnOrigin}
                destinationName={returnDestination}
                train={returnTrain}
              />
            </>
          ) : null}

          {/* Légende fin */}
          <div className="mt-2">
            <AdventureTimelineCaption
              label="Fin de l'aventure... avant la prochaine."
              arrow="above"
            />
          </div>

        </section>

        {/* Modale d'authentification demandée au clic sur la rando */}
        <AuthRequiredModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          hike={hike}
          shareToken={adventure.share_token}
        />

        {/* 4. Bandeau de Conversion / Call-to-Action (CTA) */}
        <section className="bg-[#111111] text-white rounded-3xl p-6 sm:p-7 text-center flex flex-col items-center gap-5 shadow-lg relative overflow-hidden mt-2 transition-all hover:shadow-xl">
          
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#EB490B]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FA6415]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Compass / App badge */}
          <div className="w-12 h-12 rounded-2xl bg-[#EB490B] flex items-center justify-center shadow-md transition-transform duration-300 hover:rotate-6 hover:scale-105">
            <Navigation className="w-6 h-6 text-white" />
          </div>

          <div className="max-w-md">
            <h3 className="font-bricolage font-bold text-xl sm:text-2xl text-white leading-tight">
              Prêt pour l'aventure ?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed font-satoshi">
              Téléchargez l'application <strong>Névé</strong> pour accéder au tracé GPX interactif, au guidage GPS hors-ligne et à la météo en direct.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Deep link into native app */}
            <a
              href={`neve://share/${adventure.share_token}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EB490B] hover:bg-[#C3350B] active:scale-95 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ouvrir dans l'app</span>
            </a>

            {/* Website landing page link */}
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:scale-95 text-white font-medium py-3 px-5 rounded-2xl transition-all text-sm group"
            >
              <span>Découvrir Névé</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* App Store / Play Store mini badges */}
          <div className="pt-2 flex items-center justify-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <Link href="/#download-ios" className="transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/images/app-apple-fr-FR.d5bac4a9.svg"
                alt="Télécharger sur l'App Store"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <Link href="/#download-android" className="transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/images/app-google-fr-FR.922a8286.svg"
                alt="Disponible sur Google Play"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

        </section>

        {/* 5. Footer minimaliste */}
        <footer className="text-center py-4 text-xs text-[#7C7C7C] flex flex-col items-center gap-1">
          <p>
            Feuille de route générée avec{" "}
            <Link href="/" className="font-semibold text-[#EB490B] hover:underline">
              Névé
            </Link>{" "}
            — L'application pour s'évader en rando sans voiture.
          </p>
        </footer>

      </div>
    </div>
  );
}
