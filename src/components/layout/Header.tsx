// src/components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useCartStore } from "@/store/cartStore";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  // Estado local para abrir/fechar a gaveta do carrinho
  const [isMounted, setIsMounted] = useState(false);
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mostrar carrinho apenas em /musica ou /checkout
  const shouldShowCart = pathname.startsWith("/musica") || pathname === "/checkout";
  const isMusicContext = pathname.startsWith("/musica") || pathname === "/checkout";
  const logoHref = isMusicContext ? "/musica" : "/";
  const adminHref = isAdminLogged ? "/admin/dashboard" : "/admin/login";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminLogged(Boolean(user));
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-md border-b ${
          isMusicContext
            ? "bg-zinc-950/90 border-white/10"
            : "bg-garimpo-bg/90 border-garimpo-dark/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo - Mobile-First Não-Quebrável */}
            <div className="flex-shrink-0">
              <Link href={logoHref} className="flex flex-col group">
                <span
                  className={`whitespace-nowrap font-display text-xl md:text-2xl font-bold tracking-tight transition-colors ${
                    isMusicContext
                      ? "text-[#F5F1E8] group-hover:text-white"
                      : "text-garimpo-dark group-hover:text-garimpo-rust"
                  }`}
                >
                  {isMusicContext ? "Lado A Discos" : "Garimpo & Música"}
                </span>
                <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-widest text-garimpo-rust font-semibold mt-[-4px]">
                  {isMusicContext ? "Curadoria premium em vinil" : "Lagoa da Conceição"}
                </span>
              </Link>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/a-loja" className={`font-sans font-medium transition-colors ${isMusicContext ? "text-white/80 hover:text-white" : "text-garimpo-dark/80 hover:text-garimpo-rust"}`}>A Loja</Link>
              <Link href="/brecho" className={`font-sans font-medium transition-colors ${isMusicContext ? "text-white/80 hover:text-white" : "text-garimpo-dark/80 hover:text-garimpo-rust"}`}>Brechó</Link>
              <Link href="/musica" className={`font-sans font-medium transition-colors ${isMusicContext ? "text-white/80 hover:text-white" : "text-garimpo-dark/80 hover:text-garimpo-rust"}`}>Música</Link>
              <Link href={adminHref} className={`font-sans text-sm font-medium transition-colors ${isMusicContext ? "text-white/55 hover:text-white/85" : "text-garimpo-dark/60 hover:text-garimpo-rust"}`}>Admin</Link>
            </nav>

            {/* Ícones de Ação */}
            <div className="flex items-center space-x-5">
              <button className={`transition-colors ${isMusicContext ? "text-white/80 hover:text-white" : "text-garimpo-dark/80 hover:text-garimpo-rust"}`} aria-label="Buscar">
                <Search size={22} />
              </button>
              
              {/* Carrinho só aparece em /musica ou /checkout */}
              {shouldShowCart && (
                <button 
                  onClick={() => router.push("/checkout")} 
                  className={`relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center p-2 transition-colors ${isMusicContext ? "text-white/80 hover:text-white" : "text-garimpo-dark/80 hover:text-garimpo-rust"}`}
                  aria-label="Carrinho"
                >
                  <ShoppingBag size={22} />
                  {isMounted && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-garimpo-rust text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              <button
                className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-garimpo-dark/80 transition-colors hover:text-garimpo-rust"
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-garimpo-dark/75"
            aria-label="Fechar menu mobile"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-garimpo-bg px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-garimpo-dark/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Menu</p>
                <p className="mt-1 font-display text-2xl font-bold text-garimpo-dark">Navegação</p>
              </div>
              <button
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-garimpo-dark transition-colors hover:text-garimpo-rust"
                aria-label="Fechar menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-3">
              {[
                { href: "/a-loja", label: "A Loja" },
                { href: "/brecho", label: "Brechó" },
                { href: "/musica", label: "Música" },
                { href: adminHref, label: "Admin" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-garimpo-dark/10 bg-white px-5 py-4 font-display text-2xl font-bold text-garimpo-dark transition-colors hover:border-garimpo-rust hover:text-garimpo-rust"
                >
                  <span>{item.label}</span>
                  <ArrowRight size={20} />
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}