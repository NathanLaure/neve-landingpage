"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./logo";
import Button from "./button";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      if (window.scrollY > heroHeight - 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Initialize state on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#fbfaf7] shadow-xs" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-6 sm:px-10 md:px-10">
        <div 
          className={`flex items-center justify-between gap-3 transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center">
            <Logo light={!isScrolled} />
          </div>

          {/* Right Group: Nav Links + Action Buttons */}
          <div className="flex items-center gap-8">
            {/* Navigation Links (Anchors) */}
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#about" 
                className={`font-satoshi font-bold text-[16px] transition-colors duration-200 ${
                  isScrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                À propos
              </a>
              <a 
                href="#how-it-works" 
                className={`font-satoshi font-bold text-[16px] transition-colors duration-200 ${
                  isScrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                Comment ça marche
              </a>
              <a 
                href="#features" 
                className={`font-satoshi font-bold text-[16px] transition-colors duration-200 ${
                  isScrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                Fonctionnalités
              </a>
              <a 
                href="#faq" 
                className={`font-satoshi font-bold text-[16px] transition-colors duration-200 ${
                  isScrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                FAQ
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Sign In / Sign Up Link */}
              <Link
                href="/signup"
                className={`hidden sm:inline-block font-satoshi font-bold text-[16px] transition-colors duration-200 ${
                  isScrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                Se connecter
              </Link>

              {/* Download Button */}
              <Button 
                href="#download-ios" 
                variant="primary" 
                className="py-2 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Télécharger l'app</span>
                <span className="sm:hidden">Télécharger</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
