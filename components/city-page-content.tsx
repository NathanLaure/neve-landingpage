"use client";

import { useState, useEffect, useRef } from "react";
import CustomLink from "./ui/link";
import { useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import EscapeCity from "@/components/escape-city";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export type Hike = {
  name: string;
  distance: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  transit: string;
  description: string;
  scenery: string;
  elevation: string;
  svgPath: string;
  co2Saved: string;
  destinationStation: string;
  lat: number;
  lng: number;
};

type Props = {
  cityName: string;
  hikes: Hike[];
};

// Map scenery to beautiful Unsplash images for outdoor aesthetics
const SCENERY_IMAGES: Record<string, string> = {
  Forêt: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80", // beautiful dense sunlit pine forest
  Lac: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80", // mountain lake reflection
  Mer: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80", // calanques/sea view
  Sommet: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", // high peak mountains
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80";

const MAP_STYLES = [
  { id: "outdoors", label: "Par défaut", url: "mapbox://styles/mapbox/outdoors-v12", img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "satellite", label: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "streets", label: "OpenStreet", url: "mapbox://styles/mapbox/streets-v12", img: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "dark", label: "Sombre", url: "mapbox://styles/mapbox/dark-v11", img: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=120&h=120&q=80" },
];

export default function CityPageContent({ cityName, hikes }: Props) {
  const searchParams = useSearchParams();
  const hikeQuery = searchParams.get("hike");

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedScenery, setSelectedScenery] = useState<string>("All");
  const [activeHikeName, setActiveHikeName] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState<boolean>(false);
  const [isListCollapsed, setIsListCollapsed] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [mapStyle, setMapStyle] = useState<string>("mapbox://styles/mapbox/outdoors-v12");
  const [showStyleDropdown, setShowStyleDropdown] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Filtering Logic
  const filteredHikes = hikes.filter((hike) => {
    const diffMatch = selectedDifficulty === "All" || hike.difficulty === selectedDifficulty;
    const scenMatch = selectedScenery === "All" || hike.scenery === selectedScenery;
    return diffMatch && scenMatch;
  });

  // Handle scroll and initial active hike from search params
  useEffect(() => {
    if (hikeQuery) {
      const decodedHike = decodeURIComponent(hikeQuery);
      const matched = hikes.find(h => h.name.toLowerCase() === decodedHike.toLowerCase());
      if (matched) {
        setActiveHikeName(matched.name);
        setIsListCollapsed(false); // Make sure it's expanded to see it
        setTimeout(() => {
          const element = document.getElementById(`hike-${matched.name.replace(/\s+/g, "-")}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    }
  }, [hikeQuery, hikes]);

  // Toggle Favorite Handler
  const toggleFavorite = (hikeName: string) => {
    setFavorites(prev => ({
      ...prev,
      [hikeName]: !prev[hikeName]
    }));
  };

  // 1. Initialize Mapbox map with custom control integration
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    const validHikes = hikes.filter(h => h.lat && h.lng);
    const centerCoords: [number, number] = validHikes.length > 0 
      ? [validHikes[0].lng, validHikes[0].lat] 
      : [2.3522, 48.8566];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: centerCoords,
      zoom: 10,
    });

    mapRef.current = map;
    
    // Add only ScaleControl to the bottom-right
    map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

    return () => {
      map.remove();
    };
  }, [mapboxToken]);

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

  // 2. Sync Map Markers when filteredHikes changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const validHikes = filteredHikes.filter(h => h.lat && h.lng);
    if (validHikes.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    validHikes.forEach(hike => {
      // Create HTML element for custom marker
      const el = document.createElement("div");
      el.className = "flex items-center justify-center w-9 h-9 bg-brand-light rounded-full border-2 border-brand-orange shadow-md transition-transform duration-150 hover:scale-110 cursor-pointer";
      
      const emojiSpan = document.createElement("span");
      emojiSpan.style.fontSize = "16px";
      emojiSpan.innerText = hike.scenery === "Sommet" ? "🏔️" : hike.scenery === "Lac" || hike.scenery === "Mer" ? "🌊" : "🌲";
      el.appendChild(emojiSpan);

      // Create Mapbox popup
      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="font-family: var(--font-bricolage, sans-serif); padding: 4px; max-width: 180px;">
          <div style="font-weight: 800; font-size: 12px; margin-bottom: 2px; color: #0f172a;">${hike.name}</div>
          <div style="font-size: 10px; color: #ff6b35; font-weight: 700; margin-bottom: 4px;">📐 ${hike.distance} • ⏱️ ${hike.duration}</div>
          <div style="font-size: 9px; color: #475569; line-height: 1.3;">D+ : ${hike.elevation} • ${hike.difficulty}</div>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([hike.lng, hike.lat])
        .setPopup(popup)
        .addTo(map);

      // Interactive behaviors
      el.addEventListener("mouseenter", () => {
        el.style.borderColor = "var(--color-brand-green)";
        el.style.transform = "scale(1.15)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.borderColor = "var(--color-brand-orange)";
        el.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => {
        setActiveHikeName(hike.name);
        setIsListCollapsed(false); // Expand if collapsed
        // Scroll to card
        const cardElement = document.getElementById(`hike-${hike.name.replace(/\s+/g, "-")}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      markersRef.current[hike.name] = marker;
      bounds.extend([hike.lng, hike.lat]);
    });

    // Auto fit map bounds with padding
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 12,
      duration: 1000
    });
  }, [filteredHikes, mapboxToken]);

  // 3. React to Active Hike changes (Fly to location & Open popup)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken || !activeHikeName) return;

    const activeHike = filteredHikes.find(h => h.name === activeHikeName);
    if (activeHike) {
      map.flyTo({
        center: [activeHike.lng, activeHike.lat],
        zoom: 11.5,
        essential: true,
        duration: 800
      });

      const marker = markersRef.current[activeHike.name];
      if (marker) {
        // Close other popups first
        Object.values(markersRef.current).forEach(m => {
          const p = m.getPopup();
          if (m !== marker && p && p.isOpen()) {
            m.togglePopup();
          }
        });
        const activePopup = marker.getPopup();
        if (activePopup && !activePopup.isOpen()) {
          marker.togglePopup();
        }
      }
    }
  }, [activeHikeName, mapboxToken]);

  // Render Filters Shared Sub-component
  const RenderFilters = ({ inline }: { inline?: boolean }) => (
    <div className={inline ? "grid gap-3 grid-cols-2" : "flex items-center gap-4 text-xs font-semibold"}>
      {/* Scenery Filter */}
      <div className={`flex items-center gap-2 ${inline ? "" : "border-r border-brand-dark/10 pr-4"}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">Paysage:</span>
        <div className="flex gap-1">
          {["All", "Forêt", "Lac", "Sommet"].map((scenery) => (
            <button
              key={scenery}
              onClick={() => setSelectedScenery(scenery)}
              className={`px-2.5 py-1 rounded-md md:rounded-full text-[10px] md:text-xs font-bold transition cursor-pointer ${
                selectedScenery === scenery
                  ? "bg-brand-orange text-brand-light shadow-2xs"
                  : "bg-brand-light border border-brand-dark/10 text-brand-dark/70 hover:bg-brand-dark/5"
              }`}
            >
              {scenery === "All" ? "Tous" : scenery}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">Difficulté:</span>
        <div className="flex gap-1">
          {["All", "Facile", "Moyen", "Difficile"].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-2.5 py-1 rounded-md md:rounded-full text-[10px] md:text-xs font-bold transition cursor-pointer ${
                selectedDifficulty === level
                  ? "bg-brand-orange text-brand-light shadow-2xs"
                  : "bg-brand-light border border-brand-dark/10 text-brand-dark/70 hover:bg-brand-dark/5"
              }`}
            >
              {level === "All" ? "Tous" : level}
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
              <CustomLink href="/randos-sans-voiture" className="hover:text-brand-orange transition">
                Randos sans voiture
              </CustomLink>
              <span className="text-brand-dark/20">/</span>
              <span className="text-brand-dark/80 font-bold">Départs de {cityName}</span>
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
                <span>🔍</span> Planificateur express
              </h2>
              <RenderFilters inline />
            </div>
          </div>

          {/* Scrollable list content */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-4 sm:p-5 lg:p-6 pt-2 space-y-6">
            {/* Hike Cards Stacked Layout (Screenshot Inspired) */}
            <div className="flex flex-col gap-6">
              {filteredHikes.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-brand-dark/10 rounded-2xl bg-neve-gray/30">
                  <p className="text-brand-dark/50 font-bold mb-2 text-xs">Aucun sentier ne correspond</p>
                  <button
                    onClick={() => {
                      setSelectedDifficulty("All");
                      setSelectedScenery("All");
                    }}
                    className="text-brand-orange font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredHikes.map((hike, index) => {
                    const imageSrc = SCENERY_IMAGES[hike.scenery] || DEFAULT_IMAGE;
                    const isFavorited = !!favorites[hike.name];

                    return (
                      <div
                        key={index}
                        id={`hike-${hike.name.replace(/\s+/g, "-")}`}
                        onMouseEnter={() => setActiveHikeName(hike.name)}
                        className={`group transition duration-200 ease-in-out flex flex-col cursor-pointer border border-transparent p-2 rounded-3xl ${
                          activeHikeName === hike.name ? "bg-brand-dark/[0.04]" : ""
                        }`}
                      >
                        {/* Image container */}
                        <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden mb-3 shadow-sm bg-brand-dark/5">
                          <img
                            src={imageSrc}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            alt={hike.name}
                          />
                          
                          {/* Soft overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                          {/* Favorite button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(hike.name);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-light/90 hover:bg-brand-light backdrop-blur-xs shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
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

                          {/* Interactive Left/Right Carousel Controls (Simulated on Hover) */}
                          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-brand-light/95 shadow-md flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-brand-light/95 shadow-md flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </button>
                          </div>

                          {/* Pagination Dots */}
                          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-light shadow-xs" />
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-light/65 shadow-xs" />
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-light/40 shadow-xs" />
                          </div>

                          {/* Landscape Type overlay */}
                          <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-brand-orange text-brand-light shadow-md">
                            🏞️ {hike.scenery}
                          </span>
                        </div>

                        {/* Card Details (Screenshot inspired details structure) */}
                        <div className="px-1.5 pb-1">
                          <h3 className="text-base font-extrabold text-brand-dark font-bricolage leading-snug group-hover:text-brand-orange transition">
                            {hike.name}
                          </h3>
                          <div className="text-[11px] text-brand-dark/50 font-bold mt-0.5">
                            Départ : Gare de {cityName} • {hike.destinationStation}
                          </div>
                          
                          {/* Rating, Difficulty, Distance, Duration details line */}
                          <div className="flex items-center gap-1 text-[11px] text-brand-dark/70 mt-2 font-semibold flex-wrap">
                            <span className="text-brand-orange font-black">★ 4.7</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span className={`font-black ${
                              hike.difficulty === "Facile"
                                ? "text-emerald-600"
                                : hike.difficulty === "Moyen"
                                ? "text-brand-orange-hover"
                                : "text-rose-600"
                            }`}>{hike.difficulty}</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span>{hike.distance}</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span>{hike.duration}</span>
                            <span className="text-brand-dark/20 font-light">•</span>
                            <span className="text-brand-green font-bold">🌱 -{hike.co2Saved}kg CO2</span>
                          </div>

                          {/* Transit Box */}
                          <div className="bg-neve-gray border border-brand-dark/5 rounded-xl p-3 mt-3">
                            <div className="text-[8px] font-bold uppercase tracking-wider text-brand-orange mb-0.5">
                              🚃 Accès Train/TER
                            </div>
                            <p className="text-[10px] font-bold text-brand-dark/85 leading-snug">
                              {hike.transit}
                            </p>
                          </div>

                          {/* Booking Link */}
                          <div className="mt-3">
                            <a
                              href={`https://www.trainline.fr/search/${cityName.toLowerCase()}/${hike.destinationStation.toLowerCase()}?utm_source=neve&utm_medium=affiliate`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-light text-[11px] font-bold shadow-2xs transition duration-150 cursor-pointer"
                            >
                              Réserver sur Trainline
                            </a>
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
              <EscapeCity cityName={cityName} layout="narrow" />
            </div>

            {/* Local FAQ Section for that city */}
            <div className="border-t border-brand-dark/5 pt-6">
              <h3 className="text-sm font-bold text-brand-dark mb-3 font-bricolage">
                Randonner sans voiture depuis {cityName}
              </h3>
              <div className="space-y-3 text-[10px] text-brand-dark/70">
                <div className="bg-neve-gray p-3.5 rounded-xl border border-brand-dark/5">
                  <h4 className="font-bold text-brand-dark mb-1">⏱️ Quel est le temps d'accès en TER ?</h4>
                  <p className="leading-relaxed">
                    La plupart de nos sentiers débutent à moins de 1h30 de train régional (TER). La gare d'arrivée donne un accès direct à pied ou via navette au début du sentier.
                  </p>
                </div>
                <div className="bg-neve-gray p-3.5 rounded-xl border border-brand-dark/5">
                  <h4 className="font-bold text-brand-dark mb-1">🎒 Comment fonctionne la planification ?</h4>
                  <p className="leading-relaxed">
                    Sélectionnez votre itinéraire, réservez vos billets TER sur Trainline et activez la "Sécurité Retour" sur l'app mobile pour marcher sans stress d'horaires.
                  </p>
                </div>
              </div>
            </div>

            {/* Carbon Impact Comparison block */}
            <div className="border-t border-brand-dark/5 pt-6">
              <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-4">
                <h3 className="text-xs font-bold text-brand-green mb-1.5 flex items-center gap-1.5 font-bricolage">
                  <span>🌱</span> Impact Climat
                </h3>
                <p className="text-[10px] text-brand-green/80 leading-relaxed mb-3">
                  Le train régional (TER) émet environ <strong>2,4 g de CO2</strong> par passager par kilomètre, contre <strong>190 g de CO2/km</strong> pour une voiture thermique.
                </p>
                <div className="grid gap-2 grid-cols-2 text-center text-[10px]">
                  <div className="bg-brand-light/80 rounded-lg p-2.5 border border-brand-green/10">
                     <div className="text-brand-dark/50 font-bold">Voiture</div>
                     <div className="text-sm font-black text-rose-600 mt-0.5">190g <span className="text-[8px] font-normal">CO2 / km</span></div>
                  </div>
                  <div className="bg-brand-light/80 rounded-lg p-2.5 border border-brand-green/10">
                     <div className="text-brand-dark/50 font-bold">TER</div>
                     <div className="text-sm font-black text-brand-green mt-0.5">2,4g <span className="text-[8px] font-normal">CO2 / km</span></div>
                  </div>
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
    </div>
  );
}
