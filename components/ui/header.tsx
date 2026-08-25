"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import Button from "./button";
import CustomLink from "./link";
import AccountMenu from "./account-menu";
import PlaceSearch from "./place-search";
import { useAuth } from "@/context/AuthContext";

/**
 * Pages qui sont l'application web plutôt que la vitrine.
 *
 * Elles reçoivent la recherche de lieu et un fond plein, sans jamais l'état
 * transparent : il n'y a pas de bandeau d'accueil derrière quoi se fondre, et
 * une barre transparente sur une carte serait illisible.
 */
const APP_ROUTES = ["/explorer", "/randos-sans-voiture"];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAppPage = APP_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const { user, isLoading, openAuthModal } = useAuth();

  /*
   * La recherche suit le visiteur.
   *
   * Sur l'accueil, elle apparaît une fois le bandeau dépassé : c'est
   * exactement là que celle du hero disparaît de l'écran, et la seule action
   * de la page devient alors inatteignable sans remonter.
   */
  const showsSearch = isAppPage || (isHome && isScrolled);

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
        isAppPage
          ? "bg-neve-surface shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
          : isScrolled
            ? "bg-[#fbfaf7] shadow-xs"
            : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-6 sm:px-10 md:px-10">
        <div
          className={`flex items-center justify-between gap-3 transition-all duration-300 ${
            isScrolled || isAppPage ? "h-16" : "h-20"
          } ${showsSearch ? "md:gap-8 lg:gap-11" : ""}`}
        >
          {/* Logo */}
          <div className="flex items-center">
            <Logo light={!isScrolled && !isAppPage} iconClassName="h-8 w-8 sm:h-9 sm:w-9" typoClassName="h-6 sm:h-7" />
          </div>

          {/* Recherche de lieu — au centre et extensible, elle prend la place que
              les liens d'ancre occupent sur la vitrine. Masquée sur mobile, où
              l'explorateur n'affiche de toute façon que la liste. */}
          {/* `Suspense` : `PlaceSearch` lit les paramètres d'adresse, et Next
              refuse qu'un composant le fasse hors d'une frontière de
              suspension sur une page rendue à l'avance — ce qu'est l'accueil. */}
          {showsSearch && (
            <Suspense fallback={<div className="hidden min-w-0 flex-1 lg:block" />}>
              <PlaceSearch className="hidden min-w-0 flex-1 lg:block" />
            </Suspense>
          )}

          {/* Right Group: Nav Links + Action Buttons */}
          <div className="flex items-center gap-8">
            {/* Navigation Links (Anchors) - Only visible on landing page */}
            {isHome && (
              /* Les ancres ne reviennent qu'à partir de 1536 px quand la
                 recherche est là. En dessous, logo, champ, quatre liens et deux
                 boutons se disputent la ligne : mesuré, le champ tombait à
                 178 px à 1280 px, soit une largeur où l'on ne lit même pas son
                 propre texte. C'est lui qui sert le plus, il passe devant. */
              <nav
                className={`items-center gap-8 ${showsSearch ? "hidden 2xl:flex" : "hidden md:flex"}`}
              >
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
                  Comment ça marche ?
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
            )}

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

              {/* Account state */}
              {!isLoading && user ? (
                <AccountMenu scrolled={isScrolled} />
              ) : (
                <Button
                  onClick={() => openAuthModal()}
                  variant="primary"
                  className="py-2 px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Se connecter / S'inscrire</span>
                  <span className="sm:hidden">Se connecter</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
