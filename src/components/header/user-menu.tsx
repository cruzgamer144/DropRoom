"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/actions";

interface UserMenuProps {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export function UserMenu({ email, name, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = name?.trim().charAt(0)?.toUpperCase() || email.charAt(0)?.toUpperCase() || "DR";

  const handleSignOut = () => {
    setOpen(false);
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-champagne/60 bg-white text-sm font-medium text-slate-900 shadow-sm transition hover:border-champagne hover:shadow-premium"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Avatar do utilizador" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
            role="menu"
          >
            <div className="space-y-1 border-b border-slate-100 px-4 py-3 text-sm">
              <p className="font-semibold text-slate-900">{name ?? "Membro DropRoom"}</p>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
            <div className="flex flex-col gap-1 p-2 text-sm">
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2 text-slate-700 transition hover:bg-champagne/20 hover:text-slate-900"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Aceder ao dashboard
              </Link>
              <Link
                href="/proximos-drops"
                className="rounded-xl px-3 py-2 text-slate-700 transition hover:bg-champagne/20 hover:text-slate-900"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Novos drops
              </Link>
              <button
                type="button"
                className="rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-900 hover:text-white"
                onClick={handleSignOut}
                disabled={isPending}
                role="menuitem"
              >
                {isPending ? "A terminar sessão…" : "Sair"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
