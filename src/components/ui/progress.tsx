import { cn } from "@/lib/utils";

export function ProgressBar({ value, max = 3 }: { value: number; max?: number }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full bg-champagne transition-all",
          value >= max ? "bg-black" : "bg-champagne"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
