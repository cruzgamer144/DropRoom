import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-premium border border-slate-100 bg-white/90 p-6 shadow-sm transition hover:shadow-premium",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-white/70 opacity-0 transition group-hover:opacity-100" aria-hidden />
      <div className="relative z-10 space-y-4">{children}</div>
    </div>
  );
}
