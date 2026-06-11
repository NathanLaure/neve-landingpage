import Button from "@/components/ui/button";

export default function SplitFeatures() {
  return (
    <div id="features" className="bg-neve-beige text-slate-900 w-full overflow-hidden">
      
      {/* SECTION 1: Planifier l'itinéraire parfait */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#4c6a1705_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left side: Text & CTA */}
            <div className="max-w-xl pr-0 md:pr-8">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight font-bricolage">
                Le premier planificateur porte-à-porte
              </h2>
              <p className="font-satoshi text-[#525252] text-[18px] font-medium leading-relaxed mb-8">
                Entrez votre gare de départ, nous calculons le reste. Névé combine instantanément le train, la navette locale et l'itinéraire de marche pour un trajet fluide du pas de votre porte jusqu'au sommet.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#download-ios">
                  Inscrivez-vous gratuitement
                </Button>
              </div>
            </div>

            {/* Right side: Scrapbook Card Composition */}
            <div className="relative w-full max-w-[480px] h-[400px] md:h-[440px] mx-auto flex items-center justify-center">
              
              {/* Hand-drawn Purple/Indigo Wave */}
              <div className="absolute top-0 left-6 text-emerald-600 opacity-60 select-none">
                <svg className="w-12 h-6 fill-none stroke-current" viewBox="0 0 48 24" strokeWidth="2.5">
                  <path d="M0 12 Q 6 4 12 12 T 24 12 T 36 12 T 48 12" />
                  <path d="M0 18 Q 6 10 12 18 T 24 18 T 36 18 T 48 18" />
                </svg>
              </div>

              {/* Hand-drawn Station B Tag (Crêt de la Perdrix) - Top Right */}
              <div className="absolute right-6 top-4 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl px-3.5 py-2 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[4deg] z-30 flex items-center gap-2 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange border border-slate-900" />
                <span className="font-serif italic font-black text-xs text-slate-800 tracking-wide">
                  Crêt de la Perdrix ⛰️
                </span>
              </div>

              {/* Overlapping Hike Photo Card - Center Right */}
              <div className="absolute right-4 bottom-12 w-56 h-40 md:w-64 md:h-48 rounded-3xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[3deg] z-20">
                <div className="w-full h-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
              </div>

              {/* Hand-drawn Station A Tag (Gare Part-Dieu) - Bottom Left */}
              <div className="absolute left-6 bottom-4 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl px-3.5 py-2 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[-2deg] z-30 flex items-center gap-2 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-slate-900" />
                <span className="font-serif italic font-black text-xs text-slate-800 tracking-wide">
                  Gare Part-Dieu 🚄
                </span>
              </div>

              {/* Mock Map Board - Center Left */}
              <div className="absolute left-4 top-10 w-64 h-64 md:w-76 md:h-76 rounded-[2rem] bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-4.5 z-10 flex flex-col justify-between rotate-[-3deg]">
                {/* Simulated map graphic */}
                <div className="w-full h-full bg-[#f2efe9] rounded-2xl relative overflow-hidden border-2 border-slate-900/60 flex items-center justify-center">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5dec9_1px,transparent_1px),linear-gradient(to_bottom,#e5dec9_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  
                  {/* Topographic Lines simulated in SVG */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-400/25" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="40" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="60" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="85" strokeWidth="0.8" />
                  </svg>

                  {/* Hand-drawn Route trail connecting A and B */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-900 fill-none" viewBox="0 0 200 200">
                    <path d="M 40 160 Q 60 120 110 130 T 150 70 T 170 30" strokeWidth="3.5" strokeLinecap="round" />
                    
                    <circle cx="40" cy="160" r="6.5" className="fill-emerald-600 stroke-slate-900 stroke-2" />
                    <text x="50" y="166" className="fill-slate-900 font-extrabold text-[8px] font-serif italic">Départ (A)</text>
                    
                    <circle cx="170" cy="30" r="6.5" className="fill-orange-600 stroke-slate-900 stroke-2" />
                    <text x="135" y="32" className="fill-slate-900 font-extrabold text-[8px] font-serif italic">Arrivée (B)</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Navigation plus efficace */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-neve-beige">
        <div className="absolute inset-0 bg-[radial-gradient(#05966904_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left side: Scrapbook Card Composition */}
            <div className="relative flex items-center justify-center min-h-[380px] order-last md:order-first">
              
              {/* Photo and Pill Sub-container */}
              <div className="relative">
                {/* Main Hiker Photo with Scrapbook framing */}
                <div className="relative w-80 h-96 rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] z-10 rotate-[-3deg]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                </div>

                {/* Hand-drawn Secondary Alert - Overlapping Top Left */}
                <div className="absolute -top-6 -left-10 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-[-6deg] z-25 flex items-center gap-2 select-none">
                  <span className="font-serif italic font-black text-xs text-slate-900 flex items-center gap-1.5">
                    Sentier des crêtes 🌲
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Text & CTA */}
            <div className="max-w-xl pl-0 md:pl-8">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight font-bricolage">
                La liberté du tracé linéaire
              </h2>
              <p className="font-satoshi text-[#525252] text-[18px] font-medium leading-relaxed mb-8">
                Ne faites plus demi-tour. Partez d'une gare A, traversez un massif complet, et reprenez votre train dans une gare B. Névé conçoit des itinéraires impossibles à faire en voiture individuelle.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#download-ios">
                  Inscrivez-vous gratuitement
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Sécurité Retour Active */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#4c6a1705_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left side: Text & CTA */}
            <div className="max-w-xl pr-0 md:pr-8">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight font-bricolage">
                Marchez serein avec la Sécurité Retour Active
              </h2>
              <p className="font-satoshi text-[#525252] text-[18px] font-medium leading-relaxed mb-8">
                Notre GPS intelligent analyse votre rythme de marche en temps réel. Si vous traînez en route, l'application vous alerte et vous propose une alternative pour être certain d'arriver avant le dernier train.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#download-ios">
                  Inscrivez-vous gratuitement
                </Button>
              </div>
            </div>

            {/* Right side: Scrapbook Card Composition */}
            <div className="relative flex items-center justify-center min-h-[380px]">
              
              {/* Photo and Pill Sub-container */}
              <div className="relative">
                {/* Main Hiker Photo with Scrapbook framing */}
                <div className="relative w-80 h-96 rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] z-10 rotate-[3deg]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                </div>

                {/* Hand-drawn Secondary Alert - Styled as a phone notification */}
                <div className="absolute -top-10 -left-6 sm:-left-12 md:-left-20 bg-[#faf8f2] border-2 border-slate-900 rounded-2xl p-4 shadow-[3.5px_3.5px_0px_0px_rgba(15,23,42,1)] rotate-[-4deg] z-25 flex flex-col w-[310px] sm:w-[340px] md:w-[380px] select-none text-left">
                  {/* Notification Header */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-brand-orange flex items-center justify-center text-white text-[8px] font-black font-bricolage select-none">
                        N
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-900 font-bricolage">Névé</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">à l'instant</span>
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-slate-900 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                      <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-serif italic font-black text-xs text-slate-900 leading-tight">
                        Rythme idéal pour le train de 17h32
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 mt-1 leading-snug">
                        Continuez comme ça !
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
