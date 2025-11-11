"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", disabled, children, ...props }, ref) => {
    const base =
      "group inline-flex items-center justify-center rounded-premium px-6 py-3 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    const variants = {
      primary: "bg-black text-white hover:shadow-premium hover:-translate-y-0.5 focus-visible:outline-champagne",
      outline: "border border-slate-300 bg-white text-slate-900 hover:border-champagne hover:text-black focus-visible:outline-champagne",
      ghost: "text-slate-700 hover:text-black",
    } as const;

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          disabled && "cursor-not-allowed opacity-60",
          "relative overflow-hidden",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant === "primary" && (
          <span
            className="pointer-events-none absolute inset-0 bg-sheen bg-[length:250%_250%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
            aria-hidden
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
