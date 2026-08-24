"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
import HikeDetailPanel from "@/components/hike-detail-panel";
import HikePanel, { type HikeSort } from "@/components/explorer/hike-panel";
import MapFilters from "@/components/explorer/map-filters";
import FiltersModal from "@/components/explorer/filters-modal";
import {
  EMPTY_FILTERS,
  matchesFilters,
  type ExplorerFilters,
} from "@/lib/explorer-filters";
import MapControls from "@/components/explorer/map-controls";
import MapStylePicker, { buildStyleOptions } from "@/components/explorer/map-style-picker";
import type { HikeSummary } from "@/types/hike";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { hasNavigoPass, isInNavigoZone } from "@/lib/navigo";
import { formatDifficultyLabel, formatDistance, formatDuration, formatElevation } from "@/lib/format-hike";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type Props = {
  /** Nom du lieu quand on arrive centré dessus, depuis une page de ville. */
  areaName?: string;
  hikes: HikeSummary[];
  fetchError?: string | null;
  /** Centre avant l'ajustement aux marqueurs, ou faute de randonnée. */
  centerLat: number;
  centerLng: number;
  /** Rayon courant, `null` pour « depuis le marqueur ». */
  radiusKm?: number | null;
  /** Un lieu est-il défini, par recherche ou géolocalisation ? */
  hasLocation?: boolean;
};

/** Au-delà de ce zoom, supercluster rend les points un par un. */
const CLUSTER_MAX_ZOOM = 13;

type HikePointProps = { hikeId: string };

/** Distance à vol d'oiseau en kilomètres, suffisante pour trier une liste. */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Explorateur : la liste des itinéraires à gauche, la carte à droite.
 *
 * Le panneau est ancré et non posé par-dessus la carte. Un panneau flottant
 * mange en permanence le tiers gauche du fond de carte, qui n'est alors ni lu
 * ni disponible ; ancré, chaque moitié a sa place et le repli rend vraiment de
 * la largeur.
 *
 * **La carte n'est pas rendue sur mobile.** Elle y demanderait deux mains et
 * toute la hauteur pour rester utile, au prix de la liste qui est ce qu'on
 * vient chercher. Le tracé d'une randonnée reste consultable sur sa fiche, et
 * l'application fait le reste.
 */
