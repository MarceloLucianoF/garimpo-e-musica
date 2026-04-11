// src/components/features/checkout/CartDrawer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, Disc3 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore();

  // Se não estiver aberto, não renderiza nada visualmente (ou empurra para fora da tela)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Fundo escuro (Backdrop) que fecha o carrinho ao clicar */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Painel do Carrinho */}
      <div className="relative w-full max-w-md bg-garimpo-bg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Cabeçalho do Carrinho */}
        <div className="flex items-center justify-between p-6 border-b border-garimpo-dark/10 bg-white">
          <h2 className="font-display text-2xl font-bold text-garimpo-dark flex items-center gap-2">
            <ShoppingBag size={24} className="text-garimpo-rust" />
            Seu Garimpo
          </h2>
          <button onClick={onClose} className="p-2 text-garimpo-dark/50 hover:text-garimpo-dark hover:bg-garimpo-dark/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-garimpo-dark/50">
              <Disc3 size={48} strokeWidth={1} />
              <p className="font-sans text-lg">Sua sacola está vazia.</p>
              <button onClick={onClose} className="mt-4 text-garimpo-rust font-medium underline underline-offset-4">
                Continuar explorando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-garimpo-dark/5">
                {/* Imagem do Disco */}
                <div className="relative w-20 h-20 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-garimpo-dark/20"><Disc3 size={32} /></div>
                  )}
                </div>

                {/* Dados e Controles */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-sans font-bold text-garimpo-dark leading-tight">{item.title}</h3>
                    <p className="font-sans text-xs text-garimpo-dark/60">{item.artist}</p>
                    <p className="font-sans font-semibold text-garimpo-rust mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Botoes de Quantidade */}
                    <div className="flex items-center gap-3 bg-garimpo-bg rounded-md px-2 py-1 border border-garimpo-dark/10">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-garimpo-dark/60 hover:text-garimpo-dark"><Minus size={14} /></button>
                      <span className="font-sans text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-garimpo-dark/60 hover:text-garimpo-dark"><Plus size={14} /></button>
                    </div>
                    
                    {/* Botão Remover */}
                    <button onClick={() => removeItem(item.id)} className="text-red-500/70 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé (Subtotal e Botão de Checkout) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-garimpo-dark/10">
            <div className="flex justify-between items-center mb-6">
              <span className="font-sans text-garimpo-dark/70">Subtotal ({totalItems()} itens)</span>
              <span className="font-display text-2xl font-bold text-garimpo-dark">
                R$ {subtotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Link 
              href="/checkout" 
              onClick={onClose}
              className="w-full flex items-center justify-center bg-garimpo-rust text-white font-sans font-medium px-6 py-4 rounded-md hover:bg-garimpo-rust-hover transition-colors shadow-lg"
            >
              Finalizar Compra
            </Link>
            <p className="text-center text-xs text-garimpo-dark/50 mt-4">
              Frete e opções de retirada calculados na próxima etapa.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}