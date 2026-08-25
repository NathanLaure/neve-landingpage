"use client";

import Image from "next/image";
import Logo from "./logo";
import Button from "./button";
import CustomLink from "./link";
import AppDownloadBanner from "@/components/app-download-banner";
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
      
      {/*
        * 0. BANDEAU DE TELECHARGEMENT
        *
        * En tete de pied plutôt que posé par chaque page : il concluait déjà la
        * fiche randonnée et la page de ville, et le recopier une troisième fois
        * garantissait qu'une des trois finirait par diverger. Il y perd la
        * mention du lieu que portait la page de ville — le pied ne sait pas où
        * l'on est.
        */}
      <div className="pt-12 md:pt-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
          <AppDownloadBanner
            title="Planifiez vos sorties 100 % sans voiture"
            description="Horaires de train synchronisés, correspondances calculées et guidage GPS en direct : partez à l'aventure en toute liberté avec Névé."
          />
        </div>
      </div>

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
                    className="flex-1 px-4 py-3 rounded-3xl [corner-shape:squircle] bg-white border-2 border-[#0f172b] text-[#292929] placeholder-slate-400 text-sm focus:outline-none focus:border-[#eb490b] transition duration-150"
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
                Névé réinvente les sorties outdoor en combinant les TER et les navettes locales. Planifiez votre sortie de bout en bout et randonnez l'esprit libre grâce à la Sécurité Retour.
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
                className="text-slate-900 font-extrabold text-[16px] tracking-[0.6px] font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Explorer
              </h4>
              <ul className="space-y-2 text-[14px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <CustomLink variant="footer" href="/explorer">
                    Carte intéractive
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="/explorer">
                    Planificateur
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="/#features">
                    Fonctionnalités
                  </CustomLink>
                </li>
              </ul>
            </div>

            {/*
              * 3e colonne : liens utiles.
              *
              * Elle s'intitulait « Partenaires » et nommait Trainline, SNCF
              * Connect, les régions TER et les offices de tourisme. Aucun de
              * ces accords n'existe, et la clause de non-affiliation des CGU
              * l'aurait contredite sur la même page. Ce sont des références,
              * pas des partenaires — et les liens mènent désormais vraiment
              * quelque part, au lieu de `#0`.
              */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4
                className="text-slate-900 font-extrabold text-[16px] tracking-[0.6px] font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Liens utiles
              </h4>
              <ul className="space-y-2 text-[14px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <CustomLink variant="footer" href="https://www.sncf-connect.com" target="_blank">
                    Horaires SNCF
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="https://www.ter.sncf.com" target="_blank">
                    TER par région
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="https://www.iledefrance-mobilites.fr" target="_blank">
                    Île-de-France Mobilités
                  </CustomLink>
                </li>
              </ul>
            </div>

            {/* 4th column: Entreprise */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 
                className="text-slate-900 font-extrabold text-[16px] tracking-[0.6px] font-bricolage"
                style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
              >
                Entreprise
              </h4>
              <ul className="space-y-2 text-[14px] font-semibold font-bricolage tracking-[-0.4px]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
                <li>
                  <CustomLink variant="footer" href="#about">
                    À propos
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="/privacy">
                    Politique de confidentialité
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="/terms">
                    Conditions générales d'utilisation
                  </CustomLink>
                </li>
                <li>
                  <CustomLink variant="footer" href="/mentions-legales">
                    Mentions légales
                  </CustomLink>
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
                href="https://instagram.com/neve.rando" 
                target="_blank"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#0f172b] text-slate-500 hover:text-[#e1306c] hover:border-[#e1306c] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.06)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(225,48,108,0.2)]" 
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current transition-colors duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="font-semibold text-xs text-slate-500 group-hover:text-[#e1306c] transition-colors duration-300 font-satoshi">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
