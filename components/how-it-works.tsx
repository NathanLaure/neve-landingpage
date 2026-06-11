"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Trouver",
    description: "Indiquez vos envies de paysages, votre niveau et votre gare de départ. Névé scanne des centaines de massifs pour vous proposer des itinéraires sur-mesure, tous 100% accessibles sans voiture.",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800&auto=format&fit=crop"
  },
  {
    number: "02",
    title: "Planifier",
    description: "Plus besoin de jongler entre trois sites. L'application calcule et synchronise le train, la navette locale et le sentier. En un instant, votre feuille de route complète est prête.",
    image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=800&auto=format&fit=crop"
  },
  {
    number: "03",
    title: "Profiter",
    description: "Une fois sur place, rangez les horaires de bus. Suivez simplement le GPS embarqué ultra-précis. Les cartes et les tracés restent accessibles même si vous perdez le réseau en pleine forêt.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    number: "04",
    title: "Repartir",
    description: "Marchez sans stresser. Névé analyse votre vitesse de marche en temps réel. Si vous traînez en route, l'application vous prévient pour s'assurer que vous arriviez à la gare à l'heure pour votre train retour.",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop"
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      if (window.innerWidth < 768) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Scroll top relative to the parent container top
      const scrollTop = -rect.top;
      const scrollRange = totalHeight - viewportHeight;

      if (scrollRange <= 0) return;

      // Clamp progress between 0 and 1
      const progress = Math.max(0, Math.min(1, scrollTop / scrollRange));

      // Map progress to steps: 4 steps, index 0 to 3
      const stepIndex = Math.min(Math.floor(progress * 4), 3);
      setActiveStep(stepIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    if (window.innerWidth < 768) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTopInDoc = window.pageYOffset + rect.top;
    const scrollRange = rect.height - window.innerHeight;
    
    // Scroll to the center of this step's segment range in parent scroll path
    const targetProgress = (index + 0.5) / 4;
    const targetScrollY = scrollTopInDoc + targetProgress * scrollRange;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth"
    });
  };

  return (
    <section 
      ref={containerRef}
      id="how-it-works" 
      className="relative h-auto md:h-[400vh] bg-[#fbfaf7] overflow-visible"
    >
      {/* Sticky full-screen wrapper (Desktop) or normal relative flow (Mobile) */}
      <div className="relative md:sticky md:top-0 md:h-screen w-full flex items-center md:overflow-hidden py-16 md:py-0">
        
        {/* Background radial pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#eb490b03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16 w-full z-10">
          
          {/* Main centered container */}
          <div className="max-w-[1232px] mx-auto flex flex-col gap-12 md:gap-16">
            
            {/* Header */}
            <div className="w-full text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-bricolage">
                Votre prochain week-end nature en 4 étapes
              </h2>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
              
              {/* Left Column: Interactive step list */}
              <div className="md:col-span-7 flex flex-col gap-8 md:gap-10 relative">
                
                {/* Vertical line connector (Desktop only) */}
                <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-slate-200/80 pointer-events-none hidden md:block z-0">
                  <div 
                    className="w-full bg-slate-900 transition-all duration-500 ease-out origin-top rounded-full" 
                    style={{ 
                      height: `${(activeStep / (steps.length - 1)) * 100}%` 
                    }}
                  />
                </div>

                {steps.map((step, index) => {
                  const isActive = activeStep === index;
                  
                  return (
                    <div
                      key={step.number}
                      ref={(el) => {
                        stepRefs.current[index] = el;
                      }}
                      onClick={() => handleStepClick(index)}
                      className="flex gap-6 md:gap-10 items-start relative z-10 cursor-pointer group"
                    >
                      
                      {/* Number block with local line segment overlays */}
                      <div className="w-[80px] flex justify-center flex-shrink-0 select-none relative">
                        <div
                          className={`font-serif text-[48px] tracking-[4px] leading-[50px] transition-colors duration-500 ${
                            isActive 
                              ? "text-[#eb490b] font-bold" 
                              : "text-[#eb490b]/40 font-normal group-hover:text-[#eb490b]/60"
                          }`}
                        >
                          {step.number}
                        </div>

                        {/* Local line segment specifically under the number block */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-[55px] bottom-[-40px] left-[39px] w-[2px] hidden md:block">
                            {/* Muted track */}
                            <div className="absolute inset-0 bg-slate-200/80 rounded-full" />
                            {/* Active filled overlay */}
                            <div 
                              className={`absolute top-0 left-0 w-full bg-slate-900 rounded-full transition-all duration-500 ease-out origin-top ${
                                activeStep > index 
                                  ? "scale-y-100" 
                                  : isActive 
                                    ? "scale-y-50" 
                                    : "scale-y-0"
                              }`}
                            />
                          </div>
                        )}

                      </div>

                      {/* Step Texts */}
                      <div className="flex-1 pt-1.5 text-left">
                        <h3
                          className={`font-bricolage text-2xl md:text-3xl font-bold tracking-[-0.5px] transition-colors duration-500 ${
                            isActive 
                              ? "text-slate-900" 
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        >
                          {step.title}
                        </h3>

                        {/* Expanding Accordion Body */}
                        <div
                          className={`grid transition-all duration-500 ease-in-out ${
                            isActive 
                              ? "grid-rows-[1fr] opacity-100 mt-3 md:mt-4" 
                              : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                          }`}
                        >
                          <div className="overflow-hidden">
                            
                            {/* Desktop description */}
                            <p className="hidden md:block font-satoshi text-[#525252] text-[18px] leading-relaxed font-medium">
                              {step.description}
                            </p>

                            {/* Mobile description & inline image */}
                            <div className="block md:hidden">
                              <p className="font-satoshi text-[#525252] text-[18px] leading-relaxed font-medium">
                                {step.description}
                              </p>
                              
                              {/* Mobile inline image card */}
                              <div className="mt-6 w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-1 select-none">
                                <img
                                  src={step.image}
                                  alt={step.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Sticky Card (Desktop only) */}
              <div className="hidden md:block md:col-span-5 md:sticky py-4 flex-none select-none">
                
                {/* Photo Frame Container */}
                <div className="relative flex items-center justify-center w-[375px] h-[450px] mx-auto rotate-2">
                  <div className="w-full h-full bg-slate-100 border-2 border-slate-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] overflow-hidden relative">
                    
                    {/* Render all 4 step images stacked with crossfade transition */}
                    {steps.map((step, index) => {
                      const isActive = activeStep === index;
                      
                      return (
                        <div
                          key={step.number}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            isActive 
                              ? "opacity-100 scale-100 pointer-events-auto z-10" 
                              : "opacity-0 scale-95 pointer-events-none z-0"
                          }`}
                        >
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Shadow/gradient bottom overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                      );
                    })}
                    
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