export default function ExplorerMapView({
  hikes,
  fetchError = null,
  centerLat,
  centerLng,
  radiusKm = null,
  hasLocation = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hikeQuery = searchParams.get("hike");
  const { user, profile, openAuthModal } = useAuth();
  const { isFavorite, isPending: isFavoritePending, toggleFavorite } = useFavorites();

  /* Le visiteur anonyme est invité à se connecter plutôt qu'ignoré : un cœur
     qui ne fait rien est pire que pas de cœur du tout. */
  const handleFavoriteClick = useCallback(
    (hikeId: string) => {
      if (!user) {
        openAuthModal();
        return;
      }
      toggleFavorite(hikeId);
    },
    [user, openAuthModal, toggleFavorite],
  );

  /* Le pass se lit une fois pour tout l'ecran ; la zone, randonnee par
     randonnee. Sans pass declare, aucun badge : qui n'a pas d'abonnement n'a
     que faire de savoir lesquelles il couvrirait. */
  const userHasNavigo = useMemo(() => hasNavigoPass(user, profile), [user, profile]);

  const showsNavigoBadge = useCallback(
    (hike: HikeSummary) =>
      userHasNavigo &&
      isInNavigoZone({ lat: hike.start_lat, lng: hike.start_lng, locationName: hike.location_name }),
    [userHasNavigo],
  );

  const [filters, setFilters] = useState<ExplorerFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<HikeSort>("distance");
  const [activeHikeId, setActiveHikeId] = useState<string | null>(null);
  const [detailHikeId, setDetailHikeId] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  /* Un échec de géolocalisation doit se voir : refus, indisponibilité et
     expiration se règlent tous les trois ailleurs que sur cette page. */
  const [locationError, setLocationError] = useState<string | null>(null);
  const [bearing, setBearing] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const styleOptions = useMemo(() => buildStyleOptions(mapboxToken ?? ""), [mapboxToken]);
  const [mapStyle, setMapStyle] = useState<string>(styleOptions[0].url);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const superclusterRef = useRef<Supercluster<HikePointProps> | null>(null);
  const hikesByIdRef = useRef<Map<string, HikeSummary>>(new Map());
  /* Posé quand la randonnée visée est encore dans un agrégat : `renderMarkers`
     ouvre son infobulle une fois le zoom l'en ayant sortie. */
  const pendingPopupHikeIdRef = useRef<string | null>(null);

  const filteredHikes = useMemo(
    () => hikes.filter((hike) => matchesFilters(hike, filters)),
    [hikes, filters],
  );

  const sortedHikes = useMemo(() => {
    const list = [...filteredHikes];

    if (sort === "nearest" && userPosition) {
      return list.sort(
        (a, b) =>
          distanceKm(userPosition, { lat: a.start_lat, lng: a.start_lng }) -
          distanceKm(userPosition, { lat: b.start_lat, lng: b.start_lng }),
      );
    }
    if (sort === "duration") return list.sort((a, b) => a.duration_minutes - b.duration_minutes);
    return list.sort((a, b) => a.distance_km - b.distance_km);
  }, [filteredHikes, sort, userPosition]);

  const detailHike = detailHikeId ? hikes.find((hike) => hike.id === detailHikeId) : undefined;

  /* Arrivée par `?hike=` : la fiche s'ouvre directement, c'est ce que promet un
     lien qui nomme une randonnée. */
  useEffect(() => {
    if (!hikeQuery) return;
    if (hikes.some((hike) => hike.id === hikeQuery)) {
      setActiveHikeId(hikeQuery);
      setDetailHikeId(hikeQuery);
    }
  }, [hikeQuery, hikes]);

  /*
   * Rend ce que l'index d'agrégats dit du cadre courant : pastilles groupées ou
   * marqueurs individuels. Identité stable — tout passe par des refs, la
   * fonction peut donc servir d'écouteur mapbox sans jamais se périmer.
   */
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const index = superclusterRef.current;
    if (!map || !index) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = map.getBounds();
    if (!bounds) return;
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    index.getClusters(bbox, Math.round(map.getZoom())).forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if ("cluster" in props && props.cluster) {
        const count = props.point_count as number;
        const clusterId = props.cluster_id as number;
        const size = count < 10 ? 38 : count < 50 ? 46 : count < 150 ? 54 : 62;

        /* Mapbox possède le `transform` de l'élément racine pour l'y placer :
           tout le style de survol va sur cet enfant, sinon on écrase sa
           translation et le marqueur disparaît. */
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        const inner = document.createElement("div");
        inner.style.width = `${size}px`;
        inner.style.height = `${size}px`;
        inner.style.fontSize = count < 100 ? "13px" : "12px";
        inner.className =
          "flex items-center justify-center rounded-full bg-brand-orange text-white font-bold shadow-lg border-2 border-white transition-transform duration-150";
        inner.textContent = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);
        el.appendChild(inner);

        el.addEventListener("mouseenter", () => {
          inner.style.transform = "scale(1.1)";
        });
        el.addEventListener("mouseleave", () => {
          inner.style.transform = "scale(1)";
        });
        el.addEventListener("click", () => {
          const expansionZoom = Math.min(
            index.getClusterExpansionZoom(clusterId),
            CLUSTER_MAX_ZOOM + 2,
          );
          map.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
        });

        markersRef.current[`cluster-${clusterId}`] = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        return;
      }

      const hike = hikesByIdRef.current.get((props as HikePointProps).hikeId);
      if (!hike) return;

      const el = document.createElement("div");
      el.className = "cursor-pointer";
      const inner = document.createElement("div");
      inner.className =
        "flex items-center justify-center w-8 h-8 bg-[#EB490B] rounded-full border-2 border-white shadow-[0px_3px_10px_rgba(0,0,0,0.25)] transition-transform duration-150";
      inner.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      `;
      el.appendChild(inner);

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="font-family: var(--font-bricolage, sans-serif); padding: 4px; max-width: 190px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #1c1914;">${hike.title}</div>
          <div style="font-size: 11px; color: #575246;">${formatDistance(hike.distance_km)} · ${formatDuration(hike.duration_minutes)} · D+ ${formatElevation(hike.elevation_gain_m)}</div>
          <div style="font-size: 11px; color: #575246; margin-top: 2px;">${formatDifficultyLabel(hike.difficulty)}</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => setActiveHikeId(hike.id));

      markersRef.current[hike.id] = marker;

      if (pendingPopupHikeIdRef.current === hike.id) {
        pendingPopupHikeIdRef.current = null;
        marker.togglePopup();
      }
    });
  }, []);

  /* Création de la carte. */
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    const located = hikes.find((hike) => hike.start_lat && hike.start_lng);
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleOptions[0].url,
      center: located ? [located.start_lng, located.start_lat] : [centerLng, centerLat],
      zoom: 10,
      /* Les contrôles maison remplacent ceux de mapbox : deux jeux de boutons
         pour les mêmes gestes seraient deux fois trop. */
      attributionControl: true,
    });

    mapRef.current = map;
    map.on("moveend", renderMarkers);
    map.on("rotate", () => setBearing(map.getBearing()));

    return () => {
      map.off("moveend", renderMarkers);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- création unique
  }, [mapboxToken, renderMarkers]);

  useEffect(() => {
    mapRef.current?.setStyle(mapStyle);
  }, [mapStyle]);

  /* Reconstruction de l'index d'agrégats à chaque changement de filtre. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken) return;

    hikesByIdRef.current = new Map(filteredHikes.map((hike) => [hike.id, hike]));

    const located = filteredHikes.filter((hike) => hike.start_lat && hike.start_lng);
    const index = new Supercluster<HikePointProps>({ radius: 60, maxZoom: CLUSTER_MAX_ZOOM });
    index.load(
      located.map((hike) => ({
        type: "Feature" as const,
        properties: { hikeId: hike.id },
        geometry: { type: "Point" as const, coordinates: [hike.start_lng, hike.start_lat] },
      })),
    );
    superclusterRef.current = index;

    if (located.length === 0) {
      renderMarkers();
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    located.forEach((hike) => bounds.extend([hike.start_lng, hike.start_lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 });

    /* `fitBounds` déclenchera `moveend`, mais on rend tout de suite : sinon les
       marqueurs n'apparaissent qu'au bout de l'animation. */
    renderMarkers();
  }, [filteredHikes, mapboxToken, renderMarkers]);

  /* Randonnée sélectionnée : on y vole et on ouvre son infobulle. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapboxToken || !activeHikeId) return;

    const hike = filteredHikes.find((item) => item.id === activeHikeId);
    if (!hike) return;

    const marker = markersRef.current[hike.id];
    if (marker) {
      map.flyTo({
        center: [hike.start_lng, hike.start_lat],
        zoom: Math.max(map.getZoom(), 11.5),
        duration: 800,
      });
      Object.values(markersRef.current).forEach((other) => {
        const popup = other.getPopup();
        if (other !== marker && popup?.isOpen()) other.togglePopup();
      });
      if (!marker.getPopup()?.isOpen()) marker.togglePopup();
      return;
    }

    /* Encore dans un agrégat : on plonge au-delà du zoom de regroupement, et
       `renderMarkers` ouvrira l'infobulle une fois le marqueur isolé. */
    pendingPopupHikeIdRef.current = hike.id;
    map.flyTo({
      center: [hike.start_lng, hike.start_lat],
      zoom: CLUSTER_MAX_ZOOM + 1,
      duration: 800,
    });
  }, [activeHikeId, filteredHikes, mapboxToken]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPosition(coords);
        setIsLocating(false);
        mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 12, duration: 900 });
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Autorise la géolocalisation dans ton navigateur pour te situer sur la carte."
            : "Ta position n’a pas pu être déterminée.",
        );
      },
      /* Même réglage que « Autour de moi » : sans `timeout`, la demande reste
         en attente indéfiniment sur un poste sans GPS. */
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  /*
   * Le rayon passe par l'adresse et non par un état local : c'est le serveur
   * qui refait la requête, et l'adresse reste partageable — « les randonnées à
   * 15 km d'Annecy » se copie et se retrouve.
   */
  const handleRadiusChange = useCallback(
    (nextRadius: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      /* « Depuis le marqueur » retire le paramètre plutôt que d'en poser un :
         c'est l'absence de borne, et l'adresse le dit ainsi. */
      if (nextRadius === null) params.delete("radius");
      else params.set("radius", String(nextRadius));
      router.replace(`/explorer?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  /*
   * Aucun centre encore : on en demande un plutôt que d'afficher un rayon
   * autour de rien.
   *
   * `timeout` est indispensable : sans lui la demande reste en attente
   * indéfiniment sur un poste sans GPS, et l'écran ne bouge jamais. Et
   * `enableHighAccuracy` ne sert à rien ici — on cherche une ville, pas un
   * mètre carré ; il ne fait qu'allonger l'attente.
   */
  const handleSearchAroundMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Ton navigateur ne sait pas donner ta position.");
      return;
    }

    setLocationError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", position.coords.latitude.toFixed(5));
        params.set("lng", position.coords.longitude.toFixed(5));
        params.set("name", "ma position");
        router.replace(`/explorer?${params.toString()}`, { scroll: false });
      },
      (error) => {
        setIsLocating(false);
        /* Dire lequel des trois échecs s'est produit : « ça ne marche pas »
           n'indique pas que la réponse est dans les réglages du navigateur. */
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Autorise la géolocalisation dans ton navigateur pour chercher autour de toi."
            : "Ta position n’a pas pu être déterminée. Réessaie ou cherche un lieu.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [router, searchParams]);

  const panel = (
    <HikePanel
      hikes={sortedHikes}
      activeId={activeHikeId}
      onSelect={(id) => {
        setActiveHikeId(id);
        setDetailHikeId(id);
      }}
      onHover={setActiveHikeId}
      sort={sort}
      onSortChange={setSort}
      canSortByProximity={userPosition !== null}
      isFavorite={isFavorite}
      isFavoritePending={isFavoritePending}
      onFavoriteClick={handleFavoriteClick}
      showsNavigoBadge={showsNavigoBadge}
    />
  );

  return (
    /* `pt-16` et non une hauteur amputée : l'en-tête est en `fixed`, il ne
       prend aucune place dans le flux. Retrancher sa hauteur laissait autant de
       vide en bas de page. Il mesure 64 px partout hors de l'accueil, où il
       s'affiche d'emblée dans son état défilé. */
    <div className="flex h-screen bg-neve-card pt-16">
      {fetchError ? (
        <div className="flex w-full items-center justify-center px-6">
          <p className="text-center font-satoshi text-sm text-neve-text-muted">
            Les randonnées n’ont pas pu être chargées. Réessaie dans un instant.
          </p>
        </div>
      ) : (
        panel
      )}

      {/* Colonne de droite : les filtres en bande, puis la carte encadrée.
          Absente sur mobile — voir l'en-tête du composant. */}
      <div className="hidden flex-1 flex-col pr-6 pb-6 pl-2 md:flex">
        {/* Les filtres sont posés au-dessus du cadre et non sur la carte : la
            bande les aligne sur le titre du panneau, et la carte garde son
            fond entier. */}
        <div className="flex items-center justify-center py-4">
          <MapFilters
            filters={filters}
            onChange={setFilters}
            onOpenAll={() => setIsFiltersOpen(true)}
            radiusKm={radiusKm}
            hasLocation={hasLocation}
            onRadiusChange={handleRadiusChange}
            onRequestLocation={handleSearchAroundMe}
          />
        </div>

        {(isLocating || locationError) && (
          <div className="pointer-events-none flex justify-center pb-2">
            <p className="pointer-events-auto rounded-full border border-neve-border bg-neve-card px-3.5 py-1.5 font-satoshi text-[13px] text-neve-text-muted">
              {isLocating ? "Recherche de ta position…" : locationError}
            </p>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden rounded-xl bg-neve-surface">
          {mapboxToken ? (
            <div ref={mapContainerRef} className="size-full" />
          ) : (
            <div className="flex size-full items-center justify-center px-8 text-center">
              <p className="font-satoshi text-sm text-neve-text-muted">
                La carte a besoin d’une clé Mapbox (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`).
              </p>
            </div>
          )}

          {/* `pointer-events-none` sur les conteneurs : sans lui, leurs zones
              vides captureraient le glissement de la carte. */}
          <div className="pointer-events-none absolute right-4 bottom-6 z-20">
            <MapControls
              bearing={bearing}
              isLocating={isLocating}
              onZoomIn={() => mapRef.current?.zoomIn({ duration: 300 })}
              onZoomOut={() => mapRef.current?.zoomOut({ duration: 300 })}
              onLocate={handleLocate}
              onResetBearing={() => mapRef.current?.easeTo({ bearing: 0, duration: 400 })}
            />
          </div>

          <div className="pointer-events-none absolute bottom-6 left-4 z-20">
            <MapStylePicker options={styleOptions} value={mapStyle} onChange={setMapStyle} />
          </div>
        </div>
      </div>

      {/* Rendue hors des colonnes : elle couvre l'écran entier, panneau compris. */}
      <FiltersModal
        open={isFiltersOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setIsFiltersOpen(false)}
        resultCount={filteredHikes.length}
      />

      {detailHike && (
        <HikeDetailPanel summary={detailHike} onClose={() => setDetailHikeId(null)} />
      )}
    </div>
  );
}
