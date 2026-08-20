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

  // Application routes (map explorer, favorites, hike directories, hike detail) don't display marketing footer
  const isAppPage = pathname
    ? pathname.startsWith("/explorer") ||
      pathname.startsWith("/favoris") ||
      pathname.startsWith("/profil") ||
      pathname.startsWith("/randos-sans-voiture") ||
      pathname.startsWith("/rando")
    : false;

  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      {!isAppPage && <Footer border={true} />}
    </>
  );
}
