import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  target?: string;
  rel?: string;
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  target,
  rel,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl transition duration-150 text-[16px] whitespace-nowrap cursor-pointer";
  
  const variantStyles = {
    primary: "bg-[#eb490b] text-white hover:bg-[#ff5a1a] border-2 border-[#0f172b] hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-[4px_4px_0px_0px_#0f172a] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_#0f172a]",
    secondary: "bg-white text-[#0f172b] hover:bg-slate-50 border-2 border-[#0f172b] hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-[4px_4px_0px_0px_#0f172a] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_#0f172a]",
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
      return (
        <a href={href} onClick={onClick} className={combinedClassName} target={target} rel={rel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} className={combinedClassName} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
}
