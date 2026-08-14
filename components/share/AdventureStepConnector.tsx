"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export interface AdventureStepConnectorProps {
  label: string;
}

export function AdventureStepConnector({ label }: AdventureStepConnectorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-2 select-none">
      <div className="flex flex-col items-center gap-1">
        <div className="w-0.5 h-2 rounded-full bg-gray-300" />
        <div className="w-0.5 h-2 rounded-full bg-gray-300" />
      </div>

      <span className="text-[11px] font-bold tracking-wider text-[#7C7C7C] uppercase font-satoshi">
        {label}
      </span>

      <div className="flex flex-col items-center gap-1">
        <div className="w-0.5 h-2 rounded-full bg-gray-300" />
        <div className="w-0.5 h-2 rounded-full bg-gray-300" />
      </div>
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
    <div className="flex flex-col items-center justify-center gap-1.5 py-1 text-center select-none">
      {arrow === "above" && (
        <ArrowUp className="w-3.5 h-3.5 text-[#7C7C7C]" />
      )}
      <span className="text-xs font-semibold text-[#7C7C7C] font-satoshi">
        {label}
      </span>
      {arrow === "below" && (
        <ArrowDown className="w-3.5 h-3.5 text-[#7C7C7C]" />
      )}
    </div>
  );
}

export default AdventureStepConnector;
