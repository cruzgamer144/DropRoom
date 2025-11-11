import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "block w-full rounded-premium border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-champagne focus:ring-champagne",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
