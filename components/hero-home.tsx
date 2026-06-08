"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageIllustration from "@/components/page-illustration";
import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar04 from "@/public/images/avatar-04.jpg";
import Avatar05 from "@/public/images/avatar-05.jpg";
import Avatar06 from "@/public/images/avatar-06.jpg";
import { Trees, Mountain, Waves, Compass, MapPin } from "lucide-react";

type Place = {
  name: string;
  city: string;
  type: "foret" | "sommet" | "lac" | "mer" | "plaine";
  typeName: string;
  icon: string;
  lat: number;
  lng: number;
};

const PLACES: Place[] = [
  {
    name: "Les Gorges de Franchard (Fontainebleau)",
    city: "paris",
    type: "foret",
    typeName: "Forêt",
    icon: "🌲",
    lat: 48.4116,
    lng: 2.6288,
  },
  {
    name: "La Vallée de la Chevreuse",
    city: "paris",
    type: "foret",
    typeName: "Forêt",
    icon: "🌲",
    lat: 48.7056,
    lng: 2.0673,
  },
  {
    name: "Les Étangs de Hollande (Rambouillet)",
    city: "paris",
    type: "lac",
    typeName: "Lac",
    icon: "🌊",
    lat: 48.6366,
    lng: 1.8385,
  },
  {
    name: "Le Crêt de la Perdrix (Pilat)",
    city: "lyon",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 45.3712,
    lng: 4.5772,
  },
  {
    name: "Balcon de la Chartreuse (Passage de la Clé)",
    city: "lyon",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 45.2447,
    lng: 5.6297,
  },
  {
    name: "Le Sentier des Monts d'Or",
    city: "lyon",
    type: "foret",
    typeName: "Forêt",
    icon: "🌲",
    lat: 45.8458,
    lng: 4.8116,
  },
  {
    name: "Le Moucherotte (Massif du Vercors)",
    city: "grenoble",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 45.1553,
    lng: 5.6375,
  },
  {
    name: "Le Lac Achard (Belledonne)",
    city: "grenoble",
    type: "lac",
    typeName: "Lac",
    icon: "🌊",
    lat: 45.1114,
    lng: 5.8753,
  },
  {
    name: "La Dent de Crolles (Chartreuse)",
    city: "grenoble",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 45.3125,
    lng: 5.8547,
  },
  {
    name: "Les Calanques de Port-Pin et d'En-Vau",
    city: "marseille",
    type: "mer",
    typeName: "Mer / Calanques",
    icon: "🌊",
    lat: 43.2025,
    lng: 5.5186,
  },
  {
    name: "La Montagne Sainte-Victoire (Prieuré)",
    city: "marseille",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 43.5325,
    lng: 5.6120,
  },
  {
    name: "Le Cap Canaille",
    city: "marseille",
    type: "sommet",
    typeName: "Sommet / Falaise",
    icon: "🏔️",
    lat: 43.1979,
    lng: 5.5539,
  },
  {
    name: "La Dune du Pilat et forêt landaise",
    city: "bordeaux",
    type: "lac",
    typeName: "Dune / Océan",
    icon: "🌊",
    lat: 44.5902,
    lng: -1.2131,
  },
  {
    name: "Le Tour du Lac de Lacanau",
    city: "bordeaux",
    type: "lac",
    typeName: "Lac",
    icon: "🌊",
    lat: 44.9782,
    lng: -1.0805,
  },
  {
    name: "Les Trois Châteaux d'Ottrott",
    city: "strasbourg",
    type: "foret",
    typeName: "Forêt / Château",
    icon: "🌲",
    lat: 48.4608,
    lng: 7.4089,
  },
  {
    name: "Le Mont Sainte-Odile (Sentier des Merveilles)",
    city: "strasbourg",
    type: "sommet",
    typeName: "Sommet",
    icon: "🏔️",
    lat: 48.4375,
    lng: 7.4045,
  },
];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export default function HeroHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation blocked or failed", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPlace = (place: Place) => {
    setSearchQuery(place.name);
    setIsDropdownOpen(false);
    router.push(`/randos-sans-voiture/${place.city}?hike=${encodeURIComponent(place.name)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = PLACES.filter((place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      const topPlace = userCoords
        ? [...filtered].sort((a, b) => {
            const distA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
            const distB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
            return distA - distB;
          })[0]
        : filtered[0];
      handleSelectPlace(topPlace);
    }
  };

  return (
    <section id="about" className="relative overflow-hidden border-b border-gray-100 h-[100vh] flex items-center justify-center">
      {/* Background Image of Hiking Shoes at shoe-level */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
      />
      {/* Semi-translucent overlay to ensure text contrast and match the warm crème theme */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      
      <PageIllustration />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 w-full mb-16 md:mb-50">
        {/* Hero content */}
        <div>
          {/* Section header */}
          <div className="text-center">
            {/* Avatars & Trust proof */}
            <div
              className="mb-6"
              data-aos="zoom-y-out"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="-mx-0.5 flex justify-center -space-x-3">
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar01}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar02}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar03}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar04}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar05}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar06}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                </div>
                <div className="text-xs text-brand-light/80 font-bold tracking-wider">
                  Recommandé par <span className="text-brand-orange font-bold">10 000+</span> randonneurs sans voiture
                </div>
              </div>
            </div>

            {/* Premium Title */}
            <h1
              className="mb-6 text-4xl font-bold text-brand-light md:text-6xl tracking-tight leading-normal"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              <span className="text-brand-orange-light">Explorez</span>, à portée de train.
            </h1>

            {/* Description */}
            <div className="mx-auto max-w-xl">
              <p
                className="mb-12 text-lg text-brand-light/90 leading-relaxed"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Marchez l'esprit libre : planifiez toute votre aventure transport inclus et évadez-vous plus loin, plus souvent.
              </p>

              {/* Interactive Search Bar (AllTrails & Decathlon style) */}
              <div 
                className="mx-auto max-w-xl mb-8 relative"
                data-aos="zoom-y-out"
                data-aos-delay={400}
                ref={dropdownRef}
              >
                <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-brand-light p-3 rounded-full border border-brand-dark/15 shadow-lg transition">
                  <div className="flex items-center pl-3 text-brand-dark/95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher une destination (ex: Fontainebleau, Vercors...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full text-brand-dark placeholder-brand-dark/95 text-base px-4 py-1.5 bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsDropdownOpen(true);
                      }}
                      className="p-1.5 mr-2 text-brand-dark/40 hover:text-brand-dark transition rounded-full hover:bg-brand-dark/5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-brand-light rounded-2xl border border-brand-dark/10 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto no-scrollbar">
                    {(() => {
                      const filtered = PLACES.filter((place) =>
                        place.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      const sorted = userCoords
                        ? [...filtered].sort((a, b) => {
                            const distA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
                            const distB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
                            return distA - distB;
                          })
                        : [...filtered].sort((a, b) => a.name.localeCompare(b.name));

                      if (sorted.length === 0) {
                        return (
                          <div className="px-5 py-4 text-sm text-brand-dark/50 text-center">
                            Aucune destination trouvée
                          </div>
                        );
                      }

                      return (
                        <div>
                          <div className="px-4 py-2 text-sm font-semibold text-brand-dark tracking-wider text-left">
                            {searchQuery ? "Résultats de recherche" : userCoords ? "Destinations les plus proches" : "Destinations proposées"}
                          </div>
                          <div className="divide-y divide-brand-dark/5">
                            {sorted.map((place) => {
                              const distance = userCoords
                                ? getDistance(userCoords.lat, userCoords.lng, place.lat, place.lng)
                                : null;

                              return (
                                <button
                                  key={place.name}
                                  type="button"
                                  onClick={() => handleSelectPlace(place)}
                                  className="flex items-center justify-between w-full px-4 py-3 text-left transition hover:bg-slate-50 cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-neve-gray border border-brand-dark/5 flex items-center justify-center transition">
                                      {place.type === "foret" && <Trees className="w-4 h-4 text-emerald-600" />}
                                      {place.type === "sommet" && <Mountain className="w-4 h-4 text-amber-600" />}
                                      {(place.type === "lac" || place.type === "mer") && <Waves className="w-4 h-4 text-sky-500" />}
                                      {place.type !== "foret" && place.type !== "sommet" && place.type !== "lac" && place.type !== "mer" && <Compass className="w-4 h-4 text-slate-400" />}
                                    </span>
                                    <div>
                                      <span className="font-bold text-brand-dark text-sm block">
                                        {place.name}
                                      </span>
                                      <span className="text-xs text-brand-dark/50 block">
                                        Gare de départ : {place.city.charAt(0).toUpperCase() + place.city.slice(1)} • {place.typeName}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 ml-4">
                                    {distance !== null ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5" /> {distance} km
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-brand-dark/30 bg-brand-dark/5 px-2.5 py-1 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 opacity-60" /> -- km
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
