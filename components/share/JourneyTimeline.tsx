"use client";

import React, { useState } from "react";
import {
  Footprints,
  ChevronDown,
  ChevronUp,
  Clock4,
} from "lucide-react";
import {
  BUS_MODE_SVG,
  RER_MODE_SVG,
  METRO_MODE_SVG,
  TRANSILIEN_MODE_SVG,
  TRAM_MODE_SVG,
} from "@/lib/idfmSvg";
import { TransportLineBadge, detectTransportMode } from "@/components/share/TransportLineBadge";
import type { TransitLeg, AdventureTrainInfo } from "@/types/adventure";

function InlineModeIcon({
  mode,
  size = 15,
}: {
  mode?: string;
  size?: number;
}) {
  const norm = (mode || "train").toLowerCase();
  let svg = TRANSILIEN_MODE_SVG;
  if (norm === "rer") svg = RER_MODE_SVG;
  else if (norm === "metro") svg = METRO_MODE_SVG;
  else if (norm === "tram") svg = TRAM_MODE_SVG;
  else if (norm === "bus") svg = BUS_MODE_SVG;

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function addMinutesToTime(timeStr?: string, minutesToAdd: number = 0): string {
  if (!timeStr) return "";
  const cleanTime = timeStr.replace("h", ":");
  if (!cleanTime.includes(":")) return timeStr;
  const [h, m] = cleanTime.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const total = h * 60 + m + Math.round(minutesToAdd);
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function computeLegTimes(
  departureTime: string,
  legs: TransitLeg[],
  offsetMinutes: number = 0
): { departure: string; arrival: string }[] {
  let cumulative = offsetMinutes;
  return legs.map((leg) => {
    const departure =
      leg.departureTime || addMinutesToTime(departureTime, cumulative);
    cumulative += leg.durationMinutes || 0;
    const arrival =
      leg.arrivalTime || addMinutesToTime(departureTime, cumulative);
    return { departure, arrival };
  });
}

export interface JourneyTimelineProps {
  train: AdventureTrainInfo;
  originName: string;
  destinationName: string;
}

export default function JourneyTimeline({
  train,
  originName,
  destinationName,
}: JourneyTimelineProps) {
  const [expandedStops, setExpandedStops] = useState<Record<number, boolean>>({});

  const toggleStops = (idx: number) => {
    setExpandedStops((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const rawLegs = Array.isArray(train.legs) && train.legs.length > 0 ? train.legs : null;

  // Si aucun tronçon explicite n'est dans la DB, construire un tronçon principal
  const legs: TransitLeg[] = rawLegs || [
    {
      mode: train.mode || "train",
      lineName: train.line || train.trainNumber || "TER/Transilien",
      lineColor: train.lineColor || "#004F9F",
      fromName: train.departureStation || originName,
      toName: train.arrivalStation || destinationName,
      durationMinutes: 0,
      departureTime: train.departureTime || train.time,
      arrivalTime: train.arrivalTime,
    },
  ];

  const accessWalk =
    legs[0]?.mode === "walk" && legs[0]?.walkType === "access"
      ? legs[0]
      : undefined;
  const timelineLegs = accessWalk ? legs.slice(1) : legs;

  const baseDepartureTime = train.departureTime || train.time || "08:00";
  const legTimes = computeLegTimes(
    baseDepartureTime,
    timelineLegs,
    accessWalk?.durationMinutes ?? 0
  );

  const departureTitle = originName || accessWalk?.fromName || "Départ";
  const arrivalPlace = timelineLegs[timelineLegs.length - 1]?.toName;
  const arrivalTitle = destinationName || arrivalPlace || "Arrivée";
  const finalArrivalTime = train.arrivalTime || legTimes[legTimes.length - 1]?.arrival || "";

  return (
    <div className="flex flex-col gap-0 pt-2 font-satoshi text-[#1C1914]">
      
      {/* 0. Étape de départ (si marche d'accès) */}
      {accessWalk && (
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center gap-2 bg-[#EB490B] text-white px-3 py-1 rounded-full shadow-xs shrink-0">
            <span className="font-bold text-xs font-bricolage">{train.departureTime || train.time}</span>
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[#575246] font-semibold leading-none">Départ :</span>
            <span className="font-bold text-sm text-[#1C1914] truncate font-satoshi">{departureTitle}</span>
          </div>
        </div>
      )}

      {/* 1. Boucle des étapes de transport */}
      {timelineLegs.map((leg, idx) => {
        const times = legTimes[idx];
        const isWalk = leg.mode === "walk";
        const { mode: detectedMode } = detectTransportMode(leg.lineName, leg.mode);
        const lineColor = leg.lineColor || "#004F9F";
        const hasIntermediate =
          (Array.isArray(leg.intermediateStops) && leg.intermediateStops.length > 0) ||
          (typeof leg.intermediateStopsCount === "number" && leg.intermediateStopsCount > 0);
        const stopsCount =
          Array.isArray(leg.intermediateStops) && leg.intermediateStops.length > 0
            ? leg.intermediateStops.length
            : leg.intermediateStopsCount || 0;
        const isStopsExpanded = !!expandedStops[idx];

        if (isWalk) {
          return (
            <div key={`walk-${idx}`} className="flex items-center gap-3 py-2">
              <div className="w-11 text-right shrink-0">
                <span className="text-xs font-bold text-[#1C1914] font-bricolage">{times.departure}</span>
              </div>
              <div className="w-6 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A8A190]" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#575246] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#D6D0C2]/60 min-w-0 font-satoshi">
                <Footprints className="w-3.5 h-3.5 text-[#575246] shrink-0" />
                <span className="truncate font-semibold">Marche ({leg.durationMinutes || 5} min)</span>
              </div>
            </div>
          );
        }

        return (
          <React.Fragment key={`leg-${idx}`}>
            <div className="flex items-stretch gap-3">
              
              {/* Colonne 1 : Horaires (Départ en haut, Arrivée en bas) */}
              <div className="w-11 text-right shrink-0 flex flex-col justify-between py-1">
                <span className="text-xs font-bold text-[#1C1914] leading-none font-bricolage">
                  {times.departure}
                </span>
                <span className="text-xs font-bold text-[#1C1914] leading-none font-bricolage">
                  {times.arrival}
                </span>
              </div>

              {/* Colonne 2 : Pastille Mode + Ligne Graphique Continue centrée (w-6) */}
              <div className="w-6 shrink-0 flex flex-col items-center relative">
                {/* Pastille / Icône de mode de transport uniquement */}
                <div className="w-6 h-6 rounded-full bg-white shadow-xs border border-[#D6D0C2]/80 flex items-center justify-center z-10 shrink-0">
                  <InlineModeIcon mode={detectedMode} size={15} />
                </div>

                {/* Ligne verticale de la couleur officielle de la ligne */}
                <div
                  className="w-2.5 grow rounded-full my-0.5 relative flex flex-col justify-end items-center pb-1 shadow-2xs"
                  style={{ backgroundColor: lineColor }}
                >
                  {/* Point blanc intérieur en bas de la ligne */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Colonne 3 : Détails, Gares & Carte de ligne */}
              <div className="grow flex flex-col gap-2 pb-4 min-w-0">
                
                {/* Station de Départ du tronçon */}
                <div className="pt-1">
                  <span className="font-bold text-sm text-[#1C1914] block leading-none truncate font-satoshi">
                    {leg.fromName}
                  </span>
                </div>

                {/* Carte de Ligne & Direction */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D6D0C2]/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <TransportLineBadge
                      mode={leg.mode}
                      lineName={leg.lineName}
                      lineColor={leg.lineColor}
                      size={22}
                    />

                    {leg.durationMinutes ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1914] bg-white px-2.5 py-1 rounded-md border border-[#D6D0C2]/60 shadow-2xs font-satoshi">
                        <Clock4 className="w-3.5 h-3.5 text-[#EB490B]" />
                        <span>{leg.durationMinutes} min</span>
                      </span>
                    ) : null}
                  </div>

                  {leg.direction && (
                    <div className="text-xs text-[#575246] font-medium font-satoshi">
                      Direction : <strong className="text-[#1C1914] font-bold">{leg.direction}</strong>
                    </div>
                  )}

                  {/* Arrêts intermédiaires dépliables */}
                  {hasIntermediate && (
                    <div className="pt-1.5 border-t border-[#D6D0C2]/50 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleStops(idx)}
                        className="inline-flex items-center gap-1 text-xs text-[#EB490B] font-bold hover:underline cursor-pointer self-start font-satoshi"
                      >
                        <span>{stopsCount} arrêts</span>
                        {isStopsExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isStopsExpanded && Array.isArray(leg.intermediateStops) && (
                        <div className="pl-3 border-l-2 border-dashed border-[#D6D0C2] flex flex-col gap-1.5 mt-1">
                          {leg.intermediateStops.map((stop, sIdx) => {
                            const stopName = typeof stop === "string" ? stop : stop.name;
                            const stopTime = typeof stop === "string" ? undefined : stop.time;
                            return (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between text-xs text-[#575246] font-satoshi"
                              >
                                <span className="truncate">{stopName}</span>
                                {stopTime && (
                                  <span className="text-xs text-[#575246] shrink-0 font-mono font-semibold">
                                    {stopTime}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Station d'Arrivée du tronçon */}
                <div>
                  <span className="font-bold text-sm text-[#1C1914] block leading-none truncate font-satoshi">
                    {leg.toName}
                  </span>
                </div>

              </div>

            </div>

            {/* Correspondance entre étapes si l'étape suivante n'est pas une marche */}
            {idx < timelineLegs.length - 1 &&
              leg.mode !== "walk" &&
              timelineLegs[idx + 1].mode !== "walk" && (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-11" />
                  <div className="w-6 flex flex-col items-center gap-1 py-1">
                    <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
                    <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
                    <Footprints className="w-3.5 h-3.5 text-[#575246] my-0.5" />
                    <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
                    <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
                  </div>
                  <span className="text-xs text-[#575246] font-semibold font-satoshi">
                    Correspondance
                  </span>
                </div>
              )}
          </React.Fragment>
        );
      })}

      {/* Pointillés finaux */}
      {timelineLegs[timelineLegs.length - 1]?.mode !== "walk" && (
        <div className="flex items-center gap-3">
          <div className="w-11" />
          <div className="w-6 flex flex-col items-center gap-1 py-0.5">
            <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
            <div className="w-1 h-1 rounded-full bg-[#A8A190]" />
          </div>
          <div className="grow" />
        </div>
      )}

      {/* 5. Étape d'arrivée finale (Pilule orange continue) */}
      <div className="flex items-center gap-3 mt-1">
        <div className="inline-flex items-center gap-2 bg-[#EB490B] text-white px-2.5 py-1 rounded-full shadow-xs shrink-0">
          <span className="font-bold text-xs font-bricolage">{finalArrivalTime}</span>
          <div className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-[#575246] font-semibold leading-none">Arrivée :</span>
          <span className="font-bold text-sm text-[#1C1914] truncate font-satoshi">{arrivalTitle}</span>
        </div>
      </div>

    </div>
  );
}
