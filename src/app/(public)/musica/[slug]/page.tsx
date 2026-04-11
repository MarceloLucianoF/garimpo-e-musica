// src/app/(public)/musica/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { ShoppingBag, MessageCircle, MapPin, Truck } from "lucide-react";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/cartStore";
import { VinylLoader } from "@/components/ui/VinylLoader";

type ProductImage = {
  url: string;
};

type Product = {
  id: string;
  title?: string;
  artist?: string;
  price?: number;
  format?: string;
  conditionMedia?: string;
  conditionSleeve?: string;
  description?: string;
  images?: ProductImage[];
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);

  const [isLoading, setIsLoading] = useState(true);
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
        const productQuery = query(
          collection(db, "products"),
          where("slug", "==", slugParam),
          limit(1),
        );

        const snapshot = await getDocs(productQuery);

        if (snapshot.empty) {
          setProduct(null);
          return;
        }

        const doc = snapshot.docs[0];
        setProduct({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        });
      } catch {
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
        <h1 className="font-display text-4xl font-bold text-garimpo-dark">Disco não encontrado</h1>
        <p className="mt-4 text-garimpo-dark/70">
          Não encontramos este item no acervo atual. Ele pode ter sido removido ou esgotado.
        </p>
        <Link
          href="/musica"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-garimpo-rust px-5 py-3 font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
        >
          Voltar para Música
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title || "Sem título",
      artist: product.artist || "Artista não informado",
      price: product.price || 0,
      format: product.format || "vinyl_lp",
      image: product.images?.[0]?.url,
      quantity: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Coluna da Esquerda: Galeria Visual */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-card border border-garimpo-dark/5 bg-zinc-100">
            <Image
              src={product.images?.[0]?.url || "/vinil-card.jpg"}
              alt={product.title || "Produto musical"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="text-xs text-center text-garimpo-dark/50 italic">
            *Fotos reais do produto que você irá receber.
          </p>
        </div>

        {/* Coluna da Direita: Dados Técnicos e Compra */}
        <div className="flex flex-col">
          {/* Cabeçalho do Produto */}
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-garimpo-dark leading-tight mb-2">
              {product.title || "Sem título"}
            </h1>
            <h2 className="font-sans text-xl text-garimpo-dark/70 font-medium">
              {product.artist || "Artista não informado"}
            </h2>
          </div>

          <div className="text-3xl font-sans font-bold text-garimpo-rust mb-6">
            R$ {(product.price || 0).toFixed(2).replace('.', ',')}
          </div>

          {/* Badges de Condição Críticos para Vinil */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="bg-garimpo-dark text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Mídia: {product.conditionMedia || "VG"}
            </span>
            <span className="bg-garimpo-dark/10 text-garimpo-dark text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Capa: {product.conditionSleeve || "VG"}
            </span>
            <span className="border border-garimpo-dark/20 text-garimpo-dark text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              {product.format || "Vinil"}
            </span>
          </div>

          {/* Call to Actions (Botões) */}
          <div className="flex flex-col gap-4 mb-10">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-garimpo-rust text-white font-sans font-medium px-8 py-4 rounded-md transition-all hover:bg-garimpo-rust-hover hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Adicionar ao Carrinho
            </button>
            
            <a 
              href="https://wa.me/5548999999999?text=Olá! Queria tirar uma dúvida sobre o vinil do Led Zeppelin no site."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-transparent border border-garimpo-dark/20 text-garimpo-dark font-sans font-medium px-8 py-4 rounded-md transition-colors hover:bg-garimpo-dark/5 flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Tirar dúvida no WhatsApp
            </a>
          </div>

          {/* Entrega e Logística */}
          <div className="bg-garimpo-bg rounded-lg p-5 flex flex-col gap-4 border border-garimpo-dark/5 mb-10">
            <div className="flex items-start gap-3">
              <MapPin className="text-garimpo-olive mt-0.5" size={20} />
              <div>
                <p className="font-sans font-medium text-garimpo-dark">Retirada Grátis na Lagoa</p>
                <p className="text-sm text-garimpo-dark/60">Compre online e pegue hoje mesmo no brechó.</p>
              </div>
            </div>
            <div className="w-full h-px bg-garimpo-dark/10"></div>
            <div className="flex items-start gap-3">
              <Truck className="text-garimpo-dark/50 mt-0.5" size={20} />
              <div>
                <p className="font-sans font-medium text-garimpo-dark">Envio para todo o Brasil</p>
                <p className="text-sm text-garimpo-dark/60">Cálculo de frete disponível no checkout.</p>
              </div>
            </div>
          </div>

          {/* Descrição Técnica */}
          <div>
            <h3 className="font-sans font-bold text-garimpo-dark mb-3">Sobre este garimpo</h3>
            <p className="font-sans text-garimpo-dark/80 leading-relaxed text-sm">
              {product.description || "Descrição não informada."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}