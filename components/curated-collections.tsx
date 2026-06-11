"use client";

import { useRef } from "react";

type Collection = {
  title: string;
  author: string;
  image: string;
  link: string;
};

const COLLECTIONS: Collection[] = [
  {
    title: "Fontainebleau Sauvage : Les plus beaux blocs de varappe",
    author: "Névé",
    image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/paris"
  },
  {
    title: "Le Massif du Pilat en Gravel & Rando",
    author: "Maxime D.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/lyon"
  },
  {
    title: "Les parois de la région Provence-Alpes-Côte d'Azur",
    author: "Julien L.",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/marseille"
  },
  {
    title: "Les sentiers du Vercors et leurs panoramas époustouflants",
    author: "Emma T.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/grenoble"
  },
  {
    title: "Les pistes sauvages de la Vallée de Chamonix",
    author: "Thomas L.",
    image: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/chamonix"
  },
  {
    title: "Traversée Secrète des Calanques de Cassis",
    author: "Julien B.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    link: "/randos-sans-voiture/cassis"
  }
];

export default function CuratedCollections() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left"
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;

      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="bg-[#292929] py-16 md:py-24 relative overflow-hidden text-white w-full">
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header — centered in the max-w grid */}
      <div className="mx-auto max-w-[1232px] px-6 sm:px-10 md:px-16 xl:px-0 relative z-10">
        <div className="grid gap-6 md:grid-cols-12 items-end mb-12 border-b border-[#525252]/50 pb-8">
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-bricolage">
              Votre prochaine <br className="max-md:hidden" />
              destination nature est ici
            </h2>
          </div>

          <div className="md:col-span-5">
            <p className="text-[#989898] text-[18px] leading-relaxed max-w-lg font-medium font-satoshi tracking-[-0.4px]">
              Parcourez les meilleures aventures prêtes pour l'extérieur : sélectionnées, organisées et validées par l'équipe Névé et sa communauté. Votre propre carnet de voyage incluant les plannings de transport, tracés GPX et votre envie de découvrir le monde.
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Faire défiler vers la gauche"
              className="w-10 h-10 rounded-full border border-[#525252] bg-[#1b1b1b] hover:bg-[#252525] flex items-center justify-center text-white transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Faire défiler vers la droite"
              className="w-10 h-10 rounded-full border border-[#525252] bg-[#1b1b1b] hover:bg-[#252525] flex items-center justify-center text-white transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll List — full viewport width.
          paddingLeft aligns the first card with the grid margin above.
          Cards scroll all the way to both viewport edges naturally. */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory w-full relative z-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: "max(1.5rem, calc((100vw - 1232px) / 2))",
          scrollPaddingLeft: "max(1.5rem, calc((100vw - 1232px) / 2))",
          paddingRight: "3rem"
        }}
      >
        {COLLECTIONS.map((col, index) => (
          <div
            key={index}
            className="flex-none w-[280px] md:w-[325px] h-[440px] snap-start relative select-none"
          >
            <a
              href={col.link}
              className="group absolute inset-0 rounded-[32px] overflow-hidden border-2 border-[#efefef] shadow-[4px_4px_0px_0px_rgba(239,239,239,1)] flex flex-col justify-end p-[26px] cursor-pointer hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-[transform,box-shadow] duration-100 ease-in-out"
            >
              {/* Card Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${col.image}')` }}
              />

              {/* Dark Gradient Mask for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

              {/* Text contents */}
              <div className="relative z-20 text-white w-full">
                <h3 className="text-[18px] font-extrabold leading-[24.75px] mb-3 pr-8 group-hover:text-brand-orange transition-colors font-bricolage tracking-[-0.306px]">
                  {col.title}
                </h3>

                <div className="text-[10px] text-[#90a1b9] border-t border-[#1d293d] pt-[13px] flex justify-between items-center font-bold font-bricolage tracking-[-0.4px]">
                  <span>Collection par : {col.author}</span>
                </div>
              </div>

              {/* Bottom Right Arrow Link icon */}
              <div className="absolute bottom-[20px] right-[20px] w-8 h-8 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center transition-all duration-300 z-20 group-hover:bg-brand-orange group-hover:scale-105">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
