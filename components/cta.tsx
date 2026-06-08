import Image from "next/image";
import Stripes from "@/public/images/stripes-dark.svg";

export default function Cta() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-slate-950"
          data-aos="zoom-y-out"
        >
          {/* Brand Orange Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-[color:var(--color-brand-orange)] blur-3xl opacity-30" />
          </div>
          {/* Stripes illustration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform opacity-40"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={Stripes}
              width={768}
              height={432}
              alt="Stripes"
            />
          </div>
          
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-4 border-y text-3xl font-extrabold text-white [border-image:linear-gradient(to_right,transparent,rgba(255,107,53,0.3),transparent)1] md:mb-6 md:text-4xl">
              L'aventure sans voiture commence ici.
            </h2>
            <p className="mx-auto max-w-xl text-slate-300 text-sm md:text-base mb-8">
              Rejoignez plus de 10 000 randonneurs qui s'évadent chaque week-end en TER et bus locaux. Téléchargez l'application gratuitement et marchez l'esprit tranquille.
            </p>
            
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center gap-4">
              {/* App Store button */}
              <a
                className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-150 text-gray-900 shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
                href="#download-ios-cta"
              >
                <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.11.09 2.24-.55 2.94-1.39z"/>
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[9px] text-gray-500">Télécharger sur l'</p>
                  <p className="text-xs font-semibold font-sans">App Store</p>
                </div>
              </a>
              
              {/* Google Play button */}
              <a
                className="btn flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-150 text-gray-900 shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
                href="#download-android-cta"
              >
                <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 24 24">
                  <path d="M3 5.27v13.46c0 .87.69 1.45 1.5 1.45.28 0 .54-.08.79-.24l11.16-6.45-3.12-3.12L3 5.27zm18.23 5.8L17.76 8.9l-2.78 2.78 2.78 2.78 3.47-2.01c.75-.43.75-1.13 0-1.58zM4.53 3.53C4.28 3.37 4.02 3.3 3.75 3.3c-.81 0-1.5.58-1.5 1.45l9.28 9.28 3.09-3.09L4.53 3.53zm9.09 11.23l-3.09-3.09L1.25 20.95c.25.16.51.24.78.24.81 0 1.5-.58 1.5-1.45l10.09-5.83-2.18-2.18z"/>
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[9px] text-gray-500">Disponible sur</p>
                  <p className="text-xs font-semibold font-sans">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
