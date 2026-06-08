"use client";

import { useState, useRef, MouseEvent } from "react";

type Waypoint = {
  percent: number; // 0 to 100
  name: string;
  elevation: number;
  description: string;
  type: "station" | "peak" | "refuge" | "trailhead";
};

type RouteData = {
  id: string;
  name: string;
  location: string;
  distance: string;
  elevationGain: string;
  duration: string;
  maxElevation: string;
  points: { x: number; y: number }[]; // coordinates for the SVG path (0-100 scale)
  waypoints: Waypoint[];
};

const ROUTES: RouteData[] = [
  {
    id: "chartreuse",
    name: "Traversée de la Chartreuse Occidentale",
    location: "Grenoble",
    distance: "18.2 km",
    elevationGain: "+1,120 m",
    duration: "6h00",
    maxElevation: "1,450 m",
    points: [
      { x: 0, y: 80 },    // Gare de départ (low)
      { x: 10, y: 75 },   // Trailhead
      { x: 25, y: 55 },   // First climb
      { x: 38, y: 40 },   // Mid slope
      { x: 50, y: 20 },   // Summit pass (highest)
      { x: 65, y: 35 },   // Valley descent
      { x: 78, y: 60 },   // Small ridge
      { x: 90, y: 78 },   // Downward trail
      { x: 100, y: 80 }   // Gare de retour (low)
    ],
    waypoints: [
      { percent: 0, name: "Gare de départ (Grenoble) 🚄", elevation: 215, description: "Arrivée du TER. Le bus local T64 vous attend devant le quai.", type: "station" },
      { percent: 12, name: "Départ du Sentier (Saint-Nizier) 🥾", elevation: 320, description: "Descente du bus, début de l'ascension balisée dans les sapins.", type: "trailhead" },
      { percent: 35, name: "Refuge des Allières 🏡", elevation: 840, description: "Halte eau potable et crêpes sauvages. Panorama sur Belledonne.", type: "refuge" },
      { percent: 52, name: "Passage de la Clé (Sommet) ⛰️", elevation: 1420, description: "Point culminant. Vue imprenable sur la cuvette de Grenoble.", type: "peak" },
      { percent: 75, name: "Le Désert de l'Écureuil 🌲", elevation: 650, description: "Section ombragée et fraîche sous les falaises calcaires.", type: "refuge" },
      { percent: 100, name: "Gare de retour (Grenoble) 🚄", elevation: 215, description: "TER direct retour Lyon/Paris toutes les 30 minutes.", type: "station" }
    ]
  },
  {
    id: "pilat",
    name: "Balcon du Crêt de la Perdrix",
    location: "Lyon / Saint-Chamond",
    distance: "14.5 km",
    elevationGain: "+650 m",
    duration: "4h15",
    maxElevation: "1,431 m",
    points: [
      { x: 0, y: 75 },
      { x: 15, y: 65 },
      { x: 35, y: 45 },
      { x: 55, y: 15 },   // Summit
      { x: 70, y: 25 },
      { x: 85, y: 55 },
      { x: 100, y: 75 }
    ],
    waypoints: [
      { percent: 0, name: "Gare de Saint-Chamond 🚄", elevation: 375, description: "TER direct Lyon (40 min). Navette Pilat en correspondance.", type: "station" },
      { percent: 18, name: "Le Bessat (Départ Sentier) 🥾", elevation: 610, description: "Entrée dans le Parc Naturel Régional du Pilat.", type: "trailhead" },
      { percent: 55, name: "Crêt de la Perdrix (Sommet) ⛰️", elevation: 1431, description: "Table d'orientation à 360° sur le Mont Blanc et les Cévennes.", type: "peak" },
      { percent: 80, name: "Croix de Chaubouret ⛪", elevation: 1201, description: "Descente douce à travers les forêts de hêtres et de sapins.", type: "refuge" },
      { percent: 100, name: "Gare de Saint-Chamond 🚄", elevation: 375, description: "Embarquement immédiat. Votre train est affiché en temps réel sur l'app.", type: "station" }
    ]
  },
  {
    id: "calanques",
    name: "Les Trois Calanques (Port-Pin & En-Vau)",
    location: "Marseille / Cassis",
    distance: "11.2 km",
    elevationGain: "+380 m",
    duration: "4h00",
    maxElevation: "185 m",
    points: [
      { x: 0, y: 90 },    // Port (sea level)
      { x: 15, y: 55 },   // First small hill
      { x: 30, y: 90 },   // Calanque Port-Pin (sea level)
      { x: 50, y: 40 },   // High cliffs plateau
      { x: 65, y: 95 },   // Calanque d'En-Vau (sea level)
      { x: 80, y: 45 },   // High climb back
      { x: 100, y: 90 }
    ],
    waypoints: [
      { percent: 0, name: "Gare de Cassis 🚄", elevation: 95, description: "Arrivée du train régional depuis Marseille (20 min).", type: "station" },
      { percent: 28, name: "Calanque de Port-Pin 🌊", elevation: 5, description: "Plage de galets bordée de pins d'Alep. Baignade possible.", type: "refuge" },
      { percent: 48, name: "Plateau de la Gardiole 🌵", elevation: 165, description: "Sentier rocailleux sur le plateau calcaire avec panorama mer.", type: "trailhead" },
      { percent: 66, name: "Calanque d'En-Vau 🌊", elevation: 2, description: "La plus spectaculaire des calanques, enserrée par de hautes falaises.", type: "peak" },
      { percent: 100, name: "Gare de Cassis 🚄", elevation: 95, description: "Retour vers la métropole marseillaise.", type: "station" }
    ]
  }
];

