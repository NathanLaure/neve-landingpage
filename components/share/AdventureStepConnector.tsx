"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export interface AdventureStepConnectorProps {
  label: string;
}

export function AdventureStepConnector({ label }: AdventureStepConnectorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 select-none">
      <div className="w-0.5 h-4 sm:h-5 border-r-2 border-dashed border-[#A8A190]" />

      <span className="text-xs font-bold text-[#575246] font-satoshi py-0.5 tracking-wide">
        {label}
      </span>

      <div className="w-0.5 h-4 sm:h-5 border-r-2 border-dashed border-[#A8A190]" />
    </div>
  );
}

export function AdventureTimelineCaption({
  label,
  arrow = "below",
}: {
  label: string;
  arrow?: "above" | "below";
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-3 sm:py-4 text-center select-none">
      {arrow === "above" && (
        <ArrowDown className="w-3.5 h-3.5 text-[#7A7363]" />
      )}
      <span className="text-xs font-semibold text-[#575246] font-satoshi">
        {label}
      </span>
      {arrow === "below" && (
        <ArrowDown className="w-3.5 h-3.5 text-[#7A7363]" />
      )}
    </div>
  );
}

export default AdventureStepConnector;
