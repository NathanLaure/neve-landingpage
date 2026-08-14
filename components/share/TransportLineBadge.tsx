"use client";

import React from "react";
import {
  BUS_MODE_SVG,
  RER_MODE_SVG,
  METRO_MODE_SVG,
  TRANSILIEN_MODE_SVG,
  TRAM_MODE_SVG,
  RER_PICTOS,
  SNCF_PICTOS,
  METRO_PICTOS,
  TRAM_PICTOS,
} from "@/lib/idfmSvg";

const WALK_PERSON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#666666" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/>
</svg>`;

const TER_SNCF_BADGE = {
  bg: "#003882",
  text: "#FFFFFF",
  label: "TER",
};

/**
 * Calcule la couleur de texte accessible (#FFFFFF ou #000000)
 * en fonction de la luminance du fond hexadécimal.
 */
function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return "#FFFFFF";
  const cleanHex = hexColor.replace("#", "");
  if (cleanHex.length !== 6) return "#FFFFFF";
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? "#000000" : "#FFFFFF";
}

// Inline SVG helper component for React Web
function InlineSvg({
  svgString,
  size = 20,
  className = "",
}: {
  svgString: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}

export interface TransportLineBadgeProps {
  mode?: "train" | "rer" | "metro" | "tram" | "bus" | "walk" | string;
  lineName?: string;
  lineColor?: string;
  size?: number;
  durationMinutes?: number;
  hideModeIcon?: boolean;
  className?: string;
}

/**
 * Détecte automatiquement le mode de transport à partir du nom de la ligne
 * si aucun mode explicite n'est fourni.
 */
export function detectTransportMode(
  rawName?: string,
  explicitMode?: string
): { mode: string; cleanName: string } {
  if (explicitMode) {
    return { mode: explicitMode.toLowerCase(), cleanName: (rawName || "").trim() };
  }
  const val = (rawName || "").trim().toLowerCase();

  if (val.startsWith("rer ") || /^[a-e]$/i.test(val)) {
    return { mode: "rer", cleanName: val.replace(/^rer\s*/i, "").toUpperCase() };
  }
  if (val.startsWith("ligne ") || val.startsWith("transilien ") || /^[h-u]$/i.test(val)) {
    return {
      mode: "train",
      cleanName: val
        .replace(/^transilien\s*/i, "")
        .replace(/^ligne\s*/i, "")
        .toUpperCase(),
    };
  }
  if (val.startsWith("m") || val.startsWith("métro") || val.startsWith("metro") || /^(1[0-8]|[1-9])$/.test(val)) {
    return {
      mode: "metro",
      cleanName: val.replace(/^(métro|metro|m)\s*/i, ""),
    };
  }
  if (val.startsWith("t") || val.startsWith("tram")) {
    return {
      mode: "tram",
      cleanName: val.replace(/^tram(way)?\s*/i, ""),
    };
  }
  if (val.startsWith("bus ") || /^\d{2,3}$/.test(val)) {
    return {
      mode: "bus",
      cleanName: val.replace(/^bus\s*/i, ""),
    };
  }
  if (val.includes("ter")) {
    return { mode: "ter", cleanName: rawName || "TER" };
  }
  if (val.includes("tgv")) {
    return { mode: "tgv", cleanName: rawName || "TGV INOUI" };
  }
  return { mode: "train", cleanName: rawName || "" };
}

export function TransportLineBadge({
  mode: rawMode,
  lineName,
  lineColor,
  size = 22,
  durationMinutes,
  hideModeIcon = false,
  className = "",
}: TransportLineBadgeProps) {
  const { mode, cleanName } = detectTransportMode(lineName, rawMode);
  const cleanLineLower = cleanName.toLowerCase();

  // 1. RER (ex: 'A', 'B', 'C', 'D', 'E')
  if (mode === "rer") {
    const lineLetter = cleanLineLower.replace(/^rer\s*/, "");
    const pictoXml = lineLetter ? RER_PICTOS[lineLetter] : undefined;
    const bg = lineColor || "#E3051C";
    const textColor = getContrastTextColor(bg);

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {!hideModeIcon && <InlineSvg svgString={RER_MODE_SVG} size={size} />}
        {pictoXml ? (
          <InlineSvg svgString={pictoXml} size={size} />
        ) : cleanName ? (
          <span
            className="inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded text-xs leading-none shadow-2xs font-satoshi"
            style={{ backgroundColor: bg, color: textColor, minWidth: size, height: size }}
          >
            {cleanName}
          </span>
        ) : null}
      </div>
    );
  }

  // 2. Metro (ex: '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14')
  if (mode === "metro") {
    const lineNum = cleanLineLower.replace(/^m(étro|etro)?\s*/, "");
    const pictoXml = lineNum ? METRO_PICTOS[lineNum] : undefined;
    const bg = lineColor || "#6E6E9D";
    const textColor = getContrastTextColor(bg);

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {!hideModeIcon && <InlineSvg svgString={METRO_MODE_SVG} size={size} />}
        {pictoXml ? (
          <InlineSvg svgString={pictoXml} size={size} />
        ) : cleanName ? (
          <span
            className="inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded-full text-xs leading-none shadow-2xs font-satoshi"
            style={{ backgroundColor: bg, color: textColor, minWidth: size, height: size }}
          >
            {cleanName}
          </span>
        ) : null}
      </div>
    );
  }

  // 3. Train / Transilien (ex: 'H', 'J', 'K', 'L', 'N', 'P', 'R', 'U')
  if (mode === "train" || mode === "transilien") {
    const lineLetter = cleanLineLower.replace(/^ligne\s*/, "").replace(/^transilien\s*/, "");
    const pictoXml = lineLetter ? SNCF_PICTOS[lineLetter] : undefined;
    const bg = lineColor || "#004F9F";
    const textColor = getContrastTextColor(bg);

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {!hideModeIcon && <InlineSvg svgString={TRANSILIEN_MODE_SVG} size={size} />}
        {pictoXml ? (
          <InlineSvg svgString={pictoXml} size={size} />
        ) : cleanName ? (
          <span
            className="inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded text-xs leading-none shadow-2xs font-satoshi"
            style={{ backgroundColor: bg, color: textColor, minWidth: size, height: size }}
          >
            {cleanName}
          </span>
        ) : null}
      </div>
    );
  }

  // 4. Tram (ex: 't1', 't2', 't3a', 't3b', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 't13')
  if (mode === "tram") {
    const tramKey = cleanLineLower.startsWith("t") ? cleanLineLower : `t${cleanLineLower}`;
    const pictoXml = cleanLineLower ? TRAM_PICTOS[tramKey] : undefined;
    const bg = lineColor || "#0055C8";
    const textColor = getContrastTextColor(bg);

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {!hideModeIcon && <InlineSvg svgString={TRAM_MODE_SVG} size={size} />}
        {pictoXml ? (
          <InlineSvg svgString={pictoXml} size={size} />
        ) : cleanName ? (
          <span
            className="inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded text-xs leading-none shadow-2xs font-satoshi"
            style={{ backgroundColor: bg, color: textColor, minWidth: size, height: size }}
          >
            {cleanName}
          </span>
        ) : null}
      </div>
    );
  }

  // 5. Bus
  if (mode === "bus") {
    const bg = lineColor || "#760C6B";
    const textColor = getContrastTextColor(bg);

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {!hideModeIcon && <InlineSvg svgString={BUS_MODE_SVG} size={size} />}
        {cleanName ? (
          <span
            className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs leading-none shadow-2xs font-satoshi"
            style={{ backgroundColor: bg, color: textColor, minHeight: size }}
          >
            {cleanName}
          </span>
        ) : null}
      </div>
    );
  }

  // 6. TER / TGV / SNCF Hors IDF
  if (mode === "ter") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-lg text-xs leading-none shadow-2xs font-satoshi"
          style={{ backgroundColor: TER_SNCF_BADGE.bg, color: TER_SNCF_BADGE.text, minHeight: size }}
        >
          {cleanName || "TER"}
        </span>
      </div>
    );
  }

  if (mode === "tgv") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-lg text-xs leading-none shadow-2xs font-satoshi bg-[#8A1538] text-white"
          style={{ minHeight: size }}
        >
          {cleanName || "TGV INOUI"}
        </span>
      </div>
    );
  }

  // 7. Walk / Piéton (icône + minutes en indice)
  const mins =
    durationMinutes ??
    (lineName && !isNaN(Number(lineName)) ? Number(lineName) : undefined);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <InlineSvg svgString={WALK_PERSON_SVG} size={size} />
      {mins !== undefined && (
        <span className="absolute -bottom-1 -right-1 font-extrabold text-[10px] leading-none text-[#444444] bg-white/90 px-0.5 rounded">
          {mins}
        </span>
      )}
    </div>
  );
}

export default TransportLineBadge;
