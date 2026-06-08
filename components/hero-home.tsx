import Image from "next/image";
import PageIllustration from "@/components/page-illustration";
import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar04 from "@/public/images/avatar-04.jpg";
import Avatar05 from "@/public/images/avatar-05.jpg";
import Avatar06 from "@/public/images/avatar-06.jpg";

export default function HeroHome() {
  return (
    <section id="about" className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <div
              className="mb-6"
              data-aos="zoom-y-out"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="-mx-0.5 flex justify-center -space-x-3">
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar01}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar02}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar03}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar04}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar05}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-sm"
                    src={Avatar06}
                    width={32}
                    height={32}
                    alt="Utilisateur de Névé"
                  />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Recommandé par <span className="text-[color:var(--color-brand-orange)] font-bold">10 000+</span> citadins randonneurs
                </div>
              </div>
            </div>
            <h1
              className="mb-6 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,var(--color-brand-orange-light),transparent)1] md:text-6xl text-gray-900 leading-tight"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              Pas de voiture ? <br className="max-lg:hidden" />
              Partez randonner <span className="text-[color:var(--color-brand-orange)] font-extrabold">sur un coup de tête.</span>
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-gray-600"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Névé combine automatiquement les TER, les bus locaux et les tracés GPS de montagne. Marchez l'esprit libre : l'application surveille vos correspondances et vous alerte en direct s'il est temps de faire demi-tour.
              </p>
              <div id="download-ios" className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,var(--color-brand-orange-light),transparent)1] py-4">
                <div
                  className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center gap-4"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  {/* App Store button */}
                  <a
                    className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
                    href="#download-ios"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.11.09 2.24-.55 2.94-1.39z"/>
                    </svg>
                    <div className="text-left leading-none">
                      <p className="text-[9px] text-gray-400">Télécharger sur l'</p>
                      <p className="text-xs font-semibold font-sans">App Store</p>
                    </div>
                  </a>
                  {/* Google Play button */}
                  <a
                    className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
                    href="#download-android"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M3 5.27v13.46c0 .87.69 1.45 1.5 1.45.28 0 .54-.08.79-.24l11.16-6.45-3.12-3.12L3 5.27zm18.23 5.8L17.76 8.9l-2.78 2.78 2.78 2.78 3.47-2.01c.75-.43.75-1.13 0-1.58zM4.53 3.53C4.28 3.37 4.02 3.3 3.75 3.3c-.81 0-1.5.58-1.5 1.45l9.28 9.28 3.09-3.09L4.53 3.53zm9.09 11.23l-3.09-3.09L1.25 20.95c.25.16.51.24.78.24.81 0 1.5-.58 1.5-1.45l10.09-5.83-2.18-2.18z"/>
                    </svg>
                    <div className="text-left leading-none">
                      <p className="text-[9px] text-gray-400">Disponible sur</p>
                      <p className="text-xs font-semibold font-sans">Google Play</p>
                    </div>
                  </a>
                </div>
                {/* Micro social proof under buttons */}
                <div className="mt-4 text-xs text-gray-500 flex justify-center items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Plus de 2 500 randonnées sans voiture planifiées ce mois-ci
                </div>
              </div>
            </div>
          </div>
          {/* Hero mockup */}
          <div
            className="mx-auto max-w-3xl flex justify-center"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            <div className="relative rounded-3xl p-1.5 bg-linear-to-b from-gray-200 to-gray-50 shadow-2xl max-w-[340px] sm:max-w-[380px] border border-gray-100">
              <div className="relative overflow-hidden rounded-[2.2rem] bg-slate-900 border-[6px] border-slate-900">
                <Image
                  src="/images/neve-app-mockup.png"
                  width={380}
                  height={380}
                  alt="Interface de l'application mobile Névé"
                  className="w-full h-auto object-cover object-top hover:scale-[1.02] transition-transform duration-500 ease-in-out"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

