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

  const isCityPage = pathname ? /^\/randos-sans-voiture\/[^/]+$/.test(pathname) : false;

  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      {!isCityPage && <Footer border={true} />}
    </>
  );
}
