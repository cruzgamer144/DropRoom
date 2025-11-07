export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-ink/60 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} DropRoom. Exclusividade garantida.</p>
        <div className="flex gap-6">
          <a href="mailto:concierge@droproom.club" className="transition hover:text-ink">
            Concierge
          </a>
          <a href="/proximos-drops" className="transition hover:text-ink">
            Calendário de Drops
          </a>
        </div>
      </div>
    </footer>
  );
}