export default function RouteProfileViewer() {
  const [activeRouteId, setActiveRouteId] = useState("chartreuse");
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeRoute = ROUTES.find((r) => r.id === activeRouteId) || ROUTES[0];

  // Interpolate elevation at any given percentage (0-100)
  const getInterpolatedY = (percent: number): number => {
    const pts = activeRoute.points;
    // Find surrounding points
    let p1 = pts[0];
    let p2 = pts[pts.length - 1];

    for (let i = 0; i < pts.length - 1; i++) {
      if (percent >= pts[i].x && percent <= pts[i + 1].x) {
        p1 = pts[i];
        p2 = pts[i + 1];
        break;
      }
    }

    const t = (percent - p1.x) / (p2.x - p1.x || 1);
    return p1.y + t * (p2.y - p1.y);
  };

  // Convert points array to SVG path
  const makeSvgPath = (): string => {
    return activeRoute.points
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x * 6} ${p.y * 2}`)
      .join(" ");
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setHoverPercent(percent);
  };

  const handleMouseLeave = () => {
    setHoverPercent(null);
  };

  // Find nearest waypoint to hover position or use active hover position
  const activePercent = hoverPercent !== null ? hoverPercent : 50; // default to midpoint
  const currentY = getInterpolatedY(activePercent);
  
  // Find closest waypoint to activePercent
  const closestWaypoint = activeRoute.waypoints.reduce((prev, curr) => {
    return Math.abs(curr.percent - activePercent) < Math.abs(prev.percent - activePercent)
      ? curr
      : prev;
  });

  // Calculate current slope (approximate derivative)
  const getSlope = (percent: number): number => {
    const delta = 1;
    const y1 = getInterpolatedY(Math.max(0, percent - delta));
    const y2 = getInterpolatedY(Math.min(100, percent + delta));
    // Since higher Y means lower altitude in SVG, reverse sign
    const diff = y1 - y2;
    // Map SVG height delta to representative slope gradient
    return Math.round(diff * 0.8);
  };

  const currentSlope = getSlope(activePercent);

  // Map SVG coordinates to render point
  const dotX = activePercent * 6;
  const dotY = currentY * 2;

  return (
    <section className="bg-neve-beige py-16 md:py-24 relative overflow-hidden text-slate-900 border-b border-gray-150/45">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966905_1px,transparent_1px),linear-gradient(to_bottom,#05966905_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neve-gray text-neve-forest text-xs font-bold uppercase tracking-wider mb-4 border border-gray-200">
            📈 Altimétrie & Horaires
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl tracking-tight leading-tight">
            Sécurité Retour & Suivi
          </h2>
          <p className="mt-4 text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Grâce à notre alerte anti-retard, Névé suit votre rythme GPS et l'ajuste aux horaires du dernier train ou bus pour vous assurer un retour serein.
          </p>
        </div>

        {/* Interactive Viewer Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          
          {/* Left panel: Info & Navigation (Light slate/beige glass) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-gray-150 rounded-3xl p-6 shadow-md">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neve-forest mb-4">
                Sélectionner un tracé test :
              </h3>
              
              {/* Route Buttons */}
              <div className="space-y-2.5 mb-6">
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => {
                      setActiveRouteId(route.id);
                      setHoverPercent(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      activeRouteId === route.id
                        ? "bg-emerald-50/70 border-neve-forest text-neve-forest font-extrabold"
                        : "bg-neve-gray/50 border-gray-200 hover:bg-slate-100 text-slate-650"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{route.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 font-semibold">
                        <span>📍 {route.location}</span>
                        <span>•</span>
                        <span>📏 {route.distance}</span>
                      </div>
                    </div>
                    {activeRouteId === route.id && (
                      <span className="w-2 h-2 rounded-full bg-neve-forest" />
                    )}
                  </button>
                ))}
              </div>

              {/* Waypoint Card details */}
              <div className="bg-neve-beige border border-gray-200 rounded-2xl p-4 mt-4 min-h-[160px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-md bg-[color:var(--color-brand-orange)]" />
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      Point d'intérêt proche
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 mb-1">
                    {closestWaypoint.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {closestWaypoint.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-3 pt-3 border-t border-gray-200">
                  <span>Alt. {closestWaypoint.elevation} m</span>
                  <span>Section: {closestWaypoint.percent}%</span>
                </div>
              </div>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-2 text-center bg-neve-gray rounded-xl p-3 border border-gray-200 mt-6 lg:mt-0">
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase">Dénivelé</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeRoute.elevationGain}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase">Max Alt.</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeRoute.maxElevation}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase">Durée</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeRoute.duration}</div>
              </div>
            </div>
          </div>

          {/* Right panel: SVG interactive graph */}
          <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[380px]">
            {/* Top Interactive Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-150">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Position</div>
                  <div className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">
                    {Math.round(activePercent * parseFloat(activeRoute.distance) / 100 * 10) / 10} km
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Pente</div>
                  <div className={`text-sm font-extrabold font-mono mt-0.5 ${
                    currentSlope > 0 ? "text-rose-600" : currentSlope < 0 ? "text-emerald-700" : "text-slate-800"
                  }`}>
                    {currentSlope > 0 ? `+${currentSlope}%` : `${currentSlope}%`}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Statut Retour</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Billet validé (Trainline)
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-[10px] text-slate-400 font-bold italic">
                Survolez la courbe pour analyser le dénivelé
              </div>
            </div>

            {/* SVG Elevation Graph */}
            <div className="relative my-8 flex-grow flex items-center">
              <svg
                ref={svgRef}
                className="w-full h-48 cursor-crosshair overflow-visible select-none"
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Horizontal reference grid lines */}
                <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="3 3">
                  <line x1="0" y1="40" x2="600" y2="40" />
                  <line x1="0" y1="100" x2="600" y2="100" />
                  <line x1="0" y1="160" x2="600" y2="160" />
                </g>

                {/* SVG path background fill gradient */}
                <defs>
                  <linearGradient id={`neve-glow-${activeRoute.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-neve-forest)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-neve-forest)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* The elevation curve path fill */}
                <path
                  d={`${makeSvgPath()} L 600 200 L 0 200 Z`}
                  fill={`url(#neve-glow-${activeRoute.id})`}
                />

                {/* The elevation curve line */}
                <path
                  d={makeSvgPath()}
                  fill="none"
                  stroke="var(--color-neve-forest)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Waypoint circle markers */}
                {activeRoute.waypoints.map((wp, i) => {
                  const wpX = wp.percent * 6;
                  const wpY = getInterpolatedY(wp.percent) * 2;
                  return (
                    <g key={i} className="group/wp">
                      <circle
                        cx={wpX}
                        cy={wpY}
                        r="5.5"
                        className="fill-white stroke-neve-forest stroke-2 cursor-pointer transition-all group-hover/wp:r-7"
                      />
                      <circle
                        cx={wpX}
                        cy={wpY}
                        r="2"
                        className="fill-neve-forest"
                      />
                    </g>
                  );
                })}

                {/* Interactive cursor tracking elements */}
                {hoverPercent !== null && (
                  <g>
                    {/* Vertical line at mouse x */}
                    <line
                      x1={dotX}
                      y1="0"
                      x2={dotX}
                      y2="200"
                      stroke="#9ca3af"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    {/* Pulsing indicator dot on path */}
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r="9"
                      className="fill-neve-forest opacity-20 animate-ping"
                    />
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r="6"
                      className="fill-white stroke-neve-forest stroke-25"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Graph labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold font-mono pt-4 border-t border-gray-150">
              <span className="flex items-center gap-1">🚄 Gare Départ</span>
              <span className="hidden sm:inline">⛰️ Altitudes</span>
              <span className="flex items-center gap-1">🚄 Gare Retour</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
