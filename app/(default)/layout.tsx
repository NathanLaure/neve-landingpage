"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import AOS from "aos";
import "aos/dist/aos.css";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  /*
   * Les pages applicatives se passent du pied de page vitrine : on y consulte
   * une carte ou un compte, pas un site.
   *
   * `/randos-sans-voiture` n'en est pas une, malgré les apparences. C'est une
   * page de contenu, faite pour être trouvée : le pied lui apporte ses liens
   * internes et ses mentions, que les robots lisent autant que les visiteurs.
   * `startsWith("/rando")` l'attrapait d'ailleurs deux fois, le préfixe
   * couvrant les deux routes.
   */
  const isAppPage = pathname
    ? pathname.startsWith("/explorer") ||
      pathname.startsWith("/favoris") ||
      pathname.startsWith("/profil") ||
      pathname.startsWith("/rando/")
    : false;

  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      {!isAppPage && <Footer border={true} />}
    </>
  );
}
