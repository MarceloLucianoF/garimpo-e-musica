"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function LadoAHeader() {
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[#F5F1E8] transition-colors hover:border-zinc-500"
          aria-label="Carrinho"
        >
          <ShoppingBag size={20} />
          {isMounted && totalItems > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F1E8] text-[10px] font-bold text-zinc-900">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
