// src/app/(public)/musica/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShoppingBag, MessageCircle, MapPin, Truck, ArrowRight, Star, Headphones } from "lucide-react";
import { CONDITIONS, normalizeCondition } from "@/lib/constants/conditions";
import { useCartStore } from "@/store/cartStore";
import { DiscLoader } from "@/components/ui/DiscLoader";
import { VinylLoader } from "@/components/ui/VinylLoader";
import { getProductById } from "@/lib/services/product.service";
import type { Product } from "@/types";

function ConditionStars({ condition }: { condition?: string }) {
  const normalized = normalizeCondition(condition);
  const score = CONDITIONS[normalized].stars;

  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < score ? "fill-garimpo-rust text-garimpo-rust" : "text-garimpo-dark/30"}
        />
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const slugParam = Array.isArray(slug) ? slug[0] : slug;

  useEffect(() => {
    const loadProduct = async () => {
      if (!slugParam) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const loadedProduct = await getProductById(slugParam, {
          allowSlugLookup: true,
          status: "available",
        });
        setProduct(loadedProduct);
      } catch (error) {
        console.error("[musica/[slug]] Failed to load product", {
          slugParam,
          error,
        });
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [slugParam]);

  if (isLoading) {
    return <VinylLoader text="Preparando a agulha..." />;
  }

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-4xl font-bold text-[#F5F1E8]">Disco não encontrado</h1>
        <p className="mt-4 text-white/70">
          Não encontramos este item no acervo atual. Ele pode ter sido removido ou esgotado.
        </p>
        <Link
          href="/musica"
          className="group mt-8 inline-flex items-center justify-between gap-3 rounded-full bg-[#F5F1E8] px-5 py-3 font-medium text-zinc-900 transition-all hover:scale-105"
        >
          <span>Voltar para Música</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!product || isAdding || (product.stock ?? 0) <= 0) {
      return;
    }

    setIsAdding(true);
    addItem({
      id: product.id,
      title: product.title || "Sem título",
      artist: product.artist || "Artista não informado",
      price: product.price || 0,
      format: product.format || "vinyl_lp",
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity: 1,
    });

    globalThis.setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-7xl px-0 md:px-4 py-10 md:py-16">
      <div className="grid gap-6 md:gap-10 md:grid-cols-2 lg:gap-16">
        
        {/* Coluna da Esquerda: Galeria Visual - Full-Width Mobile */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="relative aspect-square w-screen md:w-full overflow-hidden rounded-none md:rounded-2xl border-0 md:border md:border-white/10 bg-white/5 shadow-none md:shadow-sm">
            <Image
              src={product.images?.[0]?.url || "/vinil-card.jpg"}
              alt={product.title || "Produto musical"}
              fill
              unoptimized={true}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="text-xs text-center text-white/40 italic px-4 md:px-0">
            *Fotos reais do produto que você irá receber.
          </p>
        </div>

        {/* Coluna da Direita: Dados Técnicos e Compra */}
        <div className="flex flex-col px-4 md:px-0">
          {/* Cabeçalho do Produto */}
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-[#F5F1E8] leading-tight mb-2">
              {product.title || "Sem título"}
            </h1>
            <h2 className="font-sans text-lg md:text-xl text-white/70 font-medium mb-2">
              {product.artist || "Artista não informado"}
            </h2>
          </div>

          <div className="text-3xl md:text-4xl font-sans font-bold text-white mb-4 md:mb-6">
            R$ {(product.price || 0).toFixed(2).replace('.', ',')}
          </div>

          {/* Badges de Condição Críticos para Vinil */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Midia:
              <ConditionStars condition={product.conditionMedia} />
            </span>
            <span className="inline-flex items-center gap-2 bg-white/5 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Capa:
              <ConditionStars condition={product.conditionSleeve} />
            </span>
            <span className="border border-white/20 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {product.format || "Vinil"}
            </span>
          </div>

          {/* Call to Actions (Botões) - Premium */}
          <div className="mb-8 md:mb-10 flex flex-col gap-3">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding || (product.stock ?? 0) <= 0}
              className={`group flex w-full items-center justify-center gap-3 rounded-full px-6 md:px-8 py-4 font-sans font-bold text-base transition-all touch-target ${
                (product.stock ?? 0) <= 0
                  ? "bg-zinc-700 text-zinc-300 opacity-70 cursor-not-allowed"
                  : "bg-[#F5F1E8] text-zinc-900 hover:scale-105 hover:shadow-2xl active:scale-95"
              }`}
            >
              {isAdding ? (
                <>
                  <DiscLoader />
                  Adicionando...
                </>
              ) : (product.stock ?? 0) <= 0 ? (
                "ESGOTADO"
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Adicionar ao Carrinho
                </>
              )}
            </button>
            
            <a 
              href="https://wa.me/5548996404427?text=Vi%20a%20peça%20no%20site%20Garimpo%20%26%20Música%20e%20quero%20tirar%20uma%20dúvida%20sobre%20esse%20disco."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-transparent px-6 md:px-8 py-4 font-sans font-bold text-white text-base transition-all hover:border-[#F5F1E8] hover:bg-white/5 active:scale-95 touch-target"
            >
              <MessageCircle size={20} />
              Dúvida no WhatsApp
            </a>

            {product.spotifyUrl && (
              <a
                href={product.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 md:px-8 py-4 font-sans font-bold text-white text-base transition-all hover:border-[#F5F1E8] hover:bg-white/10"
              >
                <Headphones size={20} />
                Ouvir no Spotify
              </a>
            )}
          </div>

          {/* Entrega e Logística */}
          <div className="bg-white/5 rounded-xl p-5 flex flex-col gap-4 border border-white/10 mb-10">
            <div className="flex items-start gap-3">
              <MapPin className="text-white/60 mt-0.5" size={20} />
              <div>
                <p className="font-sans font-medium text-white">Retirada Grátis na Lagoa</p>
                <p className="text-sm text-white/60">Compre online e pegue hoje mesmo no brechó.</p>
              </div>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="flex items-start gap-3">
              <Truck className="text-white/60 mt-0.5" size={20} />
              <div>
                <p className="font-sans font-medium text-white">Envio para todo o Brasil</p>
                <p className="text-sm text-white/60">Cálculo de frete disponível no checkout.</p>
              </div>
            </div>
          </div>

          {/* Descrição Técnica */}
          <div>
            <h3 className="font-sans font-bold text-white mb-3">Sobre este garimpo</h3>
            <p className="font-sans text-white/80 leading-relaxed text-sm">
              {product.description || "Descrição não informada."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}