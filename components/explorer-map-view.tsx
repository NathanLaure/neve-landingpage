"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
import { RotateCcw } from "lucide-react";
import { getHikeTraces, getHikesInBounds } from "@/lib/hikes";
import HikeDetailPanel from "@/components/hike-detail-panel";
import HikePanel, {
  PANEL_TRANSITION_MS,
  panelWidthPx,
  type HikeSort,
} from "@/components/explorer/hike-panel";
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

/**
 * Seuil d'apparition des tracés, et plafond par requête. Mêmes valeurs que
 * `hikeTraceService` dans l'application.
 *
 * Plus le seuil est bas, plus le cadre est large et plus le plafond mord : au
 * delà de soixante randonnées visibles, les tracés dessinés ne sont qu'un
 * échantillon de ce qu'on voit.
 */
const TRACE_MIN_ZOOM = 9;
const MAX_TRACES_PER_REQUEST = 60;

/**
 * Couleur du tracé selon la difficulté, avec les jetons des étiquettes de
 * difficulté des cartes — c'est le mode retenu par l'application.
 */
const TRACE_COLORS: Record<string, string> = {
  facile: "#0D542B",
  modere: "#7B3306",
  difficile: "#82181A",
  expert: "#82181A",
};

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
 * Rayon que décrit le cadre visible : du centre au bord le plus proche.
 *
 * C'est la lecture inverse du cadrage sur un cercle. Le bord le plus proche et
 * non le plus lointain : un cadre de 16/9 déborde largement le cercle en
 * largeur, et annoncer cette moitié-là promettrait des randonnées que la
 * hauteur ne montre pas.
 */
