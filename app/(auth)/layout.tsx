import Image from "next/image";
import Logo from "@/components/ui/logo";
import AuthBg from "@/public/images/auth-bg.svg";
import PromoPhone3 from "@/public/images/promo-phone-3.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="absolute z-30 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Site branding */}
            <div className="mr-4 shrink-0">
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex grow">
        <div
          className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 opacity-70 blur-[160px]"></div>
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="flex h-full flex-col justify-center before:min-h-[4rem] before:flex-1 after:flex-1 md:before:min-h-[5rem]">
            <div className="px-6 sm:px-10 md:px-16">
              <div className="mx-auto w-full max-w-sm">
                <div className="py-16 md:py-20">{children}</div>
              </div>
            </div>
          </div>
        </div>

        <>
          {/* Right side */}
          <div className="relative my-6 mr-6 hidden w-[572px] shrink-0 overflow-hidden rounded-2xl lg:block">
            {/* Background */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -ml-24 -translate-x-1/2 -translate-y-1/2 bg-blue-50"
              aria-hidden="true"
            >
              <Image
                src={AuthBg}
                className="max-w-none"
                width={1285}
                height={1684}
                alt="Auth bg"
              />
            </div>
            {/* Illustration */}
            <div className="absolute inset-0 flex items-center justify-center px-10">
              <div className="w-full max-w-sm rounded-3xl border-2 border-[#0f172b] bg-[#fff6ed] p-8 text-center shadow-xl">
                <Image
                  src={PromoPhone3}
                  alt="Application Névé Carte et Itinéraire"
                  className="mx-auto h-auto w-40 object-contain drop-shadow-xl"
                  priority
                />
                <p className="mt-6 font-bricolage text-xl font-extrabold text-[#292929]">
                  Emportez Névé dans votre poche
                </p>
                <p className="mt-2 text-sm font-medium text-[#525252]">
                  Cartes hors-ligne, tracés GPX et planification de vos
                  randonnées sans voiture, directement sur l&apos;app.
                </p>
              </div>
            </div>
          </div>
        </>
      </main>
    </>
  );
}
