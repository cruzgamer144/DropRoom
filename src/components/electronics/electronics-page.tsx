"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { ElectronicsProduct, ElectronicsProductStatus, Profile } from "@/types/database";
import { cn, formatPrice } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress";
import { createElectronicsOrder } from "@/lib/actions";
import { useToast } from "@/components/ui/toaster";

interface ElectronicsPageViewProps {
  profile: Profile;
  products: ElectronicsProduct[];
  monthKey: string;
}

type StatusFilter = "all" | ElectronicsProductStatus;
type AvailabilityLabel = {
  label: string;
  value: StatusFilter;
};

type PriceFilter = "all" | "lt300" | "300to500" | "gt500";

type PriceConfig = {
  label: string;
  value: PriceFilter;
};

const statusCopy: Record<ElectronicsProductStatus, { label: string; badge: string }> = {
  available: { label: "Disponível", badge: "bg-emerald-100 text-emerald-700" },
  reserve: { label: "Em reserva", badge: "bg-champagne/20 text-slate-800" },
  sold_out: { label: "Esgotado", badge: "bg-slate-100 text-slate-500" },
};

const statusFilters: AvailabilityLabel[] = [
  { label: "Todos", value: "all" },
  { label: "Disponíveis", value: "available" },
  { label: "Reservas", value: "reserve" },
  { label: "Esgotados", value: "sold_out" },
];

const priceFilters: PriceConfig[] = [
  { label: "Todos os preços", value: "all" },
  { label: "Até €300", value: "lt300" },
  { label: "€300 – €500", value: "300to500" },
  { label: "Acima de €500", value: "gt500" },
];

