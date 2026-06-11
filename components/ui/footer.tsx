"use client";

import Link from "next/link";
import Logo from "./logo";

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer className="w-full relative overflow-hidden flex flex-col">
      
      {/* 1. TOP TRANSITION BANNER (Style Summit Banner) */}
      <div className="relative w-full h-64 md:h-72 flex items-center justify-center overflow-hidden">
        {/* Background Image of Hiker/Outdoor */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop')` }}
        />
        {/* Translucent Olive Green Overlay */}
        <div className="absolute inset-0 bg-neve-forest/85 z-10" />

        {/* Content Centered */}
        <div className="relative z-20 text-center px-4 max-w-2xl flex flex-col items-center">
          {/* Pictogram Row */}
          <div className="flex gap-6 text-white/75 text-3xl mb-4 select-none">
            <span>🏔️</span>
            <span>🏕️</span>
            <span>🏰</span>
          </div>

          {/* Heading */}
          <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Préparez-vous à conquérir <br />
            de nouveaux sommets
          </h3>

          {/* Cream Pill Button */}
          <a
            href="#download-ios"
            className="px-6 py-2.5 rounded-full bg-[#faf8f2] hover:bg-white text-neve-forest font-black text-xs shadow-md transition duration-150 cursor-pointer"
          >
            Inscrivez-vous gratuitement
          </a>
        </div>
      </div>

      {/* 2. MAIN FOOTER (Dark Olive-Black) */}
      <div className="bg-[#1c2414] text-slate-300 py-12 md:py-16 border-t border-slate-800/50">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-12 mb-12">
            
            {/* 1st column: Logo & Description */}
            <div className="space-y-4 sm:col-span-12 lg:col-span-4 pr-0 lg:pr-8">
              <div className="flex items-center gap-2 text-white">
                <Logo />
                <span className="font-extrabold text-xl tracking-tight font-sans">Névé</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Névé réinvente les sorties outdoor en combinant les TER et les navettes locales. Planifiez, réservez vos billets via Trainline et randonnez l'esprit libre grâce à la Sécurité Retour.
              </p>
              <div className="text-[11px] text-slate-500 font-bold">
                &copy; {new Date().getFullYear()} Névé. Tous droits réservés.
              </div>
            </div>

            {/* 2nd column: Explorer */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Explorer</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link className="hover:text-white transition" href="/#hike-explorer">
                    Itinéraires
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/#hike-explorer">
                    Planificateur TER
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/#features">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/randos-sans-voiture">
                    Randonnées
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/randos-sans-voiture">
                    Gares de départ
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3rd column: Partenaires */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Partenaires</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link className="hover:text-white transition" href="https://www.trainline.fr" target="_blank">
                    Trainline API
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Régions TER
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    SNCF Connect
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Offices de Tourisme
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4th column: Entreprise */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Entreprise</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link className="hover:text-white transition" href="#about">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Recrutement
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Presse
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/privacy">
                    Politique
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="/terms">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>

            {/* 5th column: Communauté */}
            <div className="space-y-3 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Communauté</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Guides pratiques
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Support & Contact
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Outil de tracé GPX
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition" href="#0">
                    Live Tracking
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Area: Social Icons & Legal */}
          <div className="pt-8 border-t border-slate-800/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold">
            <div>
              Designed with 💚 for car-free outdoor exploration.
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#0" className="hover:text-white transition" aria-label="Instagram">
                Instagram
              </a>
              <a href="#0" className="hover:text-white transition" aria-label="Strava">
                Strava Club
              </a>
              <a href="#0" className="hover:text-white transition" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
