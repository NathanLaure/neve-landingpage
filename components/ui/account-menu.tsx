"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Compass, Heart, LogOut, Smartphone, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu({ scrolled }: { scrolled: boolean }) {
  const { user, displayName, avatarUrl, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  if (!user) return null;

  const initial = (displayName || user.email || "?").trim().charAt(0).toUpperCase();
  const showAvatarImage = !!avatarUrl && !imgFailed;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsOpen(false);
    setIsSigningOut(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border-2 border-[#0f172b] py-1 pl-1 pr-3 transition-all duration-150 cursor-pointer hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#0f172a] ${
          scrolled ? "bg-[#fff6ed] text-[#0f172b]" : "bg-white/10 text-white backdrop-blur-sm"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {showAvatarImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl!}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eb490b] text-sm font-bold text-white">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:inline">
          {displayName}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border-2 border-[#0f172b] bg-white p-2 shadow-[4px_4px_0px_0px_#0f172a] z-50">
          <div className="flex items-center gap-3 px-3 py-2">
            {showAvatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl!}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eb490b] text-base font-bold text-white">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0f172b]">{displayName}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-gray-100" />
          <Link
            href="/profil"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1C1914] hover:bg-gray-50 transition-colors"
          >
            <User className="h-4 w-4 text-[#575246]" />
            <span>Mon profil</span>
          </Link>
          <Link
            href="/favoris"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1C1914] hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-4 w-4 text-[#EB490B] fill-[#EB490B]/20" />
            <span>Mes favoris</span>
          </Link>
          <Link
            href="/explorer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0f172b] hover:bg-gray-50 transition-colors"
          >
            <Compass className="h-4 w-4 text-gray-500" />
            <span>Explorer les randonnées</span>
          </Link>
          <a
            href="#download-ios"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0f172b] hover:bg-gray-50 transition-colors"
          >
            <Smartphone className="h-4 w-4 text-gray-500" />
            <span>Télécharger l&apos;app</span>
          </a>
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{isSigningOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
