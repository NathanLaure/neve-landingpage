"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import PromoPhone1 from "@/public/images/promo-phone-1.png";
import PromoPhone2 from "@/public/images/promo-phone-2.png";
import PromoPhone3 from "@/public/images/promo-phone-3.png";

export default function PromoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const phoneLeftRef = useRef<HTMLDivElement>(null);
  const phoneCenterRef = useRef<HTMLDivElement>(null);
  const phoneRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;

          const rect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Check if the section is within the viewport
          if (rect.top < viewportHeight && rect.bottom > 0) {
            // Find the center position of the section relative to the viewport center
            const sectionMiddle = rect.top + rect.height / 2;
            const viewportMiddle = viewportHeight / 2;
            const distanceFromCenter = sectionMiddle - viewportMiddle;

            // Parallax offsets (base offset + scroll speed factor)
            // Left phone: moves slightly down as scroll goes down
            // Center phone: moves UP relative to section as scroll goes down (protruding when entering/leaving, aligned near center when looking at the section)
            // Right phone: moves DOWN relative to section as scroll goes down (protruding when entering/leaving, aligned near center when looking at the section)
            const leftY = distanceFromCenter * -0.05;
            const centerY = -20 + distanceFromCenter * 0.25;
            const rightY = 20 + distanceFromCenter * -0.25;

            if (phoneLeftRef.current) {
              phoneLeftRef.current.style.transform = `translate3d(0, ${leftY}px, 0)`;
            }
            if (phoneCenterRef.current) {
              phoneCenterRef.current.style.transform = `translate3d(0, ${centerY}px, 0)`;
            }
            if (phoneRightRef.current) {
              phoneRightRef.current.style.transform = `translate3d(0, ${rightY}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set positions
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="bg-neve-beige py-20 md:py-28 relative overflow-visible w-full"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8">
        
        {/* Main Card Container */}
        <div className="bg-[#fff6ed] border border-[#989898] rounded-[24px] p-8 md:p-12 lg:px-20 lg:py-0 lg:h-[600px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 overflow-hidden relative">
          
          {/* Left Side: Content */}
          <div className="w-full lg:w-[60%] flex flex-col items-start gap-6 md:gap-8 z-10 py-6 lg:py-0">
            {/* Title */}
            <h2 className="font-bricolage font-extrabold text-3xl md:text-5xl lg:text-[54px] tracking-tight text-[#292929] leading-[1.1]">
              Partez demain <span className="font-medium text-lg md:text-2xl lg:text-[28px] text-[#292929]/80 block sm:inline mt-1 sm:mt-0">(ou aujourd’hui)</span> avec Névé dans votre poche.
            </h2>
            
            {/* Description */}
            <p className="font-inter text-[#525252] text-sm md:text-base lg:text-xl leading-relaxed max-w-xl">
              Avec votre <span className="font-semibold text-slate-800">compte gratuit</span>, vous pouvez trouver et planifier les plus belles randos. Il ne reste plus qu’à sauter dans vos chaussures de rando !
            </p>
            
            {/* Action Buttons and Link */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-2">
              <div className="flex items-center gap-3">
                {/* App Store Badge */}
                <a href="#download-ios-cta">
                  <Image
                    src="/images/app-apple-fr-FR.d5bac4a9.svg"
                    alt="Télécharger dans l'App Store"
                    width={155}
                    height={46}
                    className="h-[46px] w-auto object-contain"
                  />
                </a>
                
                {/* Google Play Badge */}
                <a href="#download-android-cta">
                  <Image
                    src="/images/app-google-fr-FR.922a8286.svg"
                    alt="Disponible sur Google Play"
                    width={155}
                    height={46}
                    className="h-[46px] w-auto object-contain"
                  />
                </a>
              </div>
              
              {/* Text Link */}
              <a
                href="#signup"
                className="flex items-center gap-1.5 font-inter font-medium text-lg text-brand-orange hover:underline py-2"
              >
                <span>Créer un compte gratuitement</span>
                <span>→</span>
              </a>
            </div>
          </div>
          
          {/* Right Side: 3 side-by-side parallax phones */}
          <div className="w-full lg:w-[40%] flex items-center justify-center lg:justify-end overflow-visible min-h-[360px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-0 lg:h-full">
            {/* 3-column grid container for side-by-side layout (no horizontal overlap, scaled up even further) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-[720px] overflow-visible relative">
              
              {/* Phone 3: Left Phone (Map) */}
              <div 
                ref={phoneLeftRef} 
                className="z-10 drop-shadow-xl will-change-transform"
                style={{ transform: "translate3d(0, 0px, 0)" }}
              >
                <Image
                  src={PromoPhone3}
                  alt="Névé Carte et Itinéraire"
                  width={260}
                  height={563}
                  className="rounded-[8px] object-contain w-full h-auto"
                  priority
                />
              </div>
              
              {/* Phone 1: Center Phone (Filters) */}
              <div 
                ref={phoneCenterRef} 
                className="z-10 drop-shadow-lg will-change-transform"
                style={{ transform: "translate3d(0, -20px, 0)" }}
              >
                <Image
                  src={PromoPhone1}
                  alt="Névé Filtres de Recherche"
                  width={260}
                  height={563}
                  className="rounded-[8px] object-contain w-full h-auto"
                  priority
                />
              </div>
              
              {/* Phone 2: Right Phone (Hike List) */}
              <div 
                ref={phoneRightRef} 
                className="z-10 drop-shadow-xl will-change-transform"
                style={{ transform: "translate3d(0, 20px, 0)" }}
              >
                <Image
                  src={PromoPhone2}
                  alt="Névé Liste de Randonnées"
                  width={260}
                  height={563}
                  className="rounded-[8px] object-contain w-full h-auto"
                  priority
                />
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
