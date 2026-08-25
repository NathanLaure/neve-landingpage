"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchPlaces, type PlaceSuggestion } from "@/lib/geocode";

/** Délai avant d'interroger le géocodeur, en millisecondes. */
const DEBOUNCE_MS = 250;

/**
 * Champ de recherche de lieu de la barre applicative.
 *
 * Il ne cherche pas des randonnées mais des endroits : c'est la carte qu'il
 * déplace, et c'est elle qui dira ce qui s'y trouve. Chercher un nom de
 * randonnée demanderait un index plein texte que la base n'a pas.
 *
 * La sélection passe par l'adresse — `?lat&lng&name` — plutôt que par un état
 * partagé : l'explorateur lit déjà ces paramètres, et une recherche devient au
 * passage un lien qu'on peut copier.
 */
export default function PlaceSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* Requête en vol, abandonnée dès la frappe suivante : sans cela les réponses
     reviendraient dans le désordre et la liste clignoterait. */
  const abortRef = useRef<AbortController | null>(null);
  /* Choisir un lieu écrit son nom dans le champ, ce qui relancerait une
     recherche et rouvrirait le menu sur ce qu'on vient de fermer. */
  const justChoseRef = useRef(false);

  useEffect(() => {
    if (justChoseRef.current) {
      justChoseRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setHighlighted(-1);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const found = await searchPlaces(trimmed, { signal: controller.signal });
      if (controller.signal.aborted) return;

      setSuggestions(found);
      setHighlighted(found.length > 0 ? 0 : -1);
      setIsOpen(true);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  /* Fermeture au clic extérieur : le menu flotte au-dessus de la carte, qui
     capte tout le reste de la page. */
  useEffect(() => {
    if (!isOpen) return;

    const handle = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  const choose = useCallback(
    (place: PlaceSuggestion) => {
      justChoseRef.current = true;
      setQuery(place.name);
      setIsOpen(false);
      setSuggestions([]);
      inputRef.current?.blur();

      const params = new URLSearchParams({
        lat: String(place.lat),
        lng: String(place.lng),
        name: place.name,
      });
      router.push(`/explorer?${params.toString()}`);
    },
    [router],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const place = suggestions[highlighted] ?? suggestions[0];
      if (place) choose(place);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex h-[45px] items-center gap-3 overflow-hidden rounded-[32px] border border-neve-border bg-neve-card px-4 py-2">
        <Search className="size-6 shrink-0 text-neve-text-tertiary" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un lieu"
          aria-label="Rechercher un lieu"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          role="combobox"
          /* `border-0` et `focus:ring-0` désarment le greffon de formulaires,
             qui habille tous les `input` d'une bordure et d'un anneau bleus.
             Ici c'est la pilule qui porte la bordure, et deux contours
             imbriqués ne vont pas. */
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-satoshi text-base font-medium text-neve-text placeholder:text-neve-text-tertiary focus:border-0 focus:ring-0 focus:outline-none"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-[16px] border border-neve-border bg-neve-card p-1.5 shadow-lg"
        >
          {suggestions.map((place, index) => (
            <li key={`${place.lat},${place.lng}`} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(place)}
                className={`block w-full cursor-pointer rounded-[12px] px-3 py-2 text-left transition ${
                  index === highlighted ? "bg-neve-surface" : ""
                }`}
              >
                <span className="block font-satoshi text-sm font-medium text-neve-text">
                  {place.name}
                </span>
                {/* Le libellé complet leve les homonymes, et il y en a : deux
                    Saint-Denis, trois Sainte-Marie. */}
                <span className="block font-satoshi text-[13px] text-neve-text-muted">
                  {place.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