function viewportRadiusKm(map: mapboxgl.Map): number | null {
  const bounds = map.getBounds();
  if (!bounds) return null;

  const center = { lat: map.getCenter().lat, lng: map.getCenter().lng };
  const toNorth = distanceKm(center, { lat: bounds.getNorth(), lng: center.lng });
  const toEast = distanceKm(center, { lat: center.lat, lng: bounds.getEast() });

  return Math.max(1, Math.round(Math.min(toNorth, toEast)));
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
  /* Le cadrage automatique n'a lieu qu'a l'arrivee : apres une recherche de
     zone, recadrer sur les resultats deplacerait la carte que l'utilisateur
     vient de choisir, et rappellerait aussitot le bouton. */
  const hasAutoFittedRef = useRef(false);

  /*
   * Randonnées réellement affichées. Elles arrivent du serveur au premier
   * rendu — c'est ce que voient les moteurs — puis c'est le cadre de la carte
   * qui les renouvelle.
   */
  const [areaHikes, setAreaHikes] = useState<HikeSummary[]>(hikes);
  /* Randonnée survolée dans le panneau, dont le tracé passe devant les autres.
     Distincte de la sélection : survoler montre, cliquer choisit. */
  const [hoveredHikeId, setHoveredHikeId] = useState<string | null>(null);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);
  /* Rayon lu sur le cadre courant, que la chip affiche. Il suit la carte à
     chaque déplacement : un rayon figé cesserait de décrire ce qu'on regarde
     dès le premier glissement. */
  const [shownRadiusKm, setShownRadiusKm] = useState<number | null>(null);
  /* La carte se crée une fois, le rayon change : ses écouteurs le lisent ici. */
  const radiusKmRef = useRef<number | null>(radiusKm);
  useEffect(() => {
    radiusKmRef.current = radiusKm;
  }, [radiusKm]);

  /* Centre et zoom de la dernière recherche, pour mesurer ce qui a bougé
     depuis. En ref : les comparer ne doit pas provoquer de rendu. */
  const lastSearchRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  /* La carte se cree une fois ; passer le callback par une ref evite de le
     mettre dans les dependances de cet effet, ce qui la recreerait. */
  const searchThisAreaRef = useRef<(() => Promise<void>) | null>(null);
  /* Meme raison : la carte se cree une fois, le rafraichissement des traces
     change a chaque rendu. */
  const refreshTracesRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => setAreaHikes(hikes), [hikes]);

  const filteredHikes = useMemo(
    () => areaHikes.filter((hike) => matchesFilters(hike, filters)),
    [areaHikes, filters],
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

  const detailHike = detailHikeId ? areaHikes.find((hike) => hike.id === detailHikeId) : undefined;

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

    /*
     * Source et couches des tracés, posées dès que le style est prêt et
     * recréées à chaque changement de style — Mapbox vide tout en le
     * remplaçant.
     *
     * Deux couches : un liseré blanc dessous, la ligne colorée dessus. C'est ce
     * qui garde un tracé lisible sur une photo satellite comme sur un fond
     * clair. Le `minzoom` est porté par la couche : en deçà, Mapbox ne dessine
     * simplement pas.
     */
    /*
     * Pas de `isStyleLoaded()` en garde : il ne dit pas « le style est prêt »
     * mais « le style et toutes ses tuiles sont chargés », et il est donc faux
     * au moment même où `style.load` vient de se déclencher. Les deux
     * évènements écoutés n'arrivent, eux, que sur un style chargé.
     */
    const addTraceLayers = () => {
      if (map.getSource("hike-traces")) return;

      /* `promoteId` : l'état de survol se pose par identifiant de figure, et
         mapbox n'accepte que des nombres pour une source GeoJSON. Promouvoir
         la propriété laisse s'en servir avec nos UUID. */
      map.addSource("hike-traces", {
        type: "geojson",
        promoteId: "hikeId",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "hike-traces-casing",
        type: "line",
        source: "hike-traces",
        minzoom: TRACE_MIN_ZOOM,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#FFFFFF",
          "line-width": ["case", ["boolean", ["feature-state", "hovered"], false], 9, 6],
          "line-opacity": ["case", ["boolean", ["feature-state", "dimmed"], false], 0.2, 0.9],
        },
      });
      map.addLayer({
        id: "hike-traces-line",
        type: "line",
        source: "hike-traces",
        minzoom: TRACE_MIN_ZOOM,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["case", ["boolean", ["feature-state", "hovered"], false], 5, 3],
          "line-opacity": ["case", ["boolean", ["feature-state", "dimmed"], false], 0.45, 1],
        },
      });

      /* Les couches renaissent vides : c'est au rafraîchissement de les
         repeupler, le cache ayant déjà les tracés. */
      void refreshTracesRef.current?.();
    };

    /*
     * `styledata` autant que `style.load` : changer de fond de carte ne
     * recharge pas le style, il le diffe — et le diff supprime toute source
     * posée à la main, sans réémettre `style.load`. C'est ce qui effaçait les
     * tracés. La garde de `addTraceLayers` rend le second appel gratuit quand
     * les couches sont déjà en place.
     */
    map.on("style.load", addTraceLayers);
    map.on("styledata", addTraceLayers);
    map.on("moveend", renderMarkers);
    map.on("moveend", () => void refreshTracesRef.current?.());
    map.on("rotate", () => setBearing(map.getBearing()));

    /* Le bouton n'apparaît qu'au-delà des seuils, et jamais avant la première
       recherche : `fitBounds` déplace la carte au montage, ce n'est pas
       l'utilisateur qui l'a bougée. */
    map.on("moveend", () => {
      const last = lastSearchRef.current;
      if (!last) return;

      const center = map.getCenter();
      const moved = distanceKm(last, { lat: center.lat, lng: center.lng });
      const zoomed = Math.abs(last.zoom - map.getZoom());
      if (moved > 0.8 || zoomed > 0.4) setShowSearchArea(true);
    });

    /*
     * Première recherche automatique, sans bouton : c'est l'arrivée sur la
     * page, personne n'a rien déplacé. Le bouton n'a de sens que pour un
     * cadre qu'on a soi-même choisi.
     */
    map.once("idle", () => {
      const center = map.getCenter();
      lastSearchRef.current = { lat: center.lat, lng: center.lng, zoom: map.getZoom() };
      if (radiusKmRef.current === null) setShownRadiusKm(viewportRadiusKm(map));
      if (!hasLocation) void searchThisAreaRef.current?.();
    });

    return () => {
      map.off("moveend", renderMarkers);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- création unique
  }, [mapboxToken, renderMarkers]);

  /*
   * Redimensionnement du canevas quand son conteneur change de largeur.
   *
   * Le `trackResize` de mapbox ne suffit pas ici : replier le panneau élargit
   * bien le cadre, mais le canevas garde ses anciennes dimensions et laisse
   * une bande vide à droite. On observe donc le conteneur nous-mêmes, ce qui
   * couvre du même coup le redimensionnement de la fenêtre.
   *
   * L'observateur se déclenche à chaque image de la transition de largeur, ce
   * qui est voulu : la carte s'élargit avec le panneau plutôt que de sauter
   * une fois l'animation finie.
   */
  useEffect(() => {
    const container = mapContainerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [mapboxToken]);

  /**
   * Amortit le repli du panneau : le canevas garde la plus grande des deux
   * tailles pendant toute l'animation.
   *
   * Redimensionner un canevas WebGL vide sa mémoire graphique, et mapbox ne
   * repeint qu'à l'image suivante. Chaque redimensionnement laisse donc une
   * image de cadre nu — et comme la largeur change à chaque image pendant les
   * trois cents millisecondes, la carte blanchit tout du long.
   *
   * En figeant ici la largeur du conteneur, l'observateur ne se déclenche plus
   * pendant l'animation : c'est le cadre, qui rogne déjà, qui fait le travail.
   * Il ne reste qu'un seul redimensionnement par bascule, et il tombe du côté
   * où rien ne se voit — au début quand la carte s'élargit, à la fin quand elle
   * rétrécit.
   */
  const handleCollapseChange = useCallback((isCollapsed: boolean) => {
    const container = mapContainerRef.current;
    if (!container) return;

    const gained = panelWidthPx(!isCollapsed) - panelWidthPx(isCollapsed);
    container.style.width = `${container.clientWidth + Math.max(0, gained)}px`;

    /* La transition porte sur le panneau et non sur ce conteneur : aucun
       `transitionend` ne remontera jusqu'ici, on se cale sur sa durée. */
    window.setTimeout(() => {
      container.style.width = "";
    }, PANEL_TRANSITION_MS + 20);
  }, []);

  /*
   * Fond de carte déjà appliqué. Sans cette garde, l'effet rejouait au montage
   * un `setStyle` vers le style que la carte venait de recevoir : mapbox le
   * traite par diff, et le diff supprimait la source des tracés à l'instant où
   * `style.load` venait de la poser.
   */
  const appliedStyleRef = useRef(styleOptions[0].url);

  useEffect(() => {
    if (appliedStyleRef.current === mapStyle) return;
    appliedStyleRef.current = mapStyle;
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

    if (!hasAutoFittedRef.current) {
      hasAutoFittedRef.current = true;
      const bounds = new mapboxgl.LngLatBounds();
      located.forEach((hike) => bounds.extend([hike.start_lng, hike.start_lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 });
    }

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

  /*
   * Point de position, aux cotes de `ExplorerMap` dans l'application : un point
   * de 14 px en `Primary/500` bordé de blanc, sur un halo de 28 px à 35 %.
   *
   * Marqueur maintenu dans une ref plutôt que recréé : il survit aux rendus, et
   * `setLngLat` le déplace sans le retirer de la carte.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition) return;

    const halo = document.createElement("div");
    halo.className = "flex size-8 items-center justify-center";
    halo.innerHTML = `
      <span style="width:28px;height:28px;border-radius:14px;background:#FA6415;opacity:0.35;position:absolute"></span>
      <span style="width:14px;height:14px;border-radius:7px;background:#FA6415;border:2px solid #FFFFFF;position:absolute"></span>
    `;

    const marker = new mapboxgl.Marker({ element: halo })
      .setLngLat([userPosition.lng, userPosition.lat])
      .addTo(map);

    /* Accolades : `remove()` rend le marqueur, et un nettoyage d'effet doit
       ne rien rendre du tout. */
    return () => {
      marker.remove();
    };
  }, [userPosition]);

  /**
   * Recherche dans le cadre visible.
   *
   * Mêmes seuils que l'accueil de l'application : le bouton n'apparaît qu'au-delà
   * de 800 m de déplacement ou de 0,4 de zoom. En deçà, on regarde toujours la
   * même chose, et un bouton qui clignote à chaque frémissement de la carte
   * finit par ne plus rien vouloir dire.
   */
  const handleSearchThisArea = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    setIsSearchingArea(true);
    setShowSearchArea(false);

    const { hikes: found, error } = await getHikesInBounds({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    });

    setIsSearchingArea(false);
    if (error) return;

    setAreaHikes(found);
    /* La chip décrit la zone recherchée, et c'est ici qu'elle change. Suivre le
       cadre à chaque frémissement la ferait mentir dans l'autre sens : le
       nombre changerait alors que la liste, elle, n'aurait pas bougé. */
    setShownRadiusKm(viewportRadiusKm(map));
    const center = map.getCenter();
    lastSearchRef.current = { lat: center.lat, lng: center.lng, zoom: map.getZoom() };
  }, []);

  useEffect(() => {
    searchThisAreaRef.current = handleSearchThisArea;
  }, [handleSearchThisArea]);

  /**
   * Tracés des randonnées visibles, au-delà de `TRACE_MIN_ZOOM`.
   *
   * Le cache est une ref et non un état : il grossit à chaque déplacement, et
   * le redessin ne dépend pas de lui mais de la source GeoJSON qu'on met à
   * jour à la main. Un tracé déjà connu n'est jamais redemandé.
   */
  const tracesRef = useRef<Map<string, number[][]>>(new Map());

  /*
   * Tracés réellement posés dans la source, et celui à mettre en avant.
   *
   * Les deux sont des refs : la surbrillance passe par l'état de figure de
   * mapbox, qui se règle sur la carte sans repasser par un rendu React. En
   * dépendance de `refreshTraces`, le survol relancerait un `setData` de
   * soixante tracés — dix-huit mille points redessinés pour épaissir un trait.
   */
  const drawnTraceIdsRef = useRef<string[]>([]);
  const highlightedIdRef = useRef<string | null>(null);

  /**
   * Applique la surbrillance aux tracés posés.
   *
   * Rappelée après chaque `setData` : changer les données d'une source GeoJSON
   * remet à zéro l'état de ses figures.
   */
  const applyTraceHighlight = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("hike-traces")) return;

    /* Estomper n'a de sens que si quelque chose ressort : survoler une
       randonnée dont le tracé n'est pas dessiné ne doit pas effacer les
       autres pour rien. */
    const wanted = highlightedIdRef.current;
    const highlighted = wanted !== null && drawnTraceIdsRef.current.includes(wanted) ? wanted : null;

    drawnTraceIdsRef.current.forEach((id) => {
      map.setFeatureState(
        { source: "hike-traces", id },
        { hovered: id === highlighted, dimmed: highlighted !== null && id !== highlighted },
      );
    });
  }, []);

  const refreshTraces = useCallback(async () => {
    const map = mapRef.current;
    const source = map?.getSource("hike-traces") as mapboxgl.GeoJSONSource | undefined;
    if (!map || !source) return;

    /* En deçà du seuil, on vide plutôt que de laisser un dessin périmé : les
       couches ont bien un `minzoom`, mais la source garderait des tracés d'une
       zone qu'on a quittée. */
    if (map.getZoom() < TRACE_MIN_ZOOM) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const bounds = map.getBounds();
    if (!bounds) return;

    const visible = areaHikes
      .filter(
        (hike) =>
          hike.start_lat >= bounds.getSouth() &&
          hike.start_lat <= bounds.getNorth() &&
          hike.start_lng >= bounds.getWest() &&
          hike.start_lng <= bounds.getEast(),
      )
      .slice(0, MAX_TRACES_PER_REQUEST);

    /*
     * La randonnée survolée s'ajoute au-delà du plafond.
     *
     * Le panneau en liste bien plus que soixante : sans cette exception, le
     * survol ne ferait rien pour l'écrasante majorité des cartes, ce qui est
     * pire qu'un survol sans effet — les autres tracés s'estomperaient autour
     * d'un tracé absent.
     */
    const wanted = highlightedIdRef.current;
    if (wanted !== null && !visible.some((hike) => hike.id === wanted)) {
      const extra = areaHikes.find((hike) => hike.id === wanted);
      if (extra) visible.push(extra);
    }

    const missing = visible.filter((hike) => !tracesRef.current.has(hike.id)).map((h) => h.id);
    if (missing.length > 0) {
      const { traces, error } = await getHikeTraces(missing);
      if (error) console.warn("[tracés] chargement impossible", error);
      traces.forEach(({ id, geometry }) => {
        /* Un `MultiLineString` est aplati sur son premier segment : le rendu
           n'a pas à connaître deux formes pour dessiner la même chose. */
        const coordinates =
          geometry.type === "LineString"
            ? (geometry.coordinates as number[][])
            : ((geometry.coordinates as number[][][])[0] ?? []);
        if (coordinates.length > 1) tracesRef.current.set(id, coordinates);
      });
    }

    const drawn = visible.filter((hike) => tracesRef.current.has(hike.id));
    drawnTraceIdsRef.current = drawn.map((hike) => hike.id);

    source.setData({
      type: "FeatureCollection",
      features: drawn.map((hike) => ({
        type: "Feature" as const,
        properties: {
          hikeId: hike.id,
          color: TRACE_COLORS[hike.difficulty] ?? TRACE_COLORS.modere,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: tracesRef.current.get(hike.id) as number[][],
        },
      })),
    });

    applyTraceHighlight();
  }, [areaHikes, applyTraceHighlight]);

  useEffect(() => {
    refreshTracesRef.current = refreshTraces;
    void refreshTraces();
  }, [refreshTraces]);

  useEffect(() => {
    highlightedIdRef.current = hoveredHikeId;

    /* Tracé pas encore dessiné : c'est le rafraîchissement qui va le chercher,
       et qui rappellera la surbrillance une fois la source à jour. */
    if (hoveredHikeId !== null && !drawnTraceIdsRef.current.includes(hoveredHikeId)) {
      void refreshTracesRef.current?.();
      return;
    }

    applyTraceHighlight();
  }, [hoveredHikeId, applyTraceHighlight]);

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
  /*
   * Le rayon choisi cadre la carte.
   *
   * Sans cela, choisir 100 km rechargeait la liste sans rien changer à l'écran :
   * un rayon qu'on ne voit pas ne veut rien dire. `padding: 0` est délibéré —
   * une marge élargirait le cadre au-delà du rayon demandé, et la chip, qui se
   * lit sur le cadre, annoncerait aussitôt un autre nombre que celui qu'on
   * vient de choisir.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || radiusKm === null) return;

    const center = userPosition ?? { lat: centerLat, lng: centerLng };
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));

    /* Le cadrage sur les marqueurs n'a plus lieu d'être : le rayon dit déjà
       quoi montrer, et deux cadrages successifs se disputeraient la carte. */
    hasAutoFittedRef.current = true;
    /* La chip redit le rayon demandé, et non ce que le recadrage donne une fois
       mesuré : la projection décale le centre, cent kilomètres en rendent
       quatre-vingt-dix-neuf, et voir 99 après avoir cliqué 100 passerait pour
       une panne. */
    setShownRadiusKm(radiusKm);

    map.fitBounds(
      [
        [center.lng - lngDelta, center.lat - latDelta],
        [center.lng + lngDelta, center.lat + latDelta],
      ],
      { padding: 0, duration: 700 },
    );

    /* Ce déplacement-là n'est pas celui de l'utilisateur : le serveur a déjà
       chargé ce rayon, proposer de rechercher la zone n'aurait aucun sens. */
    const afterFit = () => {
      const next = map.getCenter();
      lastSearchRef.current = { lat: next.lat, lng: next.lng, zoom: map.getZoom() };
      setShowSearchArea(false);
      map.off("moveend", afterFit);
    };
    map.on("moveend", afterFit);

    /* Accolades : `off()` rend la carte, et un nettoyage d'effet ne rend rien. */
    return () => {
      map.off("moveend", afterFit);
    };
  }, [radiusKm, userPosition, centerLat, centerLng]);

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
        /* Retenue ici aussi, et pas seulement dans l'adresse : c'est elle qui
           pose le point sur la carte et qui débloque le tri par proximité. */
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });

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
      onHover={setHoveredHikeId}
      onCollapseChange={handleCollapseChange}
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
      <div className="hidden flex-1 flex-col pr-6 pb-6 md:flex">
        {/* Les filtres sont posés au-dessus du cadre et non sur la carte : la
            bande les aligne sur le titre du panneau, et la carte garde son
            fond entier. */}
        <div className="flex items-center justify-center py-4">
          <MapFilters
            filters={filters}
            onChange={setFilters}
            onOpenAll={() => setIsFiltersOpen(true)}
            radiusKm={radiusKm}
            shownRadiusKm={shownRadiusKm}
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

          {/* Bouton de recherche de zone, centré en bas du cadre comme sur
              mobile. Il ne se montre qu'une fois la carte réellement déplacée. */}
          {(showSearchArea || isSearchingArea) && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
              <button
                type="button"
                onClick={handleSearchThisArea}
                disabled={isSearchingArea}
                className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-neve-button-secondary px-5 py-2.5 font-satoshi text-sm font-bold text-neve-button-secondary-text shadow-lg transition disabled:opacity-70"
              >
                <RotateCcw className={`size-4 ${isSearchingArea ? "animate-spin" : ""}`} />
                {isSearchingArea ? "Recherche…" : "Rechercher dans cette zone"}
              </button>
            </div>
          )}
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
