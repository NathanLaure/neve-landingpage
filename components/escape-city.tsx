"use client";

import { useState, useEffect } from "react";

type EscapeCityProps = {
  cityName?: string;
  layout?: "full" | "narrow";
};

export default function EscapeCity({ cityName, layout = "full" }: EscapeCityProps) {
  const [detectedCity, setDetectedCity] = useState<string>("");

  useEffect(() => {
    // Only detect city client-side on the homepage (layout === "full" and no explicit cityName prop)
    if (layout === "full" && !cityName) {
      fetch("https://ipapi.co/json/")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch location");
          return res.json();
        })
        .then((data) => {
          if (data && data.city) {
            setDetectedCity(data.city);
          }
        })
        .catch((err) => {
          console.warn("Could not geolocate user via IP:", err);
        });
    }
  }, [layout, cityName]);

  const activeCity = cityName || detectedCity || "Paris";
  const isNarrow = layout === "narrow";

  if (isNarrow) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-bold text-brand-dark mb-1 font-bricolage">
          Envie de fuir <span className="text-[color:var(--color-brand-orange)]">{activeCity}</span> ce week-end ?
        </h3>
        <div className="flex flex-col gap-4">
          {/* Lucas */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-bl-[4px] shadow-sm">
              <p className="font-bricolage font-semibold text-xs leading-normal tracking-[-0.2px]">
                « Je passe plus de temps sur <strong className="font-extrabold text-white">les fiches horaires</strong> SNCF et les blogs locaux à vérifier les correspondances de bus qu’à préparer mon sac. <strong className="font-extrabold text-white">Ça me décourage une fois sur deux.</strong> »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pl-4">
              Lucas, 28 ans ({activeCity})
            </span>
          </div>

          {/* Amandine */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-br-[4px] shadow-sm">
              <p className="font-bricolage font-semibold text-xs leading-normal tracking-[-0.2px]">
                « Avec la voiture de location, on est obligés de faire une boucle pour revenir au point de départ. <strong className="font-extrabold text-white">On passe à côté des plus belles traversées</strong> de gare à gare. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pr-4 text-right">
              Amandine, 31 ans (Boulogne)
            </span>
          </div>

          {/* Thomas */}
          <div className="w-full">
            <div className="bg-[#292929] text-white p-4.5 rounded-[16px] rounded-bl-[4px] shadow-sm">
              <p className="font-bricolage font-semibold text-xs leading-normal tracking-[-0.2px]">
                « Ma hantise le dimanche soir, c'est de <strong className="font-extrabold text-white">rater le dernier TER</strong> parce qu'on a mal estimé notre rythme de marche. Résultat, je passe la moitié de la rando à regarder ma montre. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[8px] tracking-[0.5px] uppercase mt-1 block pl-4">
              Thomas, 24 ans ({activeCity})
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
      
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mx-auto pb-12 md:pb-16">
          <h2 className="text-3xl font-bricolage font-extrabold text-brand-dark md:text-5xl tracking-tight leading-tight">
            Envie de fuir <span className="text-[color:var(--color-brand-orange)]">{activeCity}</span> ce week-end ?
          </h2>
        </div>

        {/* Testimonials Layout */}
        <div className="flex flex-col gap-10 md:gap-14">
          {/* Lucas */}
          <div className="w-full max-w-[760px] self-start">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-bl-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-bricolage font-semibold text-lg md:text-xl leading-[1.5] tracking-[-0.34px]">
                « Je passe plus de temps sur <strong className="font-extrabold text-white">les fiches horaires</strong> SNCF et les blogs locaux à vérifier les correspondances de bus qu’à préparer mon sac. <strong className="font-extrabold text-white">Ça me décourage une fois sur deux.</strong> »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pl-6">
              Lucas, 28 ans ({activeCity})
            </span>
          </div>

          {/* Amandine */}
          <div className="w-full max-w-[760px] self-end">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-br-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-bricolage font-semibold text-lg md:text-xl leading-[1.5] tracking-[-0.34px]">
                « Avec la voiture de location, on est obligés de faire une boucle pour revenir au point de départ. <strong className="font-extrabold text-white">On passe à côté des plus belles traversées</strong> de gare à gare. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pr-6 text-right">
              Amandine, 31 ans (Boulogne)
            </span>
          </div>

          {/* Thomas */}
          <div className="w-full max-w-[760px] self-start md:pl-[12%]">
            <div className="bg-[#292929] text-white p-6 md:p-8 rounded-[20px] rounded-bl-[5px] shadow-[0_4px_1.5px_rgba(0,0,0,0.1),0_10px_7.5px_rgba(0,0,0,0.06)] relative">
              <p className="font-bricolage font-semibold text-lg md:text-xl leading-[1.5] tracking-[-0.34px]">
                « Ma hantise le dimanche soir, c'est de <strong className="font-extrabold text-white">rater le dernier TER</strong> parce qu'on a mal estimé notre rythme de marche. Résultat, je passe la moitié de la rando à regarder ma montre. »
              </p>
            </div>
            <span className="text-[color:var(--color-brand-orange)] font-bricolage font-extrabold text-[10px] tracking-[0.5px] uppercase mt-3 block pl-6">
              Thomas, 24 ans ({activeCity})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
