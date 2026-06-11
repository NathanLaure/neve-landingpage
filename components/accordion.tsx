"use client";

import { useState } from "react";

type AccordionpProps = {
  children: React.ReactNode;
  title: string;
  id: string;
  active?: boolean;
};

export default function Accordion({
  children,
  title,
  id,
  active = false,
}: AccordionpProps) {
  const [accordionOpen, setAccordionOpen] = useState<boolean>(active);

  return (
    <div className="relative rounded-lg bg-white/70 shadow-sm shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
      <h2>
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={(e) => {
            e.preventDefault();
            setAccordionOpen((prevState) => !prevState);
          }}
          aria-expanded={accordionOpen}
          aria-controls={`accordion-text-${id}`}
        >
          <span 
            className="font-bricolage font-semibold text-[#101828] text-base tracking-[-0.4px] leading-[24px]"
            style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
          >
            {title}
          </span>
          <span className="ml-8 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-gray-100">
            <svg
              className={`origin-center transform fill-gray-400 transition duration-200 ease-out ${accordionOpen && "rotate-180!"}`}
              xmlns="http://www.w3.org/2000/svg"
              width={10}
              height={6}
              fill="none"
            >
              <path
                d="m2 .586 3 3 3-3L9.414 2 5.707 5.707a1 1 0 0 1-1.414 0L.586 2 2 .586Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </h2>
      <div
        id={`accordion-text-${id}`}
        role="region"
        aria-labelledby={`accordion-title-${id}`}
        className={`grid overflow-hidden text-sm text-slate-500 transition-all duration-300 ease-in-out ${accordionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="font-satoshi text-[18px] font-medium text-[#525252] leading-relaxed px-4 pb-4">{children}</p>
        </div>
      </div>
    </div>
  );
}
