"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import Button from "./button";
import CustomLink from "./link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (!isHome) {
        setIsScrolled(true);
        return;
      }
      const heroHeight = window.innerHeight;
      if (window.scrollY > heroHeight - 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Initialize state on mount & route change
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

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
              <CustomLink 
                href="#about" 
                variant={isScrolled ? "header-scrolled" : "header"}
              >
                À propos
              </CustomLink>
              <CustomLink 
                href="#how-it-works" 
                variant={isScrolled ? "header-scrolled" : "header"}
              >
                Comment ça marche
              </CustomLink>
              <CustomLink 
                href="#features" 
                variant={isScrolled ? "header-scrolled" : "header"}
              >
                Fonctionnalités
              </CustomLink>
              <CustomLink 
                href="#faq" 
                variant={isScrolled ? "header-scrolled" : "header"}
              >
                FAQ
              </CustomLink>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Sign In / Sign Up Link */}
              <span className="hidden md:inline-flex">
                <Button
                  href="#download-ios"
                  variant="secondary"
                  className="py-2 px-3 sm:px-4 border-none"
                >
                  Télécharger l'app
                </Button>
              </span>

              {/* Download Button */}
              <Button 
                href="/signup" 
                variant="primary" 
                className="py-2 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Se connecter / S'inscrire</span>
                <span className="sm:hidden">Se connecter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
