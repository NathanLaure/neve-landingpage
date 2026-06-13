"use client";

import Image from "next/image";
import CustomLink from "@/components/ui/link";

export default function Cta() {
  return (
    <section className="bg-[#fbfaf7] py-16 md:py-24 text-slate-900 w-full relative">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        
        {/* Top Header Split: Title & CTA vs. Star Review */}
        <div className="grid gap-8 md:grid-cols-12 items-center mb-12 pb-12 border-b border-gray-200/50">
          
          {/* Left: Title & Buttons */}
          <div className="md:col-span-8 max-w-4xl">
            <h2 
              className="text-3xl md:text-5xl font-extrabold text-[#292929] tracking-[-1.2px] mb-4 font-bricolage leading-[1.1] md:leading-[60px]"
              style={{ fontVariationSettings: "'opsz' 96, 'wdth' 100" }}
            >
              Quittez le béton. <span className="text-[#eb490b]">Prenez le train.</span>
            </h2>
            
            <p className="font-satoshi text-[#525252] text-[18px] mb-8 max-w-xl font-medium leading-relaxed">
              Téléchargez Névé gratuitement et rejoignez le mouvement de la rando sans empreinte carbone.
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
              <CustomLink
                href="#signup"
                variant="underline"
                className="text-lg py-2"
              >
                Créer un compte gratuitement
              </CustomLink>
            </div>
          </div>

          {/* Right: Star Review (No Laurel) */}
          <div className="md:col-span-4 flex items-center justify-center select-none md:justify-end">
            <div className="relative flex flex-col items-center md:items-end">
              {/* Rating Text */}
              <div className="font-bricolage font-extrabold flex items-baseline gap-1">
                <span 
                  className="text-[36px] font-extrabold text-[#292929] tracking-[-0.9px] leading-[46px]" 
                  style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
                >
                  4.7
                </span>
                <span 
                  className="text-[20px] text-[#7c7c7c] tracking-[-0.34px] leading-[30px]" 
                  style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
                >
                  / 5
                </span>
              </div>
              
              {/* Five Green Stars */}
              <div className="flex text-[#eb490b] gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Scrapbook Grid of Stats and Immersive Imagery */}
        <div className="grid gap-6 md:grid-cols-12 items-stretch">
          
          {/* 1. Left Card: 1000+ Citadins (col-span-3) */}
          <div className="md:col-span-3 flex items-center justify-center">
            <div className="w-full bg-[#ffefe9] border-2 border-[#0f172b] rounded-[24px] p-6 shadow-[4px_4px_0px_0px_#0f172a] rotate-1 flex flex-col justify-center text-center min-h-[240px]">
              <div className="font-mono font-bold text-[30px] text-[#292929] leading-[40px]">1000+</div>
              <div 
                className="font-bricolage font-bold text-[12px] text-[#292929] tracking-[-0.4px] leading-[19.5px] mt-2"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Citadins randonneurs actifs dans la<br />communauté Névé
              </div>
            </div>
          </div>

          {/* 2. Middle: Large panoramic photograph (col-span-7) */}
          <div className="md:col-span-7 relative min-h-[240px] rounded-[24px] overflow-hidden border-2 border-[#0f172b] shadow-[4px_4px_0px_0px_#0f172a] rotate-[-0.5deg]">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          {/* 3. Right: Stacked Side Column Cards (col-span-2) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            
            {/* Top Beige Card */}
            <div className="bg-[#f5f3ec] border-2 border-[#0f172b] rounded-[16px] p-4.5 shadow-[3px_3px_0px_0px_#0f172a] rotate-[-1.5deg] flex-1 flex flex-col justify-center text-center">
              <div className="font-mono font-bold text-[20px] text-[#292929] leading-[30px]">800+</div>
              <div 
                className="font-bricolage font-bold text-[10px] text-[#292929] tracking-[-0.4px] leading-[12.5px] mt-1"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Itinéraires train-to-trail vérifiés
              </div>
            </div>
            
            {/* Bottom Green Card */}
            <div className="bg-[rgba(208,250,229,0.6)] border-2 border-[#0f172b] rounded-[16px] p-4.5 shadow-[3px_3px_0px_0px_#0f172a] rotate-[1deg] flex-1 flex flex-col justify-center text-center">
              <div className="font-mono font-bold text-[20px] text-[#292929] leading-[30px]">85 000+</div>
              <div 
                className="font-bricolage font-bold text-[10px] text-[#292929] tracking-[-0.4px] leading-[12.5px] mt-1"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Kilomètres de CO2 économisés
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