export function ElectronicsPageView({ profile, products, monthKey }: ElectronicsPageViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [isPending, startTransition] = useTransition();
  const { pushToast } = useToast();

  const monthCount =
    profile.electronics_month_key === monthKey ? profile.electronics_monthly_count : 0;
  const limit = profile.electronics_monthly_limit;
  const limitReached = monthCount >= limit;
  const remaining = Math.max(limit - monthCount, 0);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      if (product.brand) {
        set.add(product.brand);
      }
    });
    return Array.from(set).sort();
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        set.add(product.category);
      }
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter !== "all" && product.status !== statusFilter) {
        return false;
      }
      if (brandFilter !== "all" && product.brand !== brandFilter) {
        return false;
      }
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      if (priceFilter !== "all") {
        if (priceFilter === "lt300" && product.price > 300) {
          return false;
        }
        if (priceFilter === "300to500" && (product.price < 300 || product.price > 500)) {
          return false;
        }
        if (priceFilter === "gt500" && product.price < 500) {
          return false;
        }
      }
      return true;
    });
  }, [products, statusFilter, brandFilter, categoryFilter, priceFilter]);

  const highlightProducts = useMemo(
    () => filteredProducts.filter((product) => product.highlight),
    [filteredProducts]
  );

  const handleAction = (productId: string, status: ElectronicsProductStatus) => {
    if (status === "sold_out" || limitReached || isPending) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      const result = await createElectronicsOrder(formData);

      if (result?.error) {
        pushToast({
          title: "Operação não concluída",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      pushToast({
        title: status === "reserve" ? "Reserva confirmada" : "Compra confirmada",
        description:
          status === "reserve"
            ? "Garantimos a tua vaga para este lançamento."
            : "O teu pedido premium foi registado com sucesso.",
      });
    });
  };

  return (
    <div className="space-y-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-[calc(var(--header-height)+12px)] z-30 mx-6 sm:mx-12"
      >
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-champagne hover:bg-white"
        >
          <span className="text-lg">←</span>
          <span className="relative z-10">Voltar</span>
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-sheen bg-[length:240%_240%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
            aria-hidden
          />
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-6 sm:px-12"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Coleção privada</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-slate-900">Dispositivos Eletrónicos</h1>
              <p className="text-sm text-slate-600">Audio premium e tecnologia com curadoria DropRoom.</p>
            </div>
            <div className="rounded-premium border border-champagne/60 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Eletrónicos este mês</p>
              <div className="mt-1 flex items-end gap-1 text-3xl font-semibold text-slate-900">
                <span>{monthCount}</span>
                <span className="pb-1 text-base text-slate-500">/ {limit}</span>
              </div>
              <div className="mt-3">
                <ProgressBar value={monthCount} max={limit} />
              </div>
              <AnimatePresence mode="wait">
                {limitReached ? (
                  <motion.p
                    key="limit"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    Limite mensal de eletrónicos atingido.
                  </motion.p>
                ) : (
                  <motion.p
                    key="available"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-xs text-slate-500"
                  >
                    Tens {remaining} operações disponíveis este mês.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-premium border border-slate-100 bg-white/70 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Disponibilidade</legend>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    statusFilter === filter.value
                      ? "border-champagne bg-champagne/20 text-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-champagne hover:text-slate-900"
                  )}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Marca
            <select
              className="rounded-premium border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-champagne focus:outline-none focus:ring-0"
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tipo / Modelo
            <select
              className="rounded-premium border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-champagne focus:outline-none focus:ring-0"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Preço
            <select
              className="rounded-premium border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-champagne focus:outline-none focus:ring-0"
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
            >
              {priceFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {highlightProducts.length > 0 ? (
          <section className="grid gap-6 lg:grid-cols-2">
            {highlightProducts.slice(0, 2).map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-premium border border-champagne/60 bg-gradient-to-br from-white via-white to-champagne/15 shadow-lg"
              >
                <div className="grid gap-6 p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
                  <div className="space-y-3">
                    <span className="inline-flex items-center rounded-full border border-champagne/50 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">
                      Em destaque
                    </span>
                    <h2 className="font-display text-3xl font-semibold text-slate-900">{product.name}</h2>
                    <p className="text-sm text-slate-600">{product.description}</p>
                    <div className="space-y-1 text-sm text-slate-600">
                      {product.brand ? (
                        <p>
                          <span className="font-medium text-slate-900">Marca:</span> {product.brand}
                        </p>
                      ) : null}
                      <p>
                        <span className="font-medium text-slate-900">Preço:</span> {formatPrice(product.price)}
                      </p>
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                        <span className={cn("rounded-full px-3 py-1 text-[11px]", statusCopy[product.status].badge)}>
                          {statusCopy[product.status].label}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAction(product.id, product.status)}
                      disabled={limitReached || product.status === "sold_out" || isPending}
                      className={cn(
                        "group relative inline-flex w-full items-center justify-center gap-2 rounded-premium px-5 py-3 text-sm font-semibold transition",
                        product.status === "available"
                          ? "border border-transparent bg-black text-white hover:-translate-y-0.5 hover:shadow-premium"
                          : "border border-champagne/60 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-champagne",
                        (limitReached || product.status === "sold_out") &&
                          "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:translate-y-0 hover:shadow-none"
                      )}
                      title={
                        limitReached
                          ? "Limite mensal de eletrónicos atingido"
                          : product.status === "sold_out"
                          ? "Produto esgotado"
                          : undefined
                      }
                    >
                      <span className="relative z-10">
                        {product.status === "available" ? "Comprar" : product.status === "reserve" ? "Reservar" : "Indisponível"}
                      </span>
                      <span
                        className="pointer-events-none absolute inset-0 rounded-premium bg-sheen bg-[length:240%_240%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
                        aria-hidden
                      />
                    </button>
                  </div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-premium">
                    <Image
                      src={product.image_url}
                      alt={`Imagem do dispositivo ${product.name}`}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
                      <div className="absolute inset-0 bg-sheen bg-[length:220%_220%] mix-blend-screen" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Coleção completa</h2>
            <p className="text-sm text-slate-500">{filteredProducts.length} itens selecionados</p>
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredProducts.map((product) => (
              <motion.article
                key={product.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group flex h-full flex-col overflow-hidden rounded-premium border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={`Imagem do dispositivo ${product.name}`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
                    <div className="absolute inset-0 bg-sheen bg-[length:220%_220%] mix-blend-screen" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                      {product.brand ? <span>{product.brand}</span> : null}
                      {product.category ? <span className="text-slate-300">•</span> : null}
                      {product.category ? <span>{product.category}</span> : null}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{product.description}</p>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-900">{formatPrice(product.price)}</span>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusCopy[product.status].badge)}>
                        {statusCopy[product.status].label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAction(product.id, product.status)}
                      disabled={limitReached || product.status === "sold_out" || isPending}
                      className={cn(
                        "group relative inline-flex w-full items-center justify-center gap-2 rounded-premium px-4 py-2.5 text-sm font-semibold transition",
                        product.status === "available"
                          ? "border border-transparent bg-black text-white hover:-translate-y-0.5 hover:shadow-premium"
                          : "border border-champagne/60 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-champagne",
                        (limitReached || product.status === "sold_out") &&
                          "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:translate-y-0 hover:shadow-none"
                      )}
                      title={
                        limitReached
                          ? "Limite mensal de eletrónicos atingido"
                          : product.status === "sold_out"
                          ? "Produto esgotado"
                          : undefined
                      }
                    >
                      <span className="relative z-10">
                        {product.status === "available" ? "Comprar" : product.status === "reserve" ? "Reservar" : "Indisponível"}
                      </span>
                      <span
                        className="pointer-events-none absolute inset-0 rounded-premium bg-sheen bg-[length:240%_240%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="col-span-full flex flex-col items-center justify-center gap-3 rounded-premium border border-slate-100 bg-white py-12 text-center text-slate-500"
              >
                <p className="font-semibold text-slate-700">Nenhum dispositivo corresponde aos filtros.</p>
                <p className="text-sm">Remove alguns filtros para explorar toda a coleção.</p>
              </motion.div>
            ) : null}
          </motion.div>
        </section>
      </motion.section>
    </div>
  );
}
