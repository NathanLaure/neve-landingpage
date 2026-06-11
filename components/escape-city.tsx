"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";

type EscapeCityProps = {
  cityName?: string;
  layout?: "full" | "narrow";
};

const DEFAULT_CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Lille",
  "Bordeaux",
  "Nantes",
  "Strasbourg",
  "Toulouse"
];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function ScrollingCity({ city }: { city: string }) {
  const [displayCity, setDisplayCity] = useState(city);
  const [prevCity, setPrevCity] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [width, setWidth] = useState<number | null>(null);

  const textRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setWidth(rect.width);
    }
  }, [displayCity]);

  useEffect(() => {
    if (city !== displayCity) {
      setPrevCity(displayCity);
      setDisplayCity(city);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevCity(null);
      }, 600); // Matches the 0.6s animation duration in style.css
      return () => clearTimeout(timer);
    }
  }, [city, displayCity]);

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom h-[1.15em] leading-none select-none"
      style={{
        width: width !== null ? `${width}px` : "auto",
        transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* Invisible text spacer to preserve size and measure width */}
      <span ref={textRef} className="invisible inline-block h-[1.15em] leading-none">
        {displayCity}
      </span>
      
      {prevCity && isAnimating && (
        <span className="absolute left-0 top-0 w-full h-full text-left leading-none animate-roll-out whitespace-nowrap">
          {prevCity}
        </span>
      )}
      
      <span
        key={displayCity}
        className={`absolute left-0 top-0 w-full h-full text-left leading-none whitespace-nowrap ${
          isAnimating ? "animate-roll-in" : ""
        }`}
      >
        {displayCity}
      </span>
    </span>
  );
}

export default function EscapeCity({ cityName, layout = "full" }: EscapeCityProps) {
  const [cityIndex, setCityIndex] = useState(0);
  const [isCycling, setIsCycling] = useState(!cityName && layout === "full");
  const [detectedCity, setDetectedCity] = useState<string>("");

  useEffect(() => {
    if (!isCycling) return;

    const interval = setInterval(() => {
      setCityIndex((prevIndex) => (prevIndex + 1) % DEFAULT_CITIES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isCycling]);

  useEffect(() => {
    // Only detect city client-side on the homepage (layout === "full" and no explicit cityName prop)
    if (layout === "full" && !cityName) {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              let city = "";
              // Try BigDataCloud reverse geocoding API
              const bdcRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
              );
              if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                city = bdcData.city || bdcData.locality || bdcData.principalSubdivision;
              }

              // Fallback to French government API
              if (!city) {
                const gouvRes = await fetch(
                  `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
                );
                if (gouvRes.ok) {
                  const gouvData = await gouvRes.json();
                  city = gouvData.features?.[0]?.properties?.city;
                }
              }

              if (city) {
                setDetectedCity(city);
                setIsCycling(false);
              }
            } catch (err) {
              console.warn("Could not geolocate user via coordinates reverse geocoding:", err);
            }
          },
          (err) => {
            console.warn("Could not geolocate user via HTML5 geolocation:", err);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }
    }
  }, [layout, cityName]);

  const activeCity = cityName || detectedCity || DEFAULT_CITIES[cityIndex];
  const isNarrow = layout === "narrow";

  if (isNarrow) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-bold text-brand-dark mb-1 font-bricolage">
          Envie de fuir{" "}
          <span className="text-[color:var(--color-brand-orange)]">
            <ScrollingCity city={activeCity} />
          </span>{" "}
          ce week-end ?
        </h3>
        <div className="flex flex-col gap-4">
          {/* Lucas */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-bl-[4px] shadow-sm">
              <p className="font-satoshi font-medium text-[18px] leading-normal tracking-[-0.2px]">
                « Je passe plus de temps sur <strong className="font-extrabold text-white">les fiches horaires</strong> SNCF et les blogs locaux à vérifier les correspondances de bus qu’à préparer mon sac. <strong className="font-extrabold text-white">Ça me décourage une fois sur deux.</strong> »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pl-4">
              Lucas, 28 ans (Lyon)
            </span>
          </div>

          {/* Amandine */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-br-[4px] shadow-sm">
              <p className="font-satoshi font-medium text-[18px] leading-normal tracking-[-0.2px]">
                « Avec la voiture de location, on est obligés de faire une boucle pour revenir au point de départ. <strong className="font-extrabold text-white">On passe à côté des plus belles traversées</strong> de gare à gare. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pr-4 text-right">
              Amandine, 31 ans (Brest)
            </span>
          </div>

          {/* Thomas */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-bl-[4px] shadow-sm">
              <p className="font-satoshi font-medium text-[18px] leading-normal tracking-[-0.2px]">
                « Ma hantise le dimanche soir, c'est de <strong className="font-extrabold text-white">rater le dernier TER</strong> parce qu'on a mal estimé notre rythme de marche. Résultat, je passe la moitié de la rando à regarder ma montre. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pl-4">
              Thomas, 24 ans (Paris)
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-neve-beige py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#05966904_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
        {/* Section Header */}
        <div className="mx-auto pb-12 md:pb-16">
          <h2 className="text-3xl font-bricolage font-extrabold text-brand-dark md:text-5xl tracking-tight leading-tight">
            Envie de fuir{" "}
            <span className="text-[color:var(--color-brand-orange)]">
              <ScrollingCity city={activeCity} />
            </span>{" "}
            ce week-end ?
          </h2>
        </div>

        {/* Testimonials Layout */}
        <div className="flex flex-col gap-10 md:gap-14">
          {/* Lucas */}
          <div className="w-full max-w-[760px] self-start">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-bl-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-satoshi font-medium text-[18px] md:text-[20px] leading-[1.5] tracking-[-0.34px]">
                « Je passe plus de temps sur <strong className="font-extrabold text-white">les fiches horaires</strong> SNCF et les blogs locaux à vérifier les correspondances de bus qu’à préparer mon sac. <strong className="font-extrabold text-white">Ça me décourage une fois sur deux.</strong> »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pl-6">
              Lucas, 28 ans (Lyon)
            </span>
          </div>

          {/* Amandine */}
          <div className="w-full max-w-[760px] self-end">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-br-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-satoshi font-medium text-[18px] md:text-[20px] leading-[1.5] tracking-[-0.34px]">
                « Avec la voiture de location, on est obligés de faire une boucle pour revenir au point de départ. <strong className="font-extrabold text-white">On passe à côté des plus belles traversées</strong> de gare à gare. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pr-6 text-right">
              Amandine, 31 ans (Brest)
            </span>
          </div>

          {/* Thomas */}
          <div className="w-full max-w-[760px] self-start md:pl-[12%]">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-bl-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-satoshi font-medium text-[18px] md:text-[20px] leading-[1.5] tracking-[-0.34px]">
                « Ma hantise le dimanche soir, c'est de <strong className="font-extrabold text-white">rater le dernier TER</strong> parce qu'on a mal estimé notre rythme de marche. Résultat, je passe la moitié de la rando à regarder ma montre. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pl-6">
              Thomas, 24 ans (Paris)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
