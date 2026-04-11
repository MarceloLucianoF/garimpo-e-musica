// src/app/(public)/musica/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShoppingBag, MessageCircle, MapPin, Truck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { VinylLoader } from "@/components/ui/VinylLoader";

// Mock de um produto (na versão real, faremos um fetch no Firestore usando o slug)
const MOCK_PRODUCT = {
  id: "led-zeppelin-iv",
  title: "Led Zeppelin IV",
  artist: "Led Zeppelin",
  price: 280.00,
  format: "Vinil (LP 12\")",
  genre: "Classic Rock",
  conditionMedia: "NM (Near Mint)",
  conditionSleeve: "VG+ (Very Good Plus)",
  stock: 1,
  description: "Prensagem original em excelente estado. A mídia quase não tem marcas de uso, tocando de ponta a ponta sem chiados. A capa gatefold possui leve desgaste nas bordas devido ao tempo na prateleira.",
  images: ["/vinil-ledzeppelin.jpg"]
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  
  // Estado para controlar a nossa animação surpresa
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando o tempo de busca no banco de dados para ver o disco girando
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return <VinylLoader text="Preparando a agulha..." />;
  }

  const handleAddToCart = () => {
    addItem({
      id: MOCK_PRODUCT.id,
      title: MOCK_PRODUCT.title,
      artist: MOCK_PRODUCT.artist,
      price: MOCK_PRODUCT.price,
      format: MOCK_PRODUCT.format,
      image: MOCK_PRODUCT.images[0],
      quantity: 1,
    });
    // Opcional: Aqui poderíamos abrir o Drawer do carrinho automaticamente
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Coluna da Esquerda: Galeria Visual */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-card border border-garimpo-dark/5 bg-zinc-100">
            <Image
              src={MOCK_PRODUCT.images[0]}
              alt={MOCK_PRODUCT.title}
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
              {MOCK_PRODUCT.title}
            </h1>
            <h2 className="font-sans text-xl text-garimpo-dark/70 font-medium">
              {MOCK_PRODUCT.artist}
            </h2>
          </div>

          <div className="text-3xl font-sans font-bold text-garimpo-rust mb-6">
            R$ {MOCK_PRODUCT.price.toFixed(2).replace('.', ',')}
          </div>

          {/* Badges de Condição Críticos para Vinil */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="bg-garimpo-dark text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Mídia: {MOCK_PRODUCT.conditionMedia}
            </span>
            <span className="bg-garimpo-dark/10 text-garimpo-dark text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Capa: {MOCK_PRODUCT.conditionSleeve}
            </span>
            <span className="border border-garimpo-dark/20 text-garimpo-dark text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              {MOCK_PRODUCT.format}
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
              {MOCK_PRODUCT.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}