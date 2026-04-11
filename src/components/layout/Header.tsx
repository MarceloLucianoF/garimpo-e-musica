// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "@/components/features/checkout/CartDrawer";

export function Header() {
  const totalItems = useCartStore((state) => state.totalItems());
  // Estado local para abrir/fechar a gaveta do carrinho
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-garimpo-bg/90 backdrop-blur-md border-b border-garimpo-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight text-garimpo-dark">
                  Garimpo & Música
                </span>
                <span className="font-sans text-[10px] uppercase tracking-widest text-garimpo-rust font-semibold mt-[-4px]">
                  Lagoa da Conceição
                </span>
              </Link>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/a-loja" className="font-sans font-medium text-garimpo-dark/80 hover:text-garimpo-rust transition-colors">A Loja</Link>
              <Link href="/brecho" className="font-sans font-medium text-garimpo-dark/80 hover:text-garimpo-rust transition-colors">Brechó</Link>
              <Link href="/musica" className="font-sans font-medium text-garimpo-dark/80 hover:text-garimpo-rust transition-colors">Música</Link>
            </nav>

            {/* Ícones de Ação */}
            <div className="flex items-center space-x-5">
              <button className="text-garimpo-dark/80 hover:text-garimpo-rust transition-colors" aria-label="Buscar">
                <Search size={22} />
              </button>
              
              {/* Agora é um botão que abre o Drawer em vez de redirecionar a página */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative text-garimpo-dark/80 hover:text-garimpo-rust transition-colors" 
                aria-label="Carrinho"
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-garimpo-rust text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button className="md:hidden text-garimpo-dark/80 hover:text-garimpo-rust transition-colors" aria-label="Menu">
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Injeção do Componente do Carrinho */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}