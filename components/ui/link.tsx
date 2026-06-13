import Link from "next/link";
import React from "react";

type CustomLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: "default" | "header" | "header-scrolled" | "footer" | "brand" | "underline" | "arrow" | "unstyled";
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export default function CustomLink({
  children,
  href,
  variant = "default",
  className = "",
  target,
  rel,
  onClick,
}: CustomLinkProps) {
  // Focus ring style for excellent keyboard accessibility (WCAG 2.1)
  const baseStyles = "transition-all duration-150 ease-in-out cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#eb490b] focus-visible:ring-offset-2 rounded-xs";

  const variantStyles = {
    // Accessible by default: uses a high-contrast text color with a modern, offset underline
    // Color-blind friendly: visual underline indicator is always visible by default
    default: "text-slate-900 font-normal underline underline-offset-4 decoration-slate-300 hover:text-[#eb490b] hover:decoration-[#eb490b] transition-colors",
    
    header: "font-satoshi font-medium text-[16px] text-white/80 hover:text-white",
    "header-scrolled": "font-satoshi font-medium text-[16px] text-slate-700 hover:text-slate-900",
    footer: "text-slate-500 hover:text-slate-900",
    brand: "text-[#eb490b] hover:text-[#ff5a1a] font-semibold transition-colors",
    
    // Premium animated underline effect
    underline: "relative font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[#eb490b] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 pb-0.5",
    
    // Brand link with an arrow icon that slides on hover
    arrow: "inline-flex items-center gap-1 text-[#eb490b] hover:text-[#ff5a1a] font-semibold group",

    // Unstyled option for raw logos or custom wrapped elements
    unstyled: "",
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#") || target === "_blank";
  const isTargetBlank = target === "_blank";

  // Visual arrow indicator for sliding arrow variant
  const arrowIcon = variant === "arrow" && (
    <svg 
      className="w-4.5 h-4.5 transform transition-transform duration-200 group-hover:translate-x-1" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );

  // Subtle visual cue for external links to inform users they will leave the page (WCAG G200/G201)
  const externalIcon = isTargetBlank && variant !== "arrow" && (
    <span className="inline-block shrink-0 select-none text-[10px] opacity-60 ml-0.5" aria-hidden="true">
      ↗
    </span>
  );

  // Screen reader description for accessibility when opening in a new tab (WCAG 2.1)
  const screenReaderText = isTargetBlank && (
    <span className="sr-only"> (ouvre dans un nouvel onglet)</span>
  );

  const defaultRel = isTargetBlank ? "noopener noreferrer" : rel;

  const content = (
    <>
      {children}
      {arrowIcon}
      {externalIcon}
      {screenReaderText}
    </>
  );

  if (isExternal) {
    return (
      <a 
        href={href} 
        onClick={onClick} 
        className={combinedClassName} 
        target={target} 
        rel={defaultRel}
      >
        {content}
      </a>
    );
  }

  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className={combinedClassName} 
      target={target} 
      rel={defaultRel}
    >
      {content}
    </Link>
  );
}
