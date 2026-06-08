import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Primary Action Button */}
          <ul className="flex flex-1 items-center justify-end">
            <li>
              <Link
                href="#download-ios"
                className="btn-sm bg-[color:var(--color-brand-orange)] hover:bg-[color:var(--color-brand-orange-hover)] text-white shadow-sm rounded-lg px-4 py-1.5 font-semibold text-xs transition duration-150"
              >
                Télécharger l'app
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
