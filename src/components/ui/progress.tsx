import { cn } from "@/lib/utils";

export function ProgressBar({ value, max = 3 }: { value: number; max?: number }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700",
          value >= max
            ? "bg-black"
            : "bg-gradient-to-r from-champagne via-[#f7e27a] to-champagne shadow-[0_0_18px_rgba(230,194,0,0.45)]"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
