// src/app/(public)/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Disc3, Shirt, MapPin, Clock, Coffee, ArrowRight } from "lucide-react";
import { AchadosRecentes } from "@/components/features/catalog/AchadosRecentes";

export const metadata: Metadata = {
  title: "Garimpo & Música | Brechó e Vinil na Lagoa da Conceição",
  description:
    "Peças únicas e discos raros. Garimpe online ou visite nossa loja na Lagoa da Conceição.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Foco em SEO e Identidade) */}
      <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden px-4 py-12 md:h-[85vh] md:py-24">
        <Image
          src="/hero-loja.jpg"
          alt="Fachada Garimpo & Música na Lagoa da Conceição"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
        
        <div className="relative z-10 mt-10 flex max-w-4xl flex-col items-center px-0 text-center md:px-6">
          {/* H1 Otimizado para o Google - Mobile-First Agressivo */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
            Garimpo & Música | Brechó e Loja de Discos na Lagoa da Conceição
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md">
            Peças únicas e discos raros, sem reposição. Garimpe online ou visite nossa loja na Lagoa da Conceição.
          </p>
          
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <Link href="/musica" className="group inline-flex w-full items-center justify-between gap-3 bg-garimpo-rust px-8 py-4 text-white font-sans font-medium rounded-md hover:bg-garimpo-rust-hover transition-all shadow-xl text-center md:w-auto">
              <span>Explorar Discos Raros</span>
              <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/brecho" className="group inline-flex w-full items-center justify-between gap-3 bg-white/10 backdrop-blur-md border border-white/30 px-8 py-4 text-white font-sans font-medium rounded-md hover:bg-white/20 transition-all shadow-xl text-center md:w-auto">
              <span>Ver Peças do Brechó</span>
              <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. A NOSSA CURADORIA (Benhur e Rosana) */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-garimpo-dark mb-6">
          Curadoria com Alma, Garimpo com Propósito
        </h2>
        <p className="font-sans text-lg text-garimpo-dark/80 leading-relaxed mb-6">
          O <strong>Garimpo & Música</strong> nasceu do desejo de Benhur e Rosana de criar um espaço real de descoberta.
        </p>
        <p className="font-sans text-lg text-garimpo-dark/80 leading-relaxed">
          <strong>No Brechó:</strong> Fugimos do óbvio. Selecionamos roupas e acessórios que carregam identidade, focando em qualidade e no consumo consciente que a nossa Ilha pede.<br/><br/>
          <strong>Na Música:</strong> Tratamos cada Vinil e CD como uma relíquia. Nossa loja é o destino para quem busca desde clássicos da MPB até raridades do rock, sempre com avaliação técnica rigorosa.
        </p>
      </section>

      <AchadosRecentes />

      {/* 3. CARDS DE NAVEGAÇÃO - Mobile-First com Contraste Aumentado */}
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-20 md:grid-cols-2 md:gap-10">
        <Link href="/brecho" className="group relative h-[320px] overflow-hidden rounded-2xl shadow-card md:h-[450px]">
          <Image src="/look-card.jpg" alt="Roupas Vintage e Brechó" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto">
            <div className="bg-garimpo-olive text-white p-2 rounded-full w-fit mb-4"><Shirt size={24} /></div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">A Vitrine de Moda</h3>
            <p className="text-white/85 font-medium text-sm md:text-base leading-snug">Peças únicas para quem garimpa estilo.</p>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline transition-colors group-hover:text-garimpo-rust">
              Ver acervo
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        <Link href="/musica" className="group relative h-[320px] overflow-hidden rounded-2xl shadow-card md:h-[450px]">
          <Image src="/vinil-card.jpg" alt="Venda de Vinil em Floripa" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto">
            <div className="bg-garimpo-rust text-white p-2 rounded-full w-fit mb-4"><Disc3 size={24} /></div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">O Acervo Musical</h3>
            <p className="text-white/85 font-medium text-sm md:text-base leading-snug">Relíquias em 33 e 45 rotações.</p>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline transition-colors group-hover:text-garimpo-rust">
              Ver acervo
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>

      {/* 4. VIBE LOCAL (Rodapé Institucional) com CTA Google Maps */}
      <section className="bg-garimpo-olive/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <MapPin size={40} className="text-garimpo-olive mb-4" />
          <h2 className="font-display text-3xl font-bold text-garimpo-dark mb-4">
            Mais que uma loja, um ponto de encontro na Lagoa.
          </h2>
          <p className="font-sans text-lg text-garimpo-dark/80 max-w-2xl mb-6">
            Localizado na charmosa Lagoa da Conceição, o Garimpo & Música é o refúgio para quem gosta de perder o fôlego em um bom garimpo e o tempo em uma boa conversa. Venha tomar um café conosco e folhear nossos discos.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-garimpo-dark/70">
              <Clock size={20} />
              <span className="font-sans text-sm md:text-base font-medium">Terça a Sábado — 10h às 19h</span>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 font-sans text-sm md:text-base font-medium text-garimpo-dark/80">
            <MapPin size={18} className="text-garimpo-olive" />
            A poucos minutos da Lagoa da Conceição
          </p>
          <p className="mt-1 inline-flex items-center gap-2 font-sans text-sm md:text-base font-medium text-garimpo-dark/80 mb-5">
            <Coffee size={18} className="text-garimpo-olive" />
            Tem café no local
          </p>
          <a href="https://maps.google.com/?q=Garimpo+Música+Lagoa+da+Conceição" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-garimpo-rust text-white font-sans font-semibold px-6 py-3 rounded-lg hover:bg-garimpo-rust-hover transition-all shadow-lg">
            Abrir rota no celular
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}