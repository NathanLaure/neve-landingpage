"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CustomLink from "./ui/link";
import { useSearchParams, useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
import EscapeCity from "@/components/escape-city";
import HikeDetailPanel from "@/components/hike-detail-panel";
import type { HikeDifficulty, HikeSummary } from "@/types/hike";
import { formatDifficultyColor, formatDifficultyLabel, formatDistance, formatDuration, formatElevation } from "@/lib/format-hike";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type Props = {
  /** Optional place name when arriving centered on a location (e.g. from a city page's "Voir sur la carte" link). */
  areaName?: string;
  hikes: HikeSummary[];
  fetchError?: string | null;
  /** Map center used before bounds auto-fit to the markers (or when there are no hikes at all). */
  centerLat: number;
  centerLng: number;
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80";

const DIFFICULTY_OPTIONS: (HikeDifficulty | "All")[] = ["All", "facile", "modere", "difficile"];

// Beyond this zoom, supercluster stops grouping pins and returns individual points.
const CLUSTER_MAX_ZOOM = 13;

type HikePointProps = { hikeId: string };

const MAP_STYLES = [
  { id: "outdoors", label: "Par défaut", url: "mapbox://styles/mapbox/outdoors-v12", img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "satellite", label: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "streets", label: "OpenStreet", url: "mapbox://styles/mapbox/streets-v12", img: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "dark", label: "Sombre", url: "mapbox://styles/mapbox/dark-v11", img: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=120&h=120&q=80" },
];

export default function ExplorerMapView({ areaName, hikes, fetchError = null, centerLat, centerLng }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hikeQuery = searchParams.get("hike");
  const { user, openAuthModal } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();

  const [selectedDifficulty, setSelectedDifficulty] = useState<HikeDifficulty | "All">("All");
  const [activeHikeId, setActiveHikeId] = useState<string | null>(null);
  const [detailHikeId, setDetailHikeId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState<boolean>(false);
  const [isListCollapsed, setIsListCollapsed] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<string>("mapbox://styles/mapbox/outdoors-v12");
  const [showStyleDropdown, setShowStyleDropdown] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const superclusterRef = useRef<Supercluster<HikePointProps> | null>(null);
  const hikesByIdRef = useRef<Map<string, HikeSummary>>(new Map());
  // Set when a hike is still inside a cluster: renderMarkers() opens its popup
  // once the deep-enough flyTo breaks it out into an individual pin.
  const pendingPopupHikeIdRef = useRef<string | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Filtering Logic
  const filteredHikes = hikes.filter((hike) => {
    if (selectedDifficulty === "All") return true;
    if (selectedDifficulty === "difficile") {
      return hike.difficulty === "difficile" || hike.difficulty === "expert";
    }
    return hike.difficulty === selectedDifficulty;
  });

  const detailHike = detailHikeId ? hikes.find((h) => h.id === detailHikeId) : undefined;

  // Handle scroll and initial active hike from search params
  useEffect(() => {
    if (hikeQuery) {
      const matched = hikes.find((h) => h.id === hikeQuery);
      if (matched) {
        setActiveHikeId(matched.id);
        setIsListCollapsed(false); // Make sure it's expanded to see it
        setTimeout(() => {
          const element = document.getElementById(`hike-${matched.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    }
  }, [hikeQuery, hikes]);

  // Toggle Favorite Handler — anonymous visitors are prompted with the auth modal.
  const handleFavoriteClick = (hikeId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    toggleFavorite(hikeId);
  };

  // Renders whatever the supercluster index says belongs in the current viewport:
  // cluster badges (grouped pins) or individual hike pins. Called on every
  // "moveend" (pan/zoom) and whenever the hikes list / difficulty filter changes.
  // Stable identity (empty deps) — everything it needs comes from refs, so it's
  // safe to use directly as a mapbox event listener without going stale.
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const index = superclusterRef.current;
    if (!map || !index) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = map.getBounds();
    if (!bounds) return;
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = Math.round(map.getZoom());

    index.getClusters(bbox, zoom).forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if ("cluster" in props && props.cluster) {
        const count = props.point_count as number;
        const clusterId = props.cluster_id as number;
        const size = count < 10 ? 38 : count < 50 ? 46 : count < 150 ? 54 : 62;

        // Root element: mapbox owns its `transform` for positioning. All visual
        // hover/scale styling goes on this `inner` child instead, so it never
        // clobbers mapbox's translate() and makes the pin "disappear".
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        const inner = document.createElement("div");
        inner.style.width = `${size}px`;
        inner.style.height = `${size}px`;
        inner.style.fontSize = count < 100 ? "13px" : "12px";
        inner.className =
          "flex items-center justify-center rounded-full bg-brand-orange text-brand-light font-black shadow-lg border-2 border-brand-light transition-transform duration-150";
        inner.textContent = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);
        el.appendChild(inner);

        el.addEventListener("mouseenter", () => { inner.style.transform = "scale(1.1)"; });
        el.addEventListener("mouseleave", () => { inner.style.transform = "scale(1)"; });
        el.addEventListener("click", () => {
          const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), CLUSTER_MAX_ZOOM + 2);
          map.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
        });

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
        markersRef.current[`cluster-${clusterId}`] = marker;
        return;
      }

      const hike = hikesByIdRef.current.get((props as HikePointProps).hikeId);
      if (!hike) return;

      const el = document.createElement("div");
      el.className = "cursor-pointer";
      const inner = document.createElement("div");
      inner.className =
        "flex items-center justify-center w-8 h-8 bg-[#EB490B] rounded-full border-2 border-white shadow-[0px_3px_10px_rgba(0,0,0,0.25)] transition-transform duration-150";
      inner.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      `;
      el.appendChild(inner);

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="font-family: var(--font-bricolage, sans-serif); padding: 4px; max-width: 180px;">
          <div style="font-weight: 800; font-size: 12px; margin-bottom: 2px; color: #0f172a;">${hike.title}</div>
          <div style="font-size: 10px; color: #ff6b35; font-weight: 700; margin-bottom: 4px;">📐 ${formatDistance(hike.distance_km)} • ⏱️ ${formatDuration(hike.duration_minutes)}</div>
          <div style="font-size: 9px; color: #475569; line-height: 1.3;">D+ : ${formatElevation(hike.elevation_gain_m)} • ${formatDifficultyLabel(hike.difficulty)}</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(popup).addTo(map);

      el.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => {
        setActiveHikeId(hike.id);
        setIsListCollapsed(false);
        const cardElement = document.getElementById(`hike-${hike.id}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      markersRef.current[hike.id] = marker;

      if (pendingPopupHikeIdRef.current === hike.id) {
        pendingPopupHikeIdRef.current = null;
        marker.togglePopup();
      }
    });
  }, []);

  // 1. Initialize Mapbox map with custom control integration
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    const validHikes = hikes.filter(h => h.start_lat && h.start_lng);
    const centerCoords: [number, number] = validHikes.length > 0
      ? [validHikes[0].start_lng, validHikes[0].start_lat]
      : [centerLng, centerLat];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: centerCoords,
      zoom: 10,
    });

    mapRef.current = map;
    map.on("moveend", renderMarkers);

    // Add only ScaleControl to the bottom-right
    map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

    return () => {
      map.off("moveend", renderMarkers);
      map.remove();
    };
  }, [mapboxToken, renderMarkers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setShowStyleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update map style dynamically
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  const handleCustomGeolocate = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 13,
          essential: true,
          duration: 1000
        });

        // Add a pulsing custom user location marker
        const map = mapRef.current;
        if (map) {
          const el = document.createElement("div");
          el.className = "w-5 h-5 bg-brand-orange rounded-full border-2 border-brand-light shadow-md animate-ping absolute";

          const core = document.createElement("div");
          core.className = "w-3 h-3 bg-brand-orange rounded-full border border-brand-light shadow-xs absolute top-1 left-1";

          const container = document.createElement("div");
          container.className = "relative w-5 h-5";
          container.appendChild(el);
          container.appendChild(core);

          new mapboxgl.Marker({ element: container })
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .addTo(map);
        }
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Impossible d'accéder à votre position.");
      },
      { enableHighAccuracy: true }
    );
  };

  // 2. Rebuild the cluster index when filteredHikes changes, fit bounds, and re-render.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken) return;

    hikesByIdRef.current = new Map(filteredHikes.map((h) => [h.id, h]));

    const validHikes = filteredHikes.filter((h) => h.start_lat && h.start_lng);
    const points = validHikes.map((hike) => ({
      type: "Feature" as const,
      properties: { hikeId: hike.id },
      geometry: { type: "Point" as const, coordinates: [hike.start_lng, hike.start_lat] },
    }));

    const index = new Supercluster<HikePointProps>({ radius: 60, maxZoom: CLUSTER_MAX_ZOOM });
    index.load(points);
    superclusterRef.current = index;

    if (validHikes.length === 0) {
      renderMarkers();
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    validHikes.forEach((hike) => bounds.extend([hike.start_lng, hike.start_lat]));

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 12,
      duration: 1000
    });

    // fitBounds triggers "moveend" (already wired to renderMarkers), but call it
    // immediately too so pins/clusters show right away instead of after the animation.
    renderMarkers();
  }, [filteredHikes, mapboxToken, renderMarkers]);

  // 3. React to Active Hike changes (Fly to location & Open popup)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken || !activeHikeId) return;

    const activeHike = filteredHikes.find(h => h.id === activeHikeId);
    if (!activeHike) return;

    const existingMarker = markersRef.current[activeHike.id];
    if (existingMarker) {
      // Already an individual pin at the current zoom — just recenter and open its popup.
      map.flyTo({
        center: [activeHike.start_lng, activeHike.start_lat],
        zoom: Math.max(map.getZoom(), 11.5),
        essential: true,
        duration: 800
      });
      Object.values(markersRef.current).forEach(m => {
        const p = m.getPopup();
        if (m !== existingMarker && p && p.isOpen()) {
          m.togglePopup();
        }
      });
      const activePopup = existingMarker.getPopup();
      if (activePopup && !activePopup.isOpen()) {
        existingMarker.togglePopup();
      }
    } else {
      // Still inside a cluster — fly in past CLUSTER_MAX_ZOOM to break it apart,
      // then renderMarkers() (triggered by the flyTo's "moveend") opens the popup.
      pendingPopupHikeIdRef.current = activeHike.id;
      map.flyTo({
        center: [activeHike.start_lng, activeHike.start_lat],
        zoom: CLUSTER_MAX_ZOOM + 1,
        essential: true,
        duration: 800
      });
    }
  }, [activeHikeId, mapboxToken]);

  // Render Filters Shared Sub-component
  const RenderFilters = ({ inline }: { inline?: boolean }) => (
    <div className={inline ? "grid gap-3 grid-cols-1" : "flex items-center gap-4 text-xs font-semibold"}>
      {/* Difficulty Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">Difficulté:</span>
        <div className="flex gap-1 flex-wrap">
          {DIFFICULTY_OPTIONS.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-2.5 py-1 rounded-md md:rounded-full text-[10px] md:text-xs font-bold transition cursor-pointer ${
                selectedDifficulty === level
                  ? "bg-brand-orange text-brand-light shadow-2xs"
                  : "bg-brand-light border border-brand-dark/10 text-brand-dark/70 hover:bg-brand-dark/5"
              }`}
            >
              {level === "All" ? "Tous" : formatDifficultyLabel(level)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-brand-light w-full h-screen overflow-hidden relative text-brand-dark flex flex-col">
      {/* Mobile Toggle List/Map Button */}
      <button
        onClick={() => setShowMapMobile(!showMapMobile)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-dark hover:bg-brand-dark/95 text-brand-light font-bold text-xs px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-brand-light/10 transition active:scale-95 cursor-pointer"
      >
        {showMapMobile ? (
          <>
            <span>📝</span> Afficher la liste
          </>
        ) : (
          <>
            <span>🗺️</span> Afficher la carte
          </>
        )}
      </button>

      {/* Main Full-Screen Map Container */}
      <div className="absolute inset-0 w-full h-full z-0 bg-neve-gray">
        {mapboxToken ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 bg-neve-beige flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-brand-dark/10 rounded-2xl m-4">
            <span className="text-4xl mb-3">🗺️</span>
            <h3 className="font-bold text-brand-dark text-base mb-1 font-bricolage">Carte interactive Mapbox</h3>
            <p className="text-xs text-brand-dark/60 max-w-xs mb-4">
              Pour afficher la carte interactive en temps réel, veuillez configurer votre clé d'accès Mapbox.
            </p>
            <div className="bg-brand-dark/5 text-[11px] font-mono p-3 rounded-lg text-brand-dark/80 text-left w-full border border-brand-dark/5">
              <span className="text-brand-orange"># .env.local</span><br/>
              NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=votre_token_mapbox
            </div>
          </div>
        )}
      </div>

      {/* Floating Map Filters (Desktop & Map Mobile mode) */}
      <div
        className={`z-20 items-center bg-brand-light/95 backdrop-blur-md rounded-2xl md:rounded-full border border-brand-dark/10 shadow-lg p-3 md:h-[48px] absolute transition-all duration-300 ${
          showMapMobile
            ? "flex top-20 left-4 right-[72px] md:top-28 md:left-[456px] lg:left-[488px] md:right-auto md:w-auto"
            : "hidden md:flex top-28 left-[456px] lg:left-[488px]"
        }`}
      >
        <RenderFilters />
      </div>

      {/* Floating Custom Map Controls (Desktop & Map Mobile mode) */}
      <div
        className={`z-20 flex flex-col items-center gap-1.5 bg-brand-light/95 backdrop-blur-md rounded-full border border-brand-dark/10 shadow-lg p-1.5 w-[48px] h-auto absolute transition-all duration-300 ${
          showMapMobile
            ? "top-20 right-4"
            : "hidden md:flex top-28 right-6"
        }`}
      >
        {/* Geolocate Button */}
        <button
          onClick={handleCustomGeolocate}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-light border border-brand-dark/10 hover:bg-neve-gray transition text-brand-dark cursor-pointer shadow-xs"
          title="Ma position"
        >
          <svg className="w-4.5 h-4.5 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </button>

        {/* Zoom In Button */}
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-light border border-brand-dark/10 hover:bg-neve-gray transition text-brand-dark cursor-pointer shadow-xs"
          title="Zoomer"
        >
          <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-light border border-brand-dark/10 hover:bg-neve-gray transition text-brand-dark cursor-pointer shadow-xs"
          title="Dézoomer"
        >
          <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        {/* Map Style selector Button */}
        <div className="relative flex items-center justify-center" ref={styleDropdownRef}>
          <button
            onClick={() => setShowStyleDropdown(!showStyleDropdown)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition cursor-pointer shadow-xs ${
              showStyleDropdown
                ? "bg-brand-orange border-brand-orange text-brand-light"
                : "bg-brand-light border-brand-dark/10 hover:bg-neve-gray text-brand-dark"
            }`}
            title="Fonds de carte"
          >
            <svg className={`w-4.5 h-4.5 ${showStyleDropdown ? "text-brand-light" : "text-brand-dark"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-4.851a2.25 2.25 0 012.092 0L22.25 12M2.25 12l8.954 4.851a2.25 2.25 0 002.092 0L22.25 12M2.25 12V16.5A2.25 2.25 0 004.5 18.75h15A2.25 2.25 0 0021.75 16.5V12M2.25 7.5L12 12.3l9.75-4.8L12 2.7 2.25 7.5z" />
            </svg>
          </button>

          {/* Style Dropdown Menu (Komoot/Strava Style - Compact) */}
          {showStyleDropdown && (
            <div className="absolute right-[56px] top-0 bg-brand-light/95 backdrop-blur-md rounded-[24px] border border-brand-dark/15 shadow-2xl p-4.5 w-[280px] sm:w-[310px] flex flex-col gap-3.5 z-30 animate-fadeIn text-brand-dark select-none">

              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold font-bricolage text-xs text-brand-dark tracking-tight">
                  Personnaliser la carte
                </h3>
                <button
                  onClick={() => setShowStyleDropdown(false)}
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-brand-dark/5 text-brand-dark/50 hover:text-brand-dark transition cursor-pointer"
                  aria-label="Fermer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Section 1: Type de carte */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-dark/40 mb-2">
                  Type de carte
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {MAP_STYLES.map((style) => {
                    const isActive = mapStyle === style.url;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setMapStyle(style.url)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition duration-200 ${
                          isActive
                            ? "border-brand-orange scale-105 shadow-md"
                            : "border-brand-dark/10 group-hover:border-brand-dark/30"
                        }`}>
                          <img src={style.img} alt={style.label} className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-[9px] mt-1 text-center font-bold truncate w-full ${
                          isActive ? "text-brand-orange" : "text-brand-dark/75"
                        }`}>
                          {style.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Left Pane: Floating cards panel with fixed header and scrollable cards */}
      <div
        className={`z-10 absolute left-4 right-4 md:right-auto md:left-6 md:w-[420px] lg:w-[450px] flex flex-col bg-brand-light/95 backdrop-blur-md border border-brand-dark/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          showMapMobile
            ? "hidden md:flex"
            : isListCollapsed
              ? "top-20 h-[48px] md:top-28 md:h-[48px] md:rounded-3xl rounded-2xl"
              : "top-20 h-[calc(100vh-96px)] md:top-28 md:h-[calc(100vh-136px)] md:rounded-3xl rounded-2xl"
        }`}
      >
        {/* A. FIXED HEADER CONTAINER (Always 48px high, handles toggling title and button) */}
        <div className={`flex items-center justify-between px-4 md:px-5 h-[48px] flex-shrink-0 transition-all duration-300 border-brand-dark/5 ${
          isListCollapsed ? "border-b-0" : "border-b"
        }`}>
          <h2 className="font-black font-bricolage text-brand-dark tracking-tight text-sm md:text-base">
            Explorez des itinéraires
          </h2>
          <button
            onClick={() => setIsListCollapsed(!isListCollapsed)}
            className="w-8 h-8 rounded-full border border-brand-dark/10 flex items-center justify-center bg-brand-light hover:bg-neve-gray transition text-brand-dark/65 cursor-pointer shadow-xs"
            aria-label={isListCollapsed ? "Déplier la liste" : "Replier la liste"}
          >
            {isListCollapsed ? (
              <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            )}
          </button>
        </div>

        {/* B. COLLAPSIBLE CONTENTS WRAPPER */}
        <div className={`flex-grow flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isListCollapsed
            ? "opacity-0 pointer-events-none duration-150"
            : "opacity-100 duration-300 delay-100"
        }`}>
          {/* Sub-header inside collapsible content (Breadcrumbs, count, and mobile filters) */}
          <div className="p-4 sm:p-5 lg:p-6 pb-3 border-b border-brand-dark/5 flex-shrink-0">
            {/* Breadcrumb Navigation */}
            <nav className="mb-3.5 text-[10px] text-brand-dark/40 flex items-center gap-1.5" aria-label="Fil d'Ariane">
              <CustomLink href="/" className="hover:text-brand-orange transition">
                Accueil
              </CustomLink>
              <span className="text-brand-dark/20">/</span>
              {areaName ? (
                <>
                  <CustomLink href="/explorer" className="hover:text-brand-orange transition">
                    Explorer
                  </CustomLink>
                  <span className="text-brand-dark/20">/</span>
                  <span className="text-brand-dark/80 font-bold">Autour de {areaName}</span>
                </>
              ) : (
                <span className="text-brand-dark/80 font-bold">Explorer</span>
              )}
            </nav>

            {/* Count and Sort Bar */}
            <div className="flex items-center justify-between text-xs text-brand-dark/60 pb-1 font-semibold">
              <span>{filteredHikes.length} itinéraire{filteredHikes.length > 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-brand-orange transition font-bold">
                <span>⇅</span>
                <span>Tri par Proximité</span>
              </div>
            </div>

            {/* Mobile-only Express Planner filters (in list view) */}
            <div className="md:hidden mt-3 bg-neve-gray border border-brand-dark/5 rounded-xl p-3 shadow-2xs">
              <h2 className="text-[10px] font-bold text-brand-dark mb-2 flex items-center gap-1.5">
                <span>🔍</span> Filtrer
              </h2>
              <RenderFilters inline />
            </div>
          </div>

          {/* Scrollable list content */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-4 sm:p-5 lg:p-6 pt-2 space-y-6">
            {/* Hike Cards Stacked Layout (Screenshot Inspired) */}
            <div className="flex flex-col gap-6">
              {fetchError ? (
                <div className="text-center py-10 border border-dashed border-rose-300 rounded-2xl bg-rose-50">
                  <p className="text-rose-600 font-bold mb-1 text-xs">Impossible de charger les randonnées</p>
                  <p className="text-rose-500/80 text-[11px]">Réessayez dans quelques instants.</p>
                </div>
              ) : hikes.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-brand-dark/10 rounded-2xl bg-neve-gray/30">
                  <p className="text-brand-dark/50 font-bold text-xs">Aucune randonnée à proximité pour le moment</p>
                </div>
              ) : filteredHikes.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-brand-dark/10 rounded-2xl bg-neve-gray/30">
                  <p className="text-brand-dark/50 font-bold mb-2 text-xs">Aucun sentier ne correspond</p>
                  <button
                    onClick={() => setSelectedDifficulty("All")}
                    className="text-brand-orange font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredHikes.map((hike) => {
                    const imageSrc = hike.cover_image_url || DEFAULT_IMAGE;
                    const isFavorited = isFavorite(hike.id);
                    const isTogglingFavorite = isFavoritePending(hike.id);

                    return (
                      <div
                        key={hike.id}
                        id={`hike-${hike.id}`}
                        onMouseEnter={() => setActiveHikeId(hike.id)}
                        onClick={() => setDetailHikeId(hike.id)}
                        className={`group transition duration-200 ease-in-out flex flex-col cursor-pointer border border-transparent p-2 rounded-3xl ${
                          activeHikeId === hike.id ? "bg-brand-dark/[0.04]" : ""
                        }`}
                      >
                        {/* Image container */}
                        <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden mb-3 shadow-sm bg-brand-dark/5">
                          <img
                            src={imageSrc}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            alt={hike.title}
                          />

                          {/* Soft overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                          {/* Favorite button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteClick(hike.id);
                            }}
                            disabled={isTogglingFavorite}
                            aria-pressed={isFavorited}
                            aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-light/90 hover:bg-brand-light backdrop-blur-xs shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                          >
                            <svg
                              className={`w-4.5 h-4.5 stroke-current transition ${
                                isFavorited ? "fill-rose-500 text-rose-500" : "fill-none text-brand-dark"
                              }`}
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>

                          {/* Difficulty overlay */}
                          <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-brand-orange text-brand-light shadow-md">
                            🥾 {formatDifficultyLabel(hike.difficulty)}
                          </span>
                        </div>

                        {/* Card Details */}
                        <div className="px-1.5 pb-1">
                          <h3 className="text-base font-extrabold text-brand-dark font-bricolage leading-snug group-hover:text-brand-orange transition">
                            {hike.title}
                          </h3>
                          <div className="text-[11px] text-brand-dark/50 font-bold mt-0.5 truncate">
                            {hike.location_name}
                          </div>

                          {/* Difficulty, Distance, Duration, Elevation details line */}
                          <div className="flex items-center gap-1 text-[11px] text-brand-dark/70 mt-2 font-semibold flex-wrap">
                            <span className={`font-black ${formatDifficultyColor(hike.difficulty)}`}>
                              {formatDifficultyLabel(hike.difficulty)}
                            </span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span>{formatDistance(hike.distance_km)}</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span>{formatDuration(hike.duration_minutes)}</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span>{formatElevation(hike.elevation_gain_m)}</span>
                          </div>

                          {/* Detail Link */}
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailHikeId(hike.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-light text-[11px] font-bold shadow-2xs transition duration-150 cursor-pointer"
                            >
                              Voir la fiche
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Escape City pain-points testimonials */}
            <div className="border-t border-brand-dark/5 pt-6">
              <EscapeCity cityName={areaName} layout="narrow" />
            </div>

            {/* Local FAQ Section for that area */}
            <div className="border-t border-brand-dark/5 pt-6">
              <h3 className="text-sm font-bold text-brand-dark mb-3 font-bricolage">
                {areaName ? `Randonner autour de ${areaName}` : "Randonner avec Névé"}
              </h3>
              <div className="space-y-3 text-[10px] text-brand-dark/70">
                <div className="bg-neve-gray p-3.5 rounded-xl border border-brand-dark/5">
                  <h4 className="font-bold text-brand-dark mb-1">📍 Comment sont sélectionnés ces itinéraires ?</h4>
                  <p className="leading-relaxed">
                    {areaName
                      ? `Les randonnées affichées sont triées par proximité autour de ${areaName}, avec distance, dénivelé et durée calculés à partir du tracé GPS réel de chaque sentier.`
                      : "Les randonnées affichées sont triées par proximité, avec distance, dénivelé et durée calculés à partir du tracé GPS réel de chaque sentier."}
                  </p>
                </div>
                <div className="bg-neve-gray p-3.5 rounded-xl border border-brand-dark/5">
                  <h4 className="font-bold text-brand-dark mb-1">🎒 Comment accéder au tracé GPS complet ?</h4>
                  <p className="leading-relaxed">
                    Ouvrez la fiche d'une randonnée pour voir sa description complète, puis téléchargez le tracé GPS hors-ligne depuis l'application mobile Névé.
                  </p>
                </div>
              </div>
            </div>

            {/* CRO Conversion Box */}
            <div className="border-t border-brand-dark/5 pt-6">
              <div className="bg-brand-dark rounded-xl p-5 text-center relative overflow-hidden shadow-md">
                <h2 className="text-sm font-bold text-brand-light mb-1.5 font-bricolage">
                  Débloquez le tracé GPS
                </h2>
                <p className="text-[10px] text-brand-light/60 max-w-xs mx-auto mb-4">
                  Téléchargez l'application Névé pour afficher les cartes 100% hors-ligne.
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brand-light hover:bg-neve-gray text-brand-dark shadow-xs transition duration-150 text-[10px] font-bold"
                    href="#download-ios-seo"
                  >
                    Télécharger pour iOS
                  </a>
                  <a
                    className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brand-light hover:bg-neve-gray text-brand-dark shadow-xs transition duration-150 text-[10px] font-bold"
                    href="#download-android-seo"
                  >
                    Télécharger pour Android
                  </a>
                </div>
              </div>
            </div>

            {/* Small In-App Footer */}
            <div className="text-center text-[9px] text-brand-dark/30 mt-4 border-t border-brand-dark/5 pt-4">
              &copy; {new Date().getFullYear()} Névé. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>

      {/* Hike Detail Panel (fetches full row incl. description + geometry on open) */}
      {detailHike && (
        <HikeDetailPanel summary={detailHike} onClose={() => setDetailHikeId(null)} />
      )}
    </div>
  );
}
