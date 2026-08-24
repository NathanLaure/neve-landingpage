"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ArrowLeft,
  Heart,
  Share2,
  RefreshCw,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Download,
  Smartphone,
  Check,
  Train,
  Mountain,
  MapPin,
  Star,
  X,
  QrCode,
  Copy,
  ThumbsUp,
  MessageSquare,
  PenLine,
  Send,
} from "lucide-react";
import type { HikeDetail, HikeDifficulty } from "@/types/hike";
import {
  formatDifficultyLabel,
  formatDistance,
  formatDuration,
  formatElevation,
  formatRouteType,
} from "@/lib/format-hike";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { hasNavigoPass, isInNavigoZone } from "@/lib/navigo";

interface Props {
  hike: HikeDetail;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200&auto=format&fit=crop";

function getTagStyles(difficulty: HikeDifficulty) {
  switch (difficulty) {
    case "facile":
      return "bg-[#DCFCE7] text-[#0D542B]";
    case "modere":
      return "bg-[#FFEDD4] text-[#7B3306]";
    case "difficile":
    case "expert":
      return "bg-[#FFE2E2] text-[#82181A]";
    default:
      return "bg-[#FAF8F5] text-[#575246]";
  }
}

function getWeatherDetails(code: number) {
  if (code === 0) return { label: "Ensoleillé", Icon: Sun, color: "text-amber-500" };
  if (code >= 1 && code <= 3) return { label: "Éclaircies", Icon: CloudSun, color: "text-amber-400" };
  if (code === 45 || code === 48) return { label: "Brouillard", Icon: CloudFog, color: "text-slate-400" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return { label: "Pluie", Icon: CloudRain, color: "text-blue-500" };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return { label: "Neige", Icon: CloudSnow, color: "text-sky-300" };
  if (code >= 95 && code <= 99)
    return { label: "Orage", Icon: CloudLightning, color: "text-purple-500" };
  return { label: "Ensoleillé", Icon: Sun, color: "text-amber-500" };
}

const CATEGORIES = [
  "Randonnée",
  "Trail",
  "Refuge",
  "Vue panoramique",
  "Forêt",
  "Fleurs",
  "Lac",
  "Rivière",
  "Cascade",
  "Grotte",
  "Boucle",
  "Fréquenté",
];

export default function RandoDetailClient({ hike }: Props) {
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMobileBottomSheetOpen, setIsMobileBottomSheetOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [weatherForecast, setWeatherForecast] = useState<any[] | null>(null);
  const [hoveredElevationPoint, setHoveredElevationPoint] = useState<{
    distanceKm: number;
    elevationM: number;
    lng: number;
    lat: number;
  } | null>(null);

  // Reviews & Comments state (exact Figma node 288:3593)
  const [reviews, setReviews] = useState([
    {
      id: "1",
      author: "Michel lon",
      date: "Il y a 1 semaine",
      rating: 5,
      avatarBg: "bg-[#DCFCE7] text-[#0D542B]",
      comment: "Belle balade, ça fait les jambes, beaucoup de montée !!!",
    },
    {
      id: "2",
      author: "Sophie Dubois",
      date: "Il y a 3 jours",
      rating: 4,
      avatarBg: "bg-[#FFEDD4] text-[#7B3306]",
      comment:
        "Une expérience incroyable! Les paysages étaient à couper le souffle et j'ai adoré chaque minute passée en pleine nature. Je recommande vivement cette randonnée à tous les amateurs de plein air.",
    },
    {
      id: "3",
      author: "Thomas Martin",
      date: "Il y a 2 semaines",
      rating: 5,
      avatarBg: "bg-[#DFF2FE] text-[#024A70]",
      comment:
        "C'était une aventure mémorable! Bien que le chemin soit difficile par moments, la vue au sommet en valait vraiment la peine. Préparez-vous à être défié, mais n'oubliez pas votre appareil photo!",
    },
    {
      id: "4",
      author: "Laura Petit",
      date: "Il y a 5 jours",
      rating: 5,
      avatarBg: "bg-[#FFE2E2] text-[#82181A]",
      comment:
        "Une belle évasion loin de la ville. Les sentiers sont bien balisés et parfaits pour les familles. J'ai particulièrement apprécié la tranquillité et la beauté du lac que nous avons découvert en chemin.",
    },
  ]);

  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  /* Regle partagee avec l'explorateur : voir lib/navigo.ts. Elle vivait ici
     en cinquante lignes, recopiees des que le badge apparaissait ailleurs. */
  const showNavigoBadge =
    hasNavigoPass(user, profile) &&
    isInNavigoZone({ lat: hike.start_lat, lng: hike.start_lng, locationName: hike.location_name });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const isFavorited = isFavorite(hike.id);
  const isToggling = isFavoritePending(hike.id);

  const images = useMemo(() => {
    if (hike.gallery_urls && hike.gallery_urls.length > 0) {
      return [
        hike.cover_image_url || DEFAULT_IMAGE,
        ...hike.gallery_urls.filter((u) => u !== hike.cover_image_url),
      ];
    }
    return [hike.cover_image_url || DEFAULT_IMAGE];
  }, [hike]);

  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Extract route coordinates
  const routeCoordinates = useMemo(() => {
    if (!hike.geometry || !hike.geometry.coordinates) return [];
    if (hike.geometry.type === "LineString") {
      return hike.geometry.coordinates as [number, number, number?][];
    }
    if (hike.geometry.type === "MultiLineString") {
      return (hike.geometry.coordinates as [number, number, number?][][]).flat();
    }
    return [];
  }, [hike]);

  // Elevation Profile
  const elevationProfile = useMemo(() => {
    if (routeCoordinates.length < 2) return [];

    let totalDist = 0;
    const points: { distanceKm: number; elevationM: number; lng: number; lat: number }[] = [];
    const has3D = routeCoordinates.some((c) => c[2] !== undefined && c[2] > 0);
    const baseElevation = 80;
    const peakElevation = baseElevation + hike.elevation_gain_m;

    for (let i = 0; i < routeCoordinates.length; i++) {
      const curr = routeCoordinates[i];
      if (i > 0) {
        const prev = routeCoordinates[i - 1];
        const dLat = ((curr[1] - prev[1]) * Math.PI) / 180;
        const dLng = ((curr[0] - prev[0]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((prev[1] * Math.PI) / 180) *
            Math.cos((curr[1] * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const distKm = 2 * 6371 * Math.asin(Math.sqrt(a));
        totalDist += distKm;
      }

      let ele = baseElevation;
      if (has3D && curr[2] !== undefined) {
        ele = curr[2];
      } else {
        const progress = i / (routeCoordinates.length - 1);
        const curve = Math.sin(progress * Math.PI);
        const noise = Math.sin(progress * 4 * Math.PI) * 0.15;
        ele = Math.round(baseElevation + (peakElevation - baseElevation) * Math.max(0, curve + noise));
      }

      points.push({
        distanceKm: Math.round(totalDist * 100) / 100,
        elevationM: ele,
        lng: curr[0],
        lat: curr[1],
      });
    }

    return points;
  }, [routeCoordinates, hike.elevation_gain_m]);

  const handleFavoriteClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    toggleFavorite(hike.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: hike.title,
          text: `Découvre la randonnée "${hike.title}" sur Névé :`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignored
    }
  };

  const handleOpenAppOrQr = () => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid || (typeof window !== "undefined" && window.innerWidth < 768);

    if (isMobile) {
      setIsMobileBottomSheetOpen(true);
    } else {
      setIsQrModalOpen(true);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newRev = {
      id: Date.now().toString(),
      author: user?.user_metadata?.full_name || "Randonneur Névé",
      date: "À l'instant",
      rating: newReviewRating,
      avatarBg: "bg-[#FFF0E8] text-[#EB490B]",
      comment: newReviewComment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setNewReviewComment("");
    setIsReviewFormOpen(false);
  };

  const handleDownloadGPX = () => {
    if (!hike.geometry || !hike.geometry.coordinates) return;
    const coords =
      hike.geometry.type === "LineString"
        ? (hike.geometry.coordinates as [number, number, number?][])
        : (hike.geometry.coordinates as [number, number, number?][][]).flat();

    const trkpts = coords
      .map(
        (c) =>
          `    <trkpt lat="${c[1]}" lon="${c[0]}">${
            c[2] !== undefined ? `\n      <ele>${c[2]}</ele>` : ""
          }\n    </trkpt>`
      )
      .join("\n");

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Névé - https://neve-rando.fr" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${hike.title}</name>
  </metadata>
  <trk>
    <name>${hike.title}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${hike.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.gpx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Weather fetch
  useEffect(() => {
    let isMounted = true;
    const lat = hike.start_lat || 48.8566;
    const lon = hike.start_lng || 2.3522;

    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await res.json();
        if (data?.daily?.time && isMounted) {
          const daysLabels = ["Aujourd’hui", "Demain", "Après demain"];
          const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

          const forecast = data.daily.time.slice(0, 3).map((dateStr: string, idx: number) => {
            const dateObj = new Date(dateStr);
            const dayName = dayNames[dateObj.getDay()];
            const dateNum = dateObj.getDate();
            const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
            const minTemp = Math.round(data.daily.temperature_2m_min[idx]);
            const code = data.daily.weather_code[idx];
            const details = getWeatherDetails(code);

            return {
              day: daysLabels[idx] || dayName,
              date: `${dayName} ${dateNum}`,
              desc: details.label,
              Icon: details.Icon,
              color: details.color,
              temp: `${minTemp}-${maxTemp}℃`,
            };
          });
          setWeatherForecast(forecast);
        }
      } catch {
        // Fallback
      }
    }

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [hike.start_lat, hike.start_lng]);

  // Mapbox initialization
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const startLat = hike.start_lat || 48.8566;
    const startLng = hike.start_lng || 2.3522;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [startLng, startLat],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // 1. Marqueur de départ officiel Névé (Pastille orange + contour blanc + icône de direction blanche)
      const startEl = document.createElement("div");
      startEl.className = "cursor-pointer select-none group";
      startEl.title = "Départ du parcours";
      startEl.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-[#EB490B] border-2 border-white shadow-[0px_3px_10px_rgba(0,0,0,0.25)] flex items-center justify-center transition-transform group-hover:scale-110">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      `;
      new mapboxgl.Marker({ element: startEl, anchor: "center" })
        .setLngLat([startLng, startLat])
        .addTo(map);

      // 2. Tracé officiel Névé (Sous-couche blanche de casing + ligne orange nette)
      if (hike.geometry && hike.geometry.coordinates) {
        const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
          type: "Feature",
          properties: {},
          geometry: hike.geometry as GeoJSON.Geometry,
        };

        map.addSource("hike-route", {
          type: "geojson",
          data: geojson,
        });

        // Casing blanc
        map.addLayer({
          id: "hike-route-glow",
          type: "line",
          source: "hike-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": 8,
            "line-opacity": 1,
          },
        });

        // Ligne de tracé orange Névé
        map.addLayer({
          id: "hike-route-line",
          type: "line",
          source: "hike-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#EB490B",
            "line-width": 4.5,
            "line-opacity": 1,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        if (hike.geometry.type === "LineString") {
          (hike.geometry.coordinates as [number, number][]).forEach((coord) => bounds.extend(coord));
        } else if (hike.geometry.type === "MultiLineString") {
          (hike.geometry.coordinates as [number, number][][]).forEach((line) =>
            line.forEach((coord) => bounds.extend(coord))
          );
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 800,
          });
        }
      }
    });

    return () => {
      map.remove();
    };
  }, [hike, mapboxToken]);

  // Elevation Profile Hover sync with Map Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hoveredElevationPoint) {
      if (hoverMarkerRef.current) {
        hoverMarkerRef.current.remove();
        hoverMarkerRef.current = null;
      }
      return;
    }

    if (!hoverMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "w-4 h-4 rounded-full bg-[#EB490B] border-2 border-white shadow-lg animate-pulse";
      hoverMarkerRef.current = new mapboxgl.Marker({ element: el });
    }

    hoverMarkerRef.current
      .setLngLat([hoveredElevationPoint.lng, hoveredElevationPoint.lat])
      .addTo(map);
  }, [hoveredElevationPoint]);

  const getRouteTypeIcon = () => {
    switch (hike.route_type) {
      case "aller_retour":
        return <ArrowLeftRight className="w-4 h-4 text-[#575246]" />;
      case "point_a_point":
        return <ArrowRight className="w-4 h-4 text-[#575246]" />;
      case "boucle":
      default:
        return <RefreshCw className="w-4 h-4 text-[#575246]" />;
    }
  };

  // SVG Chart calculation
  const chartWidth = 600;
  const chartHeight = 120;
  const minEle = useMemo(() => {
    if (elevationProfile.length === 0) return 0;
    return Math.min(...elevationProfile.map((p) => p.elevationM)) - 20;
  }, [elevationProfile]);

  const maxEle = useMemo(() => {
    if (elevationProfile.length === 0) return 100;
    return Math.max(...elevationProfile.map((p) => p.elevationM)) + 20;
  }, [elevationProfile]);

  const chartPoints = useMemo(() => {
    if (elevationProfile.length === 0) return "";
    const n = elevationProfile.length;
    const totalDist = elevationProfile[n - 1].distanceKm || 1;
    const eleRange = maxEle - minEle || 1;

    return elevationProfile
      .map((p, idx) => {
        const x = idx === 0 ? 0 : idx === n - 1 ? chartWidth : (p.distanceKm / totalDist) * chartWidth;
        const y = chartHeight - ((p.elevationM - minEle) / eleRange) * (chartHeight - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [elevationProfile, minEle, maxEle]);

  const areaPoints = useMemo(() => {
    if (!chartPoints || elevationProfile.length === 0) return "";
    const eleRange = maxEle - minEle || 1;
    const firstY = chartHeight - ((elevationProfile[0].elevationM - minEle) / eleRange) * (chartHeight - 20) - 10;
    const lastY = chartHeight - ((elevationProfile[elevationProfile.length - 1].elevationM - minEle) / eleRange) * (chartHeight - 20) - 10;
    return `0,${chartHeight} 0,${firstY.toFixed(1)} ${chartPoints} ${chartWidth},${lastY.toFixed(1)} ${chartWidth},${chartHeight}`;
  }, [chartPoints, elevationProfile, minEle, maxEle]);

  return (
    <div className="bg-white min-h-screen text-[#1C1914] pt-24 sm:pt-28 md:pt-32 pb-28">
      {/* UNIFIED CONTAINER: All sections have the exact same width */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 space-y-8">
        
        {/* 1. Breadcrumb & Title & Meta Header */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-[#7A7363]">
            <Link
              href="/randos-sans-voiture"
              className="hover:text-[#1C1914] transition inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Randonnées sans voiture</span>
            </Link>
            {hike.location_name && (
              <>
                <span>/</span>
                <span className="text-[#575246] font-medium truncate max-w-[200px] sm:max-w-none">
                  {hike.location_name}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="font-bricolage font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-[#1C1914] leading-[1.15] tracking-tight">
            {hike.title}
          </h1>

          {/* Metadata Row: Location + Tags + Reviews */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-0.5">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Location */}
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#575246]">
                <MapPin className="w-4 h-4 text-[#A8A190] shrink-0" />
                <span>{hike.location_name || "France"}</span>
              </div>

              <span className="text-[#D6D0C2] hidden sm:inline">•</span>

              {/* Difficulty Tag */}
              <span
                className={`px-3 py-1 rounded-md text-xs sm:text-sm font-bold ${getTagStyles(
                  hike.difficulty
                )}`}
              >
                {formatDifficultyLabel(hike.difficulty)}
              </span>

              {/* Route Type */}
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#575246]">
                {getRouteTypeIcon()}
                <span>{formatRouteType(hike.route_type)}</span>
              </div>

              {/* Pass Navigo Sticker (Affiché UNIQUEMENT si l'utilisateur a déclaré avoir un pass Navigo ET si la sortie est couverte) */}
              {showNavigoBadge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DCFCE7] text-[#0D542B] text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#0D542B]" />
                  <span>Accessible avec le pass Navigo</span>
                </span>
              )}
            </div>

            {/* Rating / Review Link */}
            <div className="flex items-center gap-1.5 text-sm sm:text-base text-[#575246]">
              <Star className="w-4 h-4 fill-[#1C1914] text-[#1C1914]" />
              <span className="font-bold text-[#1C1914] text-base sm:text-lg">4,6</span>
              <span className="text-[#575246] font-medium text-xs sm:text-sm">
                (234 avis)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Hero Image Carousel (PLACED DIRECTLY UNDER THE TITLE) */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF8F5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImageIndex]}
            alt={hike.title}
            className="w-full h-full object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#1C1914]" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#1C1914]" />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all ${
                      idx === activeImageIndex
                        ? "w-5 h-2 bg-white shadow-sm"
                        : "w-2 h-2 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 4. Key Specs Row (Durée, Longueur, D+, D-) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-5 border-y border-[#D6D0C2]/50">
          <div>
            <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246]">Durée</p>
            <p className="font-satoshi font-bold text-2xl sm:text-3xl text-[#1C1914] mt-1">
              {formatDuration(hike.duration_minutes)}
            </p>
          </div>

          <div>
            <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246]">Longueur</p>
            <p className="font-satoshi font-bold text-2xl sm:text-3xl text-[#1C1914] mt-1">
              {formatDistance(hike.distance_km)}
            </p>
          </div>

          <div>
            <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246]">Dénivelé positif</p>
            <p className="font-satoshi font-bold text-2xl sm:text-3xl text-[#0D542B] mt-1">
              {formatElevation(hike.elevation_gain_m)}
            </p>
          </div>

          <div>
            <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246]">Dénivelé négatif</p>
            <p className="font-satoshi font-bold text-2xl sm:text-3xl text-[#82181A] mt-1">
              -{Math.round(hike.elevation_loss_m || 0)}m
            </p>
          </div>
        </div>

        {/* 5. 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          
          {/* Main Column (8 cols): Description, Map with Elevation, Weather, Categories */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-satoshi font-bold text-2xl text-[#1C1914]">
                Description de l&apos;itinéraire
              </h2>
              <p
                className={`font-satoshi font-medium text-sm sm:text-base text-[#1C1914] leading-relaxed whitespace-pre-line ${
                  !isDescriptionExpanded ? "line-clamp-4" : ""
                }`}
              >
                {hike.description ||
                  "Randonnée accessible en transports en commun. Sentiers bien balisés et accessibles pour la plupart. Restez vigilant et profitez du panorama."}
              </p>
              {hike.description && hike.description.length > 220 && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((v) => !v)}
                  className="text-sm sm:text-base font-bold text-[#EB490B] hover:underline cursor-pointer"
                >
                  {isDescriptionExpanded ? "Afficher moins" : "Afficher plus"}
                </button>
              )}
            </div>

            {/* Carte & Profil Altimétrique */}
            <div className="space-y-3">
              <h2 className="font-satoshi font-bold text-2xl text-[#1C1914]">Carte du parcours</h2>

              {/* Mapbox Canvas with Floating Maximize Button in Top-Right Corner */}
              <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#FAF8F5]">
                <div ref={mapContainerRef} className="w-full h-full" />
                
                <Link
                  href={`/explorer?hike=${hike.id}`}
                  aria-label="Agrandir la carte en plein écran"
                  title="Agrandir la carte"
                  className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-gray-50 transition active:scale-95 cursor-pointer"
                >
                  <Maximize2 className="w-5 h-5 text-[#1C1914]" />
                </Link>
              </div>

              {/* Elevation Profile Chart (Sans cadre) */}
              {elevationProfile.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-base font-bold text-[#575246]">
                      <Mountain className="w-5 h-5 text-[#EB490B]" />
                      <span>Profil altimétrique</span>
                    </div>
                    {hoveredElevationPoint ? (
                      <span className="text-sm sm:text-base font-bold text-[#EB490B]">
                        {hoveredElevationPoint.distanceKm} km • {hoveredElevationPoint.elevationM} m
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm text-[#7A7363] font-medium">
                        <span className="sm:hidden">Touchez pour explorer</span>
                        <span className="hidden sm:inline">Survolez pour explorer le relief</span>
                      </span>
                    )}
                  </div>

                  <div className="relative w-full overflow-hidden touch-pan-x">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      preserveAspectRatio="none"
                      className="w-full h-24 sm:h-28 cursor-crosshair select-none"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const ratio = Math.max(0, Math.min(1, x / rect.width));
                        const idx = Math.floor(ratio * (elevationProfile.length - 1));
                        setHoveredElevationPoint(elevationProfile[idx]);
                      }}
                      onMouseLeave={() => setHoveredElevationPoint(null)}
                      onTouchStart={(e) => {
                        if (!e.touches[0]) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.touches[0].clientX - rect.left;
                        const ratio = Math.max(0, Math.min(1, x / rect.width));
                        const idx = Math.floor(ratio * (elevationProfile.length - 1));
                        setHoveredElevationPoint(elevationProfile[idx]);
                      }}
                      onTouchMove={(e) => {
                        if (!e.touches[0]) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.touches[0].clientX - rect.left;
                        const ratio = Math.max(0, Math.min(1, x / rect.width));
                        const idx = Math.floor(ratio * (elevationProfile.length - 1));
                        setHoveredElevationPoint(elevationProfile[idx]);
                      }}
                      onTouchEnd={() => setHoveredElevationPoint(null)}
                    >
                      <defs>
                        <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#EB490B" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#EB490B" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      <polygon points={areaPoints} fill="url(#elevationGrad)" />
                      <polyline
                        points={chartPoints}
                        fill="none"
                        stroke="#EB490B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {hoveredElevationPoint && (
                        <>
                          {(() => {
                            const totalDist =
                              elevationProfile[elevationProfile.length - 1].distanceKm || 1;
                            const x = (hoveredElevationPoint.distanceKm / totalDist) * chartWidth;
                            const eleRange = maxEle - minEle || 1;
                            const y =
                              chartHeight -
                              ((hoveredElevationPoint.elevationM - minEle) / eleRange) *
                                (chartHeight - 20) -
                              10;
                            return (
                              <>
                                <line
                                  x1={x}
                                  y1="0"
                                  x2={x}
                                  y2={chartHeight}
                                  stroke="#7A7363"
                                  strokeDasharray="3 3"
                                  strokeWidth="1.5"
                                />
                                <circle cx={x} cy={y} r="4.5" fill="#EB490B" stroke="#ffffff" strokeWidth="2" />
                              </>
                            );
                          })()}
                        </>
                      )}
                    </svg>

                    <div className="flex justify-between text-sm font-bold text-[#7A7363] mt-1.5">
                      <span>Départ (0 km)</span>
                      <span>+{Math.round(hike.elevation_gain_m)}m D+</span>
                      <span>Arrivée ({formatDistance(hike.distance_km)})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Météo à 3 jours */}
            <div className="space-y-3">
              <h2 className="font-satoshi font-bold text-2xl text-[#1C1914]">Météo à 3 jours</h2>
              
              <div className="bg-[#DFF2FE] rounded-2xl p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-satoshi font-bold text-lg text-[#1C1914]">
                    {hike.location_name || "Point de départ"}
                  </p>
                </div>

                <div className="h-px w-full bg-[#B8E0F9]" />

                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  {(weatherForecast || [
                    { day: "Aujourd’hui", date: "En cours", desc: "Ensoleillé", Icon: Sun, color: "text-amber-500", temp: "15-20℃" },
                    { day: "Demain", date: "J+1", desc: "Éclaircies", Icon: CloudSun, color: "text-amber-400", temp: "14-18℃" },
                    { day: "Après demain", date: "J+2", desc: "Pluie", Icon: CloudRain, color: "text-blue-500", temp: "11-15℃" },
                  ]).map((fc, i) => {
                    const WeatherIconComp = fc.Icon;
                    return (
                      <div key={i} className="flex flex-col items-center text-center gap-1">
                        <p className="font-satoshi font-bold text-sm sm:text-base text-[#1C1914]">{fc.day}</p>
                        <p className="font-satoshi font-medium text-xs sm:text-sm text-[#575246]">{fc.date}</p>
                        <div className="my-1.5">
                          <WeatherIconComp className={`w-8 h-8 sm:w-11 sm:h-11 ${fc.color}`} />
                        </div>
                        <p className="font-satoshi font-bold text-sm sm:text-base text-[#1C1914]">{fc.desc}</p>
                        <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246]">{fc.temp}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="space-y-3">
              <h2 className="font-satoshi font-bold text-2xl text-[#1C1914]">Catégories</h2>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {CATEGORIES.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-[#D6D0C2]/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-satoshi font-medium text-sm sm:text-base text-[#1C1914] shadow-xs"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column (4 cols): Transport Info & App Névé Box */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Transport Card */}
            <div className="space-y-3 bg-[#FAF8F5] border border-[#D6D0C2]/70 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-[#0D542B]">
                <Train className="w-6 h-6" />
                <h3 className="font-satoshi font-bold text-xl text-[#1C1914]">
                  Accès en train
                </h3>
              </div>

              <div className="space-y-2 pt-1">
                <p className="font-satoshi font-bold text-sm sm:text-base text-[#1C1914]">
                  {hike.location_name || "Gare à proximité"}
                </p>
                <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246] leading-relaxed">
                  Cette randonnée commence et se termine à proximité de la gare. Pensez à vérifier les horaires de train avant votre départ.
                </p>
              </div>
            </div>

            {/* Application Névé Card - Planification & Accompagnement */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#D6D0C2]/70 shadow-xs space-y-4">
              <h3 className="font-bricolage font-bold text-xl text-[#1C1914] leading-snug">
                Planifiez cette sortie avec Névé
              </h3>

              <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246] leading-relaxed">
                L&apos;application calcule vos correspondances de train et vous guide pas à pas sur le sentier du départ à l&apos;arrivée.
              </p>

              {/* Key Features Bullets */}
              <div className="space-y-2.5 pt-1 text-sm sm:text-base font-medium text-[#1C1914]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-[#0D542B] shrink-0 mt-0.5" />
                  <span>Horaires de train aller-retour adaptés à votre vitesse de marche</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-[#0D542B] shrink-0 mt-0.5" />
                  <span>Guidage GPS interactif sans réseau (100% hors-ligne)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-[#0D542B] shrink-0 mt-0.5" />
                  <span>Alertes météo et trafic SNCF en temps réel</span>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <button
                  type="button"
                  onClick={handleOpenAppOrQr}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#EB490B] hover:bg-[#C3350B] text-white font-bold text-base text-center shadow-xs transition cursor-pointer"
                >
                  Planifier ma sortie dans l&apos;app
                </button>

                <button
                  type="button"
                  onClick={handleDownloadGPX}
                  className="w-full py-3 px-5 rounded-xl bg-white hover:bg-gray-100 text-[#1C1914] font-bold text-base text-center transition cursor-pointer inline-flex items-center justify-center gap-2 border border-[#D6D0C2]/80"
                >
                  <Download className="w-4 h-4 text-[#575246]" />
                  <span>Télécharger la trace GPX</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 6. "Planifiez vos escapades sans voiture" App Banner (Fond #FAF8F5 & Icône orange pure) */}
        <div className="mt-12 rounded-3xl bg-[#FAF8F5] border border-[#D6D0C2]/70 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          {/* Left: Pure Brand Orange Icon + Copy */}
          <div className="flex items-center gap-4 sm:gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 128 128" className="w-12 h-12" fill="none">
                <path
                  d="M58.4294 28.9513C59.9837 27.9557 61.8719 27.6281 63.6693 28.0422L63.6699 28.0424C64.6954 28.2764 65.6944 28.8272 66.6566 29.5043C67.62 30.1823 68.5228 30.9691 69.3728 31.67L69.3729 31.6701C76.0379 37.165 81.3379 44.1001 85.5424 51.6618L85.543 51.6628C86.5592 53.4725 87.4863 55.3309 88.3213 57.2314L88.3219 57.2328C88.5701 57.7894 88.8082 58.4058 89.0876 58.9803C89.18 59.1706 89.2458 59.3738 89.3318 59.6091C89.4114 59.8269 89.5061 60.0643 89.6495 60.2824C89.7995 60.6249 89.9394 60.9881 90.0562 61.3421V61.3422C90.7526 63.4502 91.5411 65.5559 92.1324 67.6704L92.1326 67.671L92.1328 67.6716C92.8346 70.1413 93.3583 72.6534 93.7018 75.1885L93.7021 75.1914L93.7022 75.1917C93.7022 75.192 93.7023 75.1926 93.7024 75.1934C93.7027 75.195 93.703 75.1975 93.7035 75.2008C93.7044 75.2076 93.7059 75.2179 93.7077 75.2316C93.7115 75.259 93.717 75.3002 93.7239 75.3546C93.7377 75.4633 93.757 75.6245 93.779 75.8329C93.8231 76.2497 93.8778 76.8551 93.9202 77.6066C94.0051 79.1101 94.0404 81.1959 93.8424 83.525C93.8293 83.679 93.9432 83.8145 94.0968 83.8276C94.2504 83.8408 94.3855 83.7266 94.3986 83.5725C94.5994 81.2109 94.5636 79.0977 94.4776 77.5749C94.4346 76.8133 94.3791 76.1987 94.3342 75.7738C94.3117 75.5614 94.2919 75.3963 94.2777 75.2839C94.2761 75.2717 94.2745 75.2601 94.2731 75.2491C94.3212 75.2005 94.3872 75.1344 94.4697 75.0534C94.6587 74.8679 94.9342 74.6045 95.278 74.2945C95.9664 73.6738 96.9261 72.8688 98.0149 72.1275C99.1056 71.3849 100.314 70.7142 101.501 70.352C102.689 69.9896 103.825 69.9447 104.798 70.4085C105.75 70.8619 106.436 71.7478 106.923 72.8656C107.411 73.9823 107.688 75.3031 107.838 76.5783C107.988 77.8513 108.011 79.0656 107.996 79.9629C107.988 80.4111 107.972 80.7792 107.956 81.0348C107.951 81.1355 107.945 81.2187 107.94 81.2824C107.881 81.3144 107.802 81.3567 107.706 81.4081C107.468 81.535 107.121 81.7178 106.687 81.9404C105.817 82.3858 104.597 82.9905 103.194 83.628C100.382 84.9057 96.8588 86.3042 93.9591 86.8242C91.708 87.2279 89.1522 87.4584 86.9728 87.5057C85.8832 87.5294 84.8918 87.5072 84.0825 87.4389C83.2633 87.3698 82.6609 87.2557 82.3287 87.1107C81.6658 86.8215 81.1365 86.2148 80.7598 85.1723C80.3933 84.1578 80.1811 82.7548 80.1299 80.8986L80.1255 80.7176C80.0585 74.6315 79.2791 70.3386 77.8989 66.5039C76.5211 62.6757 74.5473 59.3143 72.1174 55.1035C71.5645 54.1457 70.9412 53.2529 70.3195 52.3746C69.6956 51.4934 69.0743 50.6284 68.512 49.7121L68.3429 49.4365L68.0954 49.644C68.009 49.7164 67.9452 49.7633 67.8868 49.8081C67.8331 49.8492 67.7676 49.9001 67.7134 49.968C67.5971 50.1134 67.5681 50.2935 67.5341 50.5202C67.3801 51.5459 67.1962 52.6205 66.9814 53.6315C66.463 55.9678 65.8351 58.2783 65.0996 60.5555L65.0996 60.5557C64.5317 62.3181 63.7678 64.0981 63.0265 65.8132C59.4575 74.0727 53.0543 81.9087 44.4925 85.1569L44.3431 85.2116C42.7981 85.7726 41.2049 86.1917 39.5837 86.4645L39.5827 86.4646L39.5818 86.4648C36.9123 86.933 35.1117 86.9838 32.4178 86.7423L32.4172 86.7422L32.4165 86.7422L32.2169 86.7246C32.0173 86.7064 31.818 86.6863 31.6189 86.6643C29.5932 86.4404 27.5933 86.0201 25.6474 85.4091C24.6525 85.0903 23.7323 84.7142 22.7045 84.3379C22.5597 84.2848 22.3994 84.3596 22.3465 84.5048C22.2937 84.65 22.3682 84.8107 22.513 84.8637C23.5153 85.2307 24.469 85.6192 25.4775 85.9424L25.4784 85.9426L25.4791 85.9429C27.4141 86.5506 29.4017 86.9728 31.4149 87.2045C31.4475 87.2636 31.4911 87.3433 31.5434 87.4418C31.6674 87.675 31.841 88.0131 32.0384 88.4301C32.4338 89.2651 32.9229 90.4129 33.3014 91.6689C33.6805 92.9273 33.9443 94.2801 33.8998 95.5292C33.8554 96.7763 33.5051 97.8971 32.68 98.729C32.0093 99.4053 30.9986 99.7966 29.8199 99.9875C28.6452 100.178 27.3361 100.163 26.1053 100.057C24.8763 99.9503 23.7357 99.7526 22.9017 99.5813C22.4851 99.4957 22.1456 99.4168 21.9108 99.3594C21.8328 99.3404 21.7664 99.3236 21.7126 99.3098C21.705 99.2727 21.6963 99.2295 21.6866 99.1804C21.6474 98.9831 21.591 98.6899 21.5222 98.3076C21.3847 97.5429 21.1978 96.4219 21.0012 94.9993C20.6078 92.154 20.1752 88.1032 20.0192 83.2849C19.8639 78.4874 20.6722 75.3121 21.6956 73.3834C22.2074 72.4188 22.7694 71.7727 23.285 71.3874C23.8061 70.998 24.254 70.8922 24.5537 70.9455C25.343 71.0859 26.0449 71.2917 26.5499 71.4626C26.8021 71.5479 27.0044 71.6244 27.143 71.6792C27.2123 71.7066 27.2657 71.7285 27.3013 71.7435C27.3191 71.751 27.3325 71.7567 27.3412 71.7605C27.3456 71.7624 27.3488 71.7637 27.3509 71.7646C27.3519 71.765 27.3526 71.7654 27.3531 71.7656L27.3534 71.7658L27.3549 71.7664L27.3565 71.767C28.4869 72.2507 29.6582 72.6323 30.8564 72.9073L30.8585 72.9078C34.4925 73.7112 39.0928 73.6401 42.3421 71.4369C46.9131 68.3377 49.9042 63.6689 51.8769 58.5111C53.8494 53.3537 54.8105 47.6899 55.3109 42.5749C55.4596 41.051 55.4513 39.3715 55.5438 37.8672L55.5444 37.8583V37.8493C55.5405 36.0653 55.4203 34.3787 55.7296 32.8451C56.0332 31.3394 56.7496 30.0044 58.4271 28.9528L58.4283 28.9521L58.4294 28.9513Z"
                  fill="#FA6415"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-bricolage font-bold text-2xl sm:text-3xl text-[#1C1914]">
                Planifiez vos sorties 100% sans voiture
              </h3>
              <p className="font-satoshi font-medium text-sm sm:text-base text-[#575246] mt-1.5 max-w-xl leading-relaxed">
                Horaires de train synchronisés, correspondances calculées et guidage GPS en direct : partez à l&apos;aventure en toute liberté avec Névé.
              </p>
            </div>
          </div>

          {/* Right: Store Badges + QR Code */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap justify-center">
            {/* App Store Badge */}
            <a
              href="https://apps.apple.com/app/id6742337775"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:opacity-90 active:scale-95"
              aria-label="Télécharger dans l'App Store"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/app-apple-fr-FR.d5bac4a9.svg"
                alt="Télécharger dans l'App Store"
                className="h-11 sm:h-12 w-auto"
              />
            </a>

            {/* Google Play Badge */}
            <a
              href="https://play.google.com/store/apps/details?id=com.neve.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:opacity-90 active:scale-95"
              aria-label="Disponible sur Google Play"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/app-google-fr-FR.922a8286.svg"
                alt="Disponible sur Google Play"
                className="h-11 sm:h-12 w-auto"
              />
            </a>

            {/* QR Code Container */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="hidden lg:flex items-center justify-center w-12 h-12 bg-white p-1.5 rounded-xl shadow-2xs border border-[#D6D0C2]/80 shrink-0 hover:bg-gray-50 text-[#1C1914] transition cursor-pointer"
              title="Scannez pour ouvrir sur votre téléphone"
            >
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h-2v2h2v-2zm-4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v2h-2v-2zm0-2h2v2h-2v-2zm-6-2h2v2h-2v-2zm8 8h-4v-2h2v-2h2v4zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 7. Avis des randonneurs (Exact Figma node 288:3593) */}
        <div className="mt-14 space-y-6 pt-4">
          {/* Heading */}
          <div>
            <h2 className="font-satoshi font-bold text-xl sm:text-2xl text-[#1C1914]">
              Avis des randonneurs
            </h2>
          </div>

          {/* Row: Score + Single Star on the left, total count underlined on the right */}
          <div className="flex items-end justify-between w-full pb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bricolage font-semibold text-5xl text-[#1C1914] tracking-tight leading-none">
                4,6
              </span>
              <Star className="w-4 h-4 fill-[#1C1914] text-[#1C1914]" />
            </div>
            <p className="font-satoshi font-medium text-base text-[#575246] underline">
              234 avis
            </p>
          </div>

          {/* Web Direct Review Composer (Sans conteneur ni cadre inutile) */}
          <form onSubmit={handleAddReview} className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-satoshi font-bold text-base text-[#1C1914]">
                Donnez votre avis sur cette randonnée
              </span>

              {/* Interactive Star Picker */}
              <div className="flex items-center gap-1.5">
                <span className="font-satoshi font-medium text-sm text-[#575246] mr-1">
                  Note :
                </span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-0.5 hover:scale-110 transition cursor-pointer"
                    aria-label={`Attribuer ${star} étoiles`}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= newReviewRating
                          ? "fill-[#EB490B] text-[#EB490B]"
                          : "text-[#D6D0C2]"
                      }`}
                    />
                  </button>
                ))}
                <span className="font-satoshi font-bold text-base text-[#1C1914] ml-1">
                  {newReviewRating}/5
                </span>
              </div>
            </div>

            {/* Input with Integrated Send Button on typing */}
            <div className="relative">
              <textarea
                id="review-text"
                rows={newReviewComment.trim().length > 0 ? 3 : 2}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Partagez votre avis sur l'itinéraire, les conditions du sentier ou l'accès en train..."
                className={`w-full p-4 rounded-xl border border-[#D6D0C2] bg-white text-base text-[#1C1914] placeholder:text-[#A8A190] focus:outline-hidden focus:border-[#1C1914] transition ${
                  newReviewComment.trim().length > 0 ? "pb-14" : ""
                }`}
                required
              />

              {/* Action Button: visible ONLY when user types something */}
              {newReviewComment.trim().length > 0 && (
                <button
                  type="submit"
                  className="absolute right-3 bottom-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#EB490B] hover:bg-[#C3350B] text-white font-satoshi font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer animate-in fade-in zoom-in-95 duration-150"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer mon avis</span>
                </button>
              )}
            </div>
          </form>

          {/* List of Reviews (exact Figma layout with dividers) */}
          <div className="flex flex-col">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id}
                className={`py-7 ${
                  idx !== reviews.length - 1 ? "border-b border-[#D6D0C2]" : ""
                } space-y-3`}
              >
                {/* Header: Picture + Name/Date on left, Stars on right */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-[53px] h-[53px] rounded-full ${rev.avatarBg} flex items-center justify-center font-satoshi font-bold text-base shrink-0 select-none`}
                    >
                      {rev.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-satoshi font-medium text-base text-[#1C1914]">
                        {rev.author}
                      </p>
                      <p className="font-satoshi font-medium text-sm text-[#575246]">
                        {rev.date}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? "fill-[#1C1914] text-[#1C1914]"
                            : "text-[#D6D0C2]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="font-satoshi font-medium text-sm sm:text-base text-[#1C1914] leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Bottom Action Capsule (Névé Brand - Responsive) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] bg-[#1C1914] p-2 rounded-full shadow-[0px_12px_36px_rgba(0,0,0,0.35)] border border-white/10 flex items-center gap-2 select-none">
        
        {/* 1. Sauvegarder (Favoris Toggle) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isToggling}
          aria-label={isFavorited ? "Retirer des favoris" : "Sauvegarder"}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full font-satoshi font-bold text-base transition cursor-pointer disabled:opacity-60 shrink-0 ${
            isFavorited
              ? "bg-white/20 text-white"
              : "text-white/90 hover:text-white hover:bg-white/10"
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorited ? "text-[#EB490B] fill-[#EB490B]" : "text-white"
            }`}
          />
          <span className="hidden sm:inline">{isFavorited ? "Enregistré" : "Sauvegarder"}</span>
        </button>

        {/* 2. Planifier mon trajet (CTA Principal Orange Névé) */}
        <button
          type="button"
          onClick={handleOpenAppOrQr}
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-satoshi font-bold text-base bg-[#EB490B] hover:bg-[#C3350B] text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
        >
          Planifier mon trajet
        </button>

        {/* 3. Envoyer sur mon téléphone (Affiché sur grand écran / Desktop) */}
        <button
          type="button"
          onClick={handleOpenAppOrQr}
          className="hidden md:block px-5 py-3 rounded-full font-satoshi font-bold text-base text-white/90 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 whitespace-nowrap"
        >
          Envoyer sur mon téléphone
        </button>

      </div>

      {/* Mobile BottomSheet Modal */}
      {isMobileBottomSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-[#1C1914]/60 backdrop-blur-xs animate-[backdrop-in_0.25s_ease-out]"
          onClick={() => setIsMobileBottomSheetOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-[#FAF8F5] rounded-t-3xl p-6 pb-8 shadow-[0px_-8px_32px_rgba(0,0,0,0.2)] animate-[bottomsheet-in_0.35s_cubic-bezier(0.16,1,0.3,1)] space-y-5 border-t border-[#D6D0C2]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Slide Indicator Bar */}
            <div className="w-12 h-1.5 bg-[#D6D0C2] rounded-full mx-auto" />

            {/* Header & Logo */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200">
                <svg viewBox="0 0 128 128" className="w-12 h-12" fill="none">
                  <path
                    d="M58.4294 28.9513C59.9837 27.9557 61.8719 27.6281 63.6693 28.0422L63.6699 28.0424C64.6954 28.2764 65.6944 28.8272 66.6566 29.5043C67.62 30.1823 68.5228 30.9691 69.3728 31.67L69.3729 31.6701C76.0379 37.165 81.3379 44.1001 85.5424 51.6618L85.543 51.6628C86.5592 53.4725 87.4863 55.3309 88.3213 57.2314L88.3219 57.2328C88.5701 57.7894 88.8082 58.4058 89.0876 58.9803C89.18 59.1706 89.2458 59.3738 89.3318 59.6091C89.4114 59.8269 89.5061 60.0643 89.6495 60.2824C89.7995 60.6249 89.9394 60.9881 90.0562 61.3421V61.3422C90.7526 63.4502 91.5411 65.5559 92.1324 67.6704L92.1326 67.671L92.1328 67.6716C92.8346 70.1413 93.3583 72.6534 93.7018 75.1885L93.7021 75.1914L93.7022 75.1917C93.7022 75.192 93.7023 75.1926 93.7024 75.1934C93.7027 75.195 93.703 75.1975 93.7035 75.2008C93.7044 75.2076 93.7059 75.2179 93.7077 75.2316C93.7115 75.259 93.717 75.3002 93.7239 75.3546C93.7377 75.4633 93.757 75.6245 93.779 75.8329C93.8231 76.2497 93.8778 76.8551 93.9202 77.6066C94.0051 79.1101 94.0404 81.1959 93.8424 83.525C93.8293 83.679 93.9432 83.8145 94.0968 83.8276C94.2504 83.8408 94.3855 83.7266 94.3986 83.5725C94.5994 81.2109 94.5636 79.0977 94.4776 77.5749C94.4346 76.8133 94.3791 76.1987 94.3342 75.7738C94.3117 75.5614 94.2919 75.3963 94.2777 75.2839C94.2761 75.2717 94.2745 75.2601 94.2731 75.2491C94.3212 75.2005 94.3872 75.1344 94.4697 75.0534C94.6587 74.8679 94.9342 74.6045 95.278 74.2945C95.9664 73.6738 96.9261 72.8688 98.0149 72.1275C99.1056 71.3849 100.314 70.7142 101.501 70.352C102.689 69.9896 103.825 69.9447 104.798 70.4085C105.75 70.8619 106.436 71.7478 106.923 72.8656C107.411 73.9823 107.688 75.3031 107.838 76.5783C107.988 77.8513 108.011 79.0656 107.996 79.9629C107.988 80.4111 107.972 80.7792 107.956 81.0348C107.951 81.1355 107.945 81.2187 107.94 81.2824C107.881 81.3144 107.802 81.3567 107.706 81.4081C107.468 81.535 107.121 81.7178 106.687 81.9404C105.817 82.3858 104.597 82.9905 103.194 83.628C100.382 84.9057 96.8588 86.3042 93.9591 86.8242C91.708 87.2279 89.1522 87.4584 86.9728 87.5057C85.8832 87.5294 84.8918 87.5072 84.0825 87.4389C83.2633 87.3698 82.6609 87.2557 82.3287 87.1107C81.6658 86.8215 81.1365 86.2148 80.7598 85.1723C80.3933 84.1578 80.1811 82.7548 80.1299 80.8986L80.1255 80.7176C80.0585 74.6315 79.2791 70.3386 77.8989 66.5039C76.5211 62.6757 74.5473 59.3143 72.1174 55.1035C71.5645 54.1457 70.9412 53.2529 70.3195 52.3746C69.6956 51.4934 69.0743 50.6284 68.512 49.7121L68.3429 49.4365L68.0954 49.644C68.009 49.7164 67.9452 49.7633 67.8868 49.8081C67.8331 49.8492 67.7676 49.9001 67.7134 49.968C67.5971 50.1134 67.5681 50.2935 67.5341 50.5202C67.3801 51.5459 67.1962 52.6205 66.9814 53.6315C66.463 55.9678 65.8351 58.2783 65.0996 60.5555L65.0996 60.5557C64.5317 62.3181 63.7678 64.0981 63.0265 65.8132C59.4575 74.0727 53.0543 81.9087 44.4925 85.1569L44.3431 85.2116C42.7981 85.7726 41.2049 86.1917 39.5837 86.4645L39.5827 86.4646L39.5818 86.4648C36.9123 86.933 35.1117 86.9838 32.4178 86.7423L32.4172 86.7422L32.4165 86.7422L32.2169 86.7246C32.0173 86.7064 31.818 86.6863 31.6189 86.6643C29.5932 86.4404 27.5933 86.0201 25.6474 85.4091C24.6525 85.0903 23.7323 84.7142 22.7045 84.3379C22.5597 84.2848 22.3994 84.3596 22.3465 84.5048C22.2937 84.65 22.3682 84.8107 22.513 84.8637C23.5153 85.2307 24.469 85.6192 25.4775 85.9424L25.4784 85.9426L25.4791 85.9429C27.4141 86.5506 29.4017 86.9728 31.4149 87.2045C31.4475 87.2636 31.4911 87.3433 31.5434 87.4418C31.6674 87.675 31.841 88.0131 32.0384 88.4301C32.4338 89.2651 32.9229 90.4129 33.3014 91.6689C33.6805 92.9273 33.9443 94.2801 33.8998 95.5292C33.8554 96.7763 33.5051 97.8971 32.68 98.729C32.0093 99.4053 30.9986 99.7966 29.8199 99.9875C28.6452 100.178 27.3361 100.163 26.1053 100.057C24.8763 99.9503 23.7357 99.7526 22.9017 99.5813C22.4851 99.4957 22.1456 99.4168 21.9108 99.3594C21.8328 99.3404 21.7664 99.3236 21.7126 99.3098C21.705 99.2727 21.6963 99.2295 21.6866 99.1804C21.6474 98.9831 21.591 98.6899 21.5222 98.3076C21.3847 97.5429 21.1978 96.4219 21.0012 94.9993C20.6078 92.154 20.1752 88.1032 20.0192 83.2849C19.8639 78.4874 20.6722 75.3121 21.6956 73.3834C22.2074 72.4188 22.7694 71.7727 23.285 71.3874C23.8061 70.998 24.254 70.8922 24.5537 70.9455C25.343 71.0859 26.0449 71.2917 26.5499 71.4626C26.8021 71.5479 27.0044 71.6244 27.143 71.6792C27.2123 71.7066 27.2657 71.7285 27.3013 71.7435C27.3191 71.751 27.3325 71.7567 27.3412 71.7605C27.3456 71.7624 27.3488 71.7637 27.3509 71.7646C27.3519 71.765 27.3526 71.7654 27.3531 71.7656L27.3534 71.7658L27.3549 71.7664L27.3565 71.767C28.4869 72.2507 29.6582 72.6323 30.8564 72.9073L30.8585 72.9078C34.4925 73.7112 39.0928 73.6401 42.3421 71.4369C46.9131 68.3377 49.9042 63.6689 51.8769 58.5111C53.8494 53.3537 54.8105 47.6899 55.3109 42.5749C55.4596 41.051 55.4513 39.3715 55.5438 37.8672L55.5444 37.8583V37.8493C55.5405 36.0653 55.4203 34.3787 55.7296 32.8451C56.0332 31.3394 56.7496 30.0044 58.4271 28.9528L58.4283 28.9521L58.4294 28.9513Z"
                    fill="#FA6415"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bricolage font-bold text-xl text-[#1C1914]">
                  Planifier dans l&apos;application Névé
                </h3>
                <p className="font-satoshi font-medium text-sm text-[#575246] mt-0.5">
                  Guidage GPS hors-ligne, horaires et correspondances SNCF en temps réel.
                </p>
              </div>
            </div>

            {/* Action Buttons with Micro-interactions */}
            <div className="space-y-3 pt-1">
              <a
                href={`neve://rando/${hike.id}`}
                onClick={() => setIsMobileBottomSheetOpen(false)}
                className="group w-full py-3.5 px-5 rounded-2xl bg-[#EB490B] hover:bg-[#C3350B] text-white font-satoshi font-bold text-base flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <Smartphone className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3" />
                <span>Ouvrir dans l&apos;application</span>
              </a>

              <a
                href={
                  typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? "https://apps.apple.com/app/id6742337775"
                    : "https://play.google.com/store/apps/details?id=com.neve.app"
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileBottomSheetOpen(false)}
                className="group w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-gray-50 text-[#1C1914] font-satoshi font-bold text-base flex items-center justify-center gap-2 border border-[#D6D0C2] hover:border-[#EB490B]/40 hover:shadow-xs transition-all duration-200 active:scale-[0.98]"
              >
                <Download className="w-5 h-5 text-[#575246] transition-transform duration-200 group-hover:translate-y-0.5" />
                <span>Télécharger l&apos;application Névé</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileBottomSheetOpen(false)}
              className="w-full text-center font-satoshi font-medium text-sm text-[#7A7363] pt-1 hover:text-[#1C1914] transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 7. Desktop QR Code Modal */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1914]/60 backdrop-blur-xs animate-[backdrop-in_0.25s_ease-out]"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-[#D6D0C2]/60 animate-[modal-pop_0.3s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              aria-label="Fermer"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#575246] hover:text-[#1C1914] hover:rotate-90 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1C1914] flex items-center justify-center p-3 shadow-md transition-transform hover:scale-105 duration-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Névé Logo" className="w-full h-full object-contain filter invert" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h3 className="font-bricolage font-bold text-2xl text-[#1C1914]">
                Ouvrir cette rando sur votre téléphone
              </h3>
              <p className="font-satoshi font-medium text-base text-[#575246] max-w-xs mx-auto leading-relaxed">
                Scannez ce QR code avec votre smartphone pour planifier vos trains et lancer le guidage GPS sur Névé.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="mx-auto inline-block p-4 rounded-2xl bg-white shadow-sm border border-[#EAE6DC] transition-transform hover:scale-[1.02] duration-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `https://neve-rando.fr/rando/${hike.id}`
                )}&color=1c1914&bgcolor=ffffff&margin=1`}
                alt="QR Code pour ouvrir la randonnée sur smartphone"
                className="w-52 h-52 mx-auto"
              />
            </div>

            {/* Store Badges & Copy Link Button */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://apps.apple.com/app/id6742337775"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:opacity-90 hover:scale-105 active:scale-95 duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/app-apple-fr-FR.d5bac4a9.svg" alt="App Store" className="h-10 w-auto" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.neve.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:opacity-90 hover:scale-105 active:scale-95 duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/app-google-fr-FR.922a8286.svg" alt="Google Play" className="h-10 w-auto" />
                </a>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-gray-50 border border-[#EAE6DC] hover:border-[#EB490B]/40 text-base font-bold text-[#1C1914] flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-200" />
                    <span className="text-emerald-700">Lien copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#575246]" />
                    <span>Copier le lien direct</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
