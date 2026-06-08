"use client";

import { useRef } from "react";

type Collection = {
  title: string;
  sport: string;
  author: string;
  image: string;
  link: string;
};

const COLLECTIONS: Collection[] = [
  {
    title: "Fontainebleau Sauvage : Les plus beaux blocs de varappe",
    sport: "Randonnée pédestre",
    author: "Névé",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop",
    link: "/randos-sans-voiture/paris"
  },
  {
    title: "Le Massif du Pilat en Gravel & Rando",
    sport: "Gravel / Rando",
    author: "Maxime D.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
    link: "/randos-sans-voiture/lyon"
  },
  {
    title: "Les Balcons Alpins autour de Grenoble",
    sport: "Rando Alpine",
    author: "Clara M.",
    image: "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=400&auto=format&fit=crop",
    link: "/randos-sans-voiture/grenoble"
  },
  {
    title: "Traversée Secrète des Calanques de Cassis",
    sport: "Trail running / Rando",
    author: "Julien B.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    link: "/randos-sans-voiture/marseille"
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
    <section className="bg-neve-beige py-16 md:py-24 border-b border-gray-150/40 relative overflow-hidden text-slate-900 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header: Title Left, Text Center, Navigation Right */}
        <div className="grid gap-6 md:grid-cols-12 items-end mb-12 border-b border-gray-200/50 pb-8">
          <div className="md:col-span-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Découvrez nos <br className="max-md:hidden" />
              Collections
            </h2>
          </div>
          
          <div className="md:col-span-6">
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xl">
              Parcourez les meilleures aventures prêtes pour l'extérieur : sélectionnées, organisées et validées par l'équipe Névé et sa communauté. Votre propre carnet de voyage incluant les correspondances TER, tracés GPX et détails de transport clés.
            </p>
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Faire défiler vers la gauche"
              className="w-10 h-10 rounded-full border border-gray-350 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Faire défiler vers la droite"
              className="w-10 h-10 rounded-full border border-gray-350 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collections Scroll List */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {COLLECTIONS.map((col, index) => (
            <a
              key={index}
              href={col.link}
              className="group relative flex-none w-[280px] md:w-[325px] h-[440px] rounded-[2rem] overflow-hidden shadow-lg border-2 border-slate-900 snap-start flex flex-col justify-end p-6 cursor-pointer hover:shadow-2xl transition duration-300"
            >
              {/* Card Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-550" 
                style={{ backgroundImage: `url('${col.image}')` }}
              />
              
              {/* Dark Gradient Mask for text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent z-10" />

              {/* Text contents */}
              <div className="relative z-20 text-white">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block mb-1">
                  {col.sport}
                </span>
                
                <h3 className="text-lg font-black leading-snug mb-3 pr-8 group-hover:text-emerald-300 transition-colors">
                  {col.title}
                </h3>
                
                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between items-center font-bold">
                  <span>Collection par : {col.author}</span>
                </div>
              </div>

              {/* Bottom Right Arrow Link icon */}
              <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/20 group-hover:bg-neve-forest text-white flex items-center justify-center border border-white/30 transition-all duration-300 z-20 group-hover:scale-110">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
