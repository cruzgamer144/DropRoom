import type { ReactNode } from "react";

export function AdminSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
      <header className="space-y-1">
        <h2 className="font-display text-2xl text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
