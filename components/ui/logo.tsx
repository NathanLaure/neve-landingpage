import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-slate-900"}`} aria-label="Névé">
      <svg className="w-7 h-7 text-[color:var(--color-brand-orange)] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract double mountain peak shape */}
        <path d="M12 4 L22 20 L2 20 Z" className="opacity-20" />
        <path d="M8 8 L18 20 L2 20 Z" />
      </svg>
      <span className="font-extrabold text-xl tracking-tight font-sans">Névé</span>
    </Link>
  );
}
