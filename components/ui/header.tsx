import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Primary & Secondary Action Buttons */}
          <ul className="flex flex-1 items-center justify-end gap-2.5 md:gap-3">
            <li className="hidden sm:block">
              <Link
                href="#download-ios"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 shadow-xs rounded-xl px-3 py-1.5 font-bold text-xs transition duration-150 block text-center"
              >
                Télécharger l'application
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="bg-[color:var(--color-brand-orange)] hover:bg-[color:var(--color-brand-orange-hover)] text-white shadow-sm rounded-xl px-4 py-1.5 font-bold text-xs transition duration-150 block text-center"
              >
                <span className="hidden sm:inline">Créer un compte gratuitement</span>
                <span className="sm:hidden">Créer un compte</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
