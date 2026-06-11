"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import Button from "./button";
import { useState } from "react";

export default function Footer({ border = false }: { border?: boolean }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full relative overflow-hidden flex flex-col bg-color-neve-beige text-slate-600 border-t border-slate-200/80">
      
      {/* 1. PREMIUM NEWSLETTER BLOCK */}
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
          <div className="bg-[#ffefe9] border-2 border-[#0f172b] rounded-[24px] p-8 md:p-12 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Background decorative patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(#eb490b0c_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Left side: Heading */}
            <div className="lg:col-span-7 space-y-3.5 relative z-10">
              <h3 
                className="text-2xl md:text-3.5xl font-extrabold text-[#292929] tracking-[-0.8px] font-bricolage leading-tight"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Recevez nos 3 meilleures randos sans voiture chaque jeudi.
              </h3>
              <p 
                className="text-[18px] text-[#525252] font-medium leading-relaxed max-w-xl font-satoshi"
              >
                Pas de spam. Uniquement des itinéraires vérifiés, des fiches horaires de bus locaux simplifiées et des récits de micro-aventures.
              </p>
            </div>

            {/* Right side: Input Form */}
            <div className="lg:col-span-5 w-full relative z-10">
              {subscribed ? (
                <div className="bg-emerald-50/80 border-2 border-emerald-500/60 rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)] transition-all duration-300">
                  <div className="text-emerald-800 font-extrabold text-base font-bricolage mb-1.5">✓ C'est dans la boîte !</div>
                  <div className="text-[#525252] text-[18px] font-medium font-satoshi mt-1.5">À jeudi pour vos prochaines idées de micro-aventure.</div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3.5 w-full">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-[#0f172b] text-[#292929] placeholder-slate-400 text-sm focus:outline-none focus:border-[#eb490b] transition duration-150"
                  />
                  <Button
                    type="submit"
                  >
                    S'abonner gratuitement
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER (Light) */}
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
          <div className="grid gap-10 sm:grid-cols-12 mb-12">
            
            {/* 1st column: Logo, Description & Badges */}
            <div className="space-y-5 sm:col-span-12 lg:col-span-4 pr-0 lg:pr-8">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Logo />
              </div>
              
              <p 
                className="text-[18px] text-[#525252] leading-[22px] font-satoshi font-medium tracking-[-0.4px]"
              >
                Névé réinvente les sorties outdoor en combinant les TER et les navettes locales. Planifiez, réservez vos billets via Trainline et randonnez l'esprit libre grâce à la Sécurité Retour.
              </p>

              {/* Mobile app download buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#download-ios" className="hover:opacity-90 transition">
                  <Image
                    src="/images/app-apple-fr-FR.d5bac4a9.svg"
                    alt="Télécharger dans l'App Store"
                    width={120}
                    height={36}
                    className="h-[36px] w-auto object-contain"
                  />
                </a>
                <a href="#download-android" className="hover:opacity-90 transition">
                  <Image
                    src="/images/app-google-fr-FR.922a8286.svg"
                    alt="Disponible sur Google Play"
                    width={120}
                    height={36}
                    className="h-[36px] w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            {/* 2nd column: Explorer */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 
                className="text-slate-900 font-extrabold text-[12px] tracking-[0.6px] uppercase font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Explorer
              </h4>
              <ul className="space-y-2 text-[12px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/#hike-explorer">
                    Itinéraires
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/#hike-explorer">
                    Planificateur TER
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/#features">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/randos-sans-voiture">
                    Randonnées
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/randos-sans-voiture">
                    Gares de départ
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3rd column: Partenaires */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 
                className="text-slate-900 font-extrabold text-[12px] tracking-[0.6px] uppercase font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Partenaires
              </h4>
              <ul className="space-y-2 text-[12px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="https://www.trainline.fr" target="_blank">
                    Trainline API
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Régions TER
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    SNCF Connect
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Offices de Tourisme
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4th column: Entreprise */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 
                className="text-slate-900 font-extrabold text-[12px] tracking-[0.6px] uppercase font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Entreprise
              </h4>
              <ul className="space-y-2 text-[12px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#about">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Recrutement
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Presse
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/privacy">
                    Politique
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="/terms">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>

            {/* 5th column: Communauté */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 
                className="text-slate-900 font-extrabold text-[12px] tracking-[0.6px] uppercase font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Communauté
              </h4>
              <ul className="space-y-2 text-[12px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Guides pratiques
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Support & Contact
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Outil de tracé GPX
                  </Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-slate-900 transition" href="#0">
                    Live Tracking
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Area: Social Icons & Legal */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-satoshi tracking-[-0.4px] text-[#525252]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <span>© {new Date().getFullYear()} Névé. Tous droits réservés.</span>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="https://instagram.com/neve" 
                target="_blank"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#0f172b] text-slate-500 hover:text-[#e1306c] hover:border-[#e1306c] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(225,48,108,0.2)]" 
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current transition-colors duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="font-semibold text-xs text-slate-500 group-hover:text-[#e1306c] transition-colors duration-300 font-satoshi">Instagram</span>
              </a>
              <a 
                href="https://linkedin.com/company/neve" 
                target="_blank"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#0f172b] text-slate-500 hover:text-[#0077b5] hover:border-[#0077b5] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,119,181,0.2)]" 
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current transition-colors duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="font-semibold text-xs text-slate-500 group-hover:text-[#0077b5] transition-colors duration-300 font-satoshi">LinkedIn</span>
              </a>
              <a 
                href="https://www.strava.com/clubs/neve" 
                target="_blank"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#0f172b] text-slate-500 hover:text-[#fc6100] hover:border-[#fc6100] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(252,97,0,0.2)]" 
                aria-label="Strava Club"
              >
                <svg className="w-4 h-4 fill-current transition-colors duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.387 17.944L13.298 13.83h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.608h4.172L10.463 0l-7.313 13.837h4.172" />
                </svg>
                <span className="font-semibold text-xs text-slate-500 group-hover:text-[#fc6100] transition-colors duration-300 font-satoshi">Strava Club</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
