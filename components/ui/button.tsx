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
  disabled?: boolean;
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
  disabled = false,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold px-6 py-3 rounded-3xl [corner-shape:squircle] transition duration-150 text-[14px] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";
  
  const variantStyles = {
    primary: "bg-[#eb490b] text-white hover:bg-[#c3350b] border-2 border-[#1c1914] hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-[4px_4px_0px_0px_#1c1914] active:shadow-[2px_2px_0px_0px_#1c1914]",
    secondary: "bg-[#ffffff] text-[#1c1914] hover:bg-[#f5f3ec] border-2 border-[#1c1914] hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-[4px_4px_0px_0px_#1c1914] active:shadow-[2px_2px_0px_0px_#1c1914]",
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
    <button type={type} onClick={onClick} className={combinedClassName} disabled={disabled}>
      {children}
    </button>
  );
}
