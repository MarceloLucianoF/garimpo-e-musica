"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export function LadoAHeader() {
  const router = useRouter();
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const removeItem = useCartStore((state) => state.removeItem);
  const [isCartHoverOpen, setIsCartHoverOpen] = useState(false);


  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/musica" className="flex flex-col">
          <span className="font-display text-2xl font-bold tracking-tight text-[#F5F1E8]">Lado A Discos</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-200/65">
            Curadoria premium em vinil
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/musica" className="text-sm font-medium text-zinc-300 transition-colors hover:text-[#F5F1E8]">
            Catálogo
          </Link>
          <Link href="/musica#em-destaque" className="text-sm font-medium text-zinc-300 transition-colors hover:text-[#F5F1E8]">
            Em Destaque
          </Link>
          <Link href="/musica#sobre" className="text-sm font-medium text-zinc-300 transition-colors hover:text-[#F5F1E8]">
            Sobre
          </Link>
        </nav>

        <div
          className="relative flex items-center gap-3"
          onMouseEnter={() => setIsCartHoverOpen(true)}
          onMouseLeave={() => setIsCartHoverOpen(false)}
        >
          <Link
            href="/admin/login"
            className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300 sm:inline"
          >
            Admin
          </Link>

          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[#F5F1E8] transition-colors hover:border-zinc-500"
            aria-label="Carrinho"
          >
            <ShoppingBag size={20} />
            {hydrated && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F1E8] text-[10px] font-bold text-zinc-900">
                {totalItems}
              </span>
            )}
          </button>

          {hydrated && isCartHoverOpen && (
            <div className="absolute right-0 top-full z-50 hidden w-80 pt-4 md:block">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Carrinho</p>

                {items.length === 0 ? (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-white/65">Sua agulha está parada. Explore o catálogo.</p>
                    <button
                      type="button"
                      onClick={() => router.push("/musica")}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-[#F5F1E8] transition-colors hover:border-zinc-500"
                    >
                      Ver Discos
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-800">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#F5F1E8]">{item.title}</p>
                          <p className="text-xs text-white/60">Qtd. {item.quantity}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-white/70 transition-colors hover:text-white"
                          aria-label="Remover item"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => router.push("/checkout")}
                      className="mt-1 w-full rounded-xl bg-[#F5F1E8] px-4 py-3 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.01]"
                    >
                      Ir para Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
