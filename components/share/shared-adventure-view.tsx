"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
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
import {
  AdventureStepConnector,
  AdventureTimelineCaption,
} from "@/components/share/AdventureStepConnector";
import {
  isOneWayAdventure,
  type UserAdventure,
  type AdventureTrainInfo,
} from "@/types/adventure";

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
  // Aller simple : `return_train` recopie l'aller, il n'y a pas de retour à poser
  // dans l'agenda.
  const returnTrain = isOneWayAdventure(adventure) ? null : adventure.return_train;

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
    }\\nLien : https://www.neve-rando.fr/share/${adventure.share_token}`;

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
    }\\nLien : https://www.neve-rando.fr/share/${adventure.share_token}`;

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
 * Sous-composant affichant un trajet (Aller ou Retour) ultra-épuré sans cadre (frameless)
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

  const departureTime = train?.departureTime || train?.time || "—";
  const arrivalTime = train?.arrivalTime || "—";
  const duration = train?.durationFormatted || train?.duration;

  const legs = Array.isArray(train?.legs) && train.legs.length > 0 ? train.legs : null;
  const transfersCount = legs && legs.length > 1 ? legs.length - 1 : 0;
  const transferLabel =
    transfersCount === 0
      ? "Direct"
      : `${transfersCount} correspondance${transfersCount > 1 ? "s" : ""}`;

  return (
    <div className="bg-white rounded-[8px] pt-3 overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#EAE6DC] flex flex-col w-full font-satoshi">
      {/* En-tête Phase & Date (CalendarDays icon + Date) */}
      <div className="flex items-center gap-2 px-4 pb-2.5">
        <CalendarDays className="w-4 h-4 text-[#575246]" />
        <span className="text-[13px] sm:text-[14px] font-bold text-[#575246] font-satoshi">
          {phaseLabel} : {dateFormatted}
        </span>
      </div>

      {/* Corps du trajet */}
      <div className="border-t border-[#EAE6DC] p-4 sm:p-5 flex flex-col gap-3.5 bg-white">
        {/* Point de départ : Heure + Gare */}
        <div className="flex items-center gap-3.5 py-0.5">
          <span className="font-satoshi font-bold text-[18px] sm:text-[20px] text-[#1C1914] min-w-[56px] text-left shrink-0 leading-none">
            {departureTime}
          </span>
          <span className="text-[13px] sm:text-[14px] font-medium text-[#575246] truncate font-satoshi">
            {originName}
          </span>
        </div>

        {/* Bandeau Milieu : Durée + Divider + Correspondances + Chevron */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full bg-[#F5F3EC] hover:bg-[#EFECE3] active:scale-[0.99] rounded-[8px] px-3 py-2.5 text-xs text-[#1C1914] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            {duration ? (
              <div className="flex items-center gap-1.5 text-[#1C1914] shrink-0 font-medium font-satoshi text-[13px] sm:text-[14px]">
                <Clock4 className="w-3.5 h-3.5 text-[#1C1914]" />
                <span>{duration}</span>
              </div>
            ) : null}

            <div className="w-px h-3.5 bg-[#D6D0C2] shrink-0" />

            <span className="text-[13px] sm:text-[14px] font-medium text-[#1C1914] truncate font-satoshi">
              {transferLabel}
            </span>
          </div>

          <ChevronRight
            className={`w-4 h-4 text-[#575246] shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-90 text-[#1C1914]" : ""
            }`}
          />
        </button>

        {/* Point d'arrivée : Heure + Gare */}
        <div className="flex items-center gap-3.5 py-0.5">
          <span className="font-satoshi font-bold text-[18px] sm:text-[20px] text-[#1C1914] min-w-[56px] text-left shrink-0 leading-none">
            {arrivalTime}
          </span>
          <span className="text-[13px] sm:text-[14px] font-medium text-[#575246] truncate font-satoshi">
            {destinationName}
          </span>
        </div>

        {/* Détail pas-à-pas dépliable (JourneyTimeline) */}
        {isExpanded && train && (
          <div className="pt-4 border-t border-[#EAE6DC] mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
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
  const isOneWay = isOneWayAdventure(adventure);
  const returnTrain = isOneWay ? null : adventure.return_train;

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://www.neve-rando.fr/share/${adventure.share_token}`;
    const title = `${hike.title || "Randonnée"} — Feuille de route Névé`;
    const text = `Consulte les horaires de train et l'itinéraire pour notre rando prévue le ${adventure.outward_date} !`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCalendar = () => {
    if (!adventure) return;
    downloadAdventureCalendar(adventure);
    setCalendarDownloaded(true);
    setTimeout(() => setCalendarDownloaded(false), 3000);
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
  const outwardDestination =
    outward?.arrivalStation || hike.startStation || "Gare d'arrivée";

  const returnOrigin =
    returnTrain?.departureStation ||
    hike.endStation ||
    hike.startStation ||
    "Gare de retour";
  const returnDestination =
    adventure.return_station_name || adventure.departure_station_name;

  return (
    <div className="min-h-screen bg-white text-[#1C1914] px-4 sm:px-6 pt-28 sm:pt-36 pb-24 animate-in fade-in duration-300 font-satoshi">
      <div className="max-w-xl mx-auto flex flex-col gap-8 sm:gap-10">
        
        {/* 1. Titre de l'aventure & Actions d'en-tête discrètes */}
        <div className="flex items-start justify-between gap-6 animate-in slide-in-from-bottom-2 duration-300 pb-1">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="font-bricolage font-extrabold text-2xl sm:text-3xl text-[#1C1914] leading-tight tracking-tight">
              Votre aventure à {placeName}
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#575246] font-satoshi">
              {formatAdventureRange(
                adventure.outward_date,
                isOneWay ? null : adventure.return_date
              )}
            </p>
          </div>

          {/* Boutons d'actions circulaires minimalistes */}
          <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleAddToCalendar}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-[#FAF8F5] active:scale-95 text-[#1C1914] hover:text-[#EB490B] border border-[#D6D0C2]/80 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              title="Ajouter au calendrier"
              aria-label="Ajouter au calendrier"
            >
              {calendarDownloaded ? (
                <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-[#FAF8F5] active:scale-95 text-[#1C1914] hover:text-[#EB490B] border border-[#D6D0C2]/80 flex items-center justify-center shadow-xs transition-all cursor-pointer group"
              title="Copier le lien de partage"
              aria-label="Partager"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
              ) : (
                <Share2 className="w-4 h-4 text-[#1C1914] group-hover:text-[#EB490B] transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>
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

          {/* Étape 2 : Card Rando au centre de la timeline */}
          <AdventureHikeCard
            hike={hike}
            hikeId={(adventure as any).hike_id || (hike as any).id || (hike as any).hike_id}
            shareToken={adventure.share_token}
          />

          {/* Étape 3 : Trajet Retour (si présent) */}
          {returnTrain ? (
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

        {/* 4. Carte d'accès & Téléchargement Névé */}
        <section className="bg-white rounded-[8px] p-8 sm:p-10 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#EAE6DC] flex flex-col items-center text-center gap-5 sm:gap-6 mt-6 sm:mt-8 font-satoshi">
          {/* Logo officiel Névé sans boîte */}
          <Logo />

          <div className="max-w-md">
            <h3 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914]">
              Emportez cette aventure sur les sentiers
            </h3>
            <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246] mt-2 leading-relaxed">
              Guidage GPS hors-ligne, alertes train en direct et profil d'altitude avec l'application Névé.
            </p>
          </div>

          {/* Le bouton ne sert qu'au téléphone : `neve://` ne mène nulle part
              depuis un ordinateur, où l'application n'existe pas. */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2 sm:hidden">
            <a
              href={`neve://share/${adventure.share_token}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EB490B] hover:bg-[#C3350B] active:scale-95 text-white font-bold py-3.5 px-7 rounded-[8px] transition-all shadow-xs cursor-pointer text-sm font-satoshi"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ouvrir dans l&apos;application</span>
            </a>
          </div>

          {/* Sur ordinateur, le relais passe par le téléphone : même mécanisme
              que la fiche randonnée. Le QR encode l'adresse `https` et non
              `neve://` — scannée sans l'application installée, celle-ci ne
              mènerait nulle part, là où l'adresse web retombe au moins sur cette
              page. */}
          <div className="hidden sm:flex flex-col items-center gap-3 pt-2">
            <p className="font-satoshi font-medium text-sm text-[#575246]">
              Scannez ce QR code pour ouvrir l&apos;aventure sur votre téléphone
            </p>
            <div className="inline-block p-4 rounded-2xl bg-white shadow-sm border border-[#EAE6DC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `https://www.neve-rando.fr/share/${adventure.share_token}`
                )}&color=1c1914&bgcolor=ffffff&margin=1`}
                alt="QR code pour ouvrir cette aventure sur smartphone"
                className="w-40 h-40"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-1 opacity-85 hover:opacity-100 transition-opacity">
            <Link href="/#download-ios" className="transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/images/app-apple-fr-FR.d5bac4a9.svg"
                alt="Télécharger sur l'App Store"
                width={115}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <Link href="/#download-android" className="transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/images/app-google-fr-FR.922a8286.svg"
                alt="Disponible sur Google Play"
                width={115}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
        </section>

        {/* 5. Footer minimaliste */}
        <footer className="text-center pt-2 pb-6 text-xs sm:text-sm text-[#7A7363] flex flex-col items-center gap-1 font-satoshi">
          <p>
            Feuille de route générée avec{" "}
            <Link href="/" className="font-bold text-[#EB490B] hover:underline">
              Névé
            </Link>{" "}
            — L'application pour s'évader en rando sans voiture.
          </p>
        </footer>

      </div>
    </div>
  );
}
