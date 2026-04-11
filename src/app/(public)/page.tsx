// src/app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Disc3, Shirt, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Foco em SEO e Identidade) */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero-loja.jpg"
          alt="Fachada Garimpo & Música na Lagoa da Conceição"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6 mt-10">
          {/* H1 Otimizado para o Google */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
            Garimpo & Música | Brechó e Loja de Discos na Lagoa da Conceição
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md">
            No coração da Lagoa, unimos o garimpo autêntico de roupas com história à paixão pelo som analógico. Encontre peças únicas e discos raros em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/musica" className="bg-garimpo-rust text-white font-sans font-medium px-8 py-4 rounded-md hover:bg-garimpo-rust-hover transition-all shadow-xl text-center">
              Explorar Discos e CDs
            </Link>
            <Link href="/brecho" className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-sans font-medium px-8 py-4 rounded-md hover:bg-white/20 transition-all shadow-xl text-center">
              Conhecer o Brechó
            </Link>
          </div>
        </div>
      </section>

      {/* 2. A NOSSA CURADORIA (Benhur e Rosana) */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
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

      {/* 3. CARDS DE NAVEGAÇÃO */}
      <section className="pb-20 px-4 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10">
        <Link href="/brecho" className="group relative h-[450px] overflow-hidden rounded-2xl shadow-card">
          <Image src="/look-card.jpg" alt="Roupas Vintage e Brechó" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <div className="bg-garimpo-olive text-white p-2 rounded-full w-fit mb-4"><Shirt size={24} /></div>
            <h3 className="font-display text-3xl font-bold text-white mb-2">A Vitrine de Moda</h3>
            <p className="text-white/80 font-medium">Peças únicas para quem garimpa estilo.</p>
          </div>
        </Link>

        <Link href="/musica" className="group relative h-[450px] overflow-hidden rounded-2xl shadow-card">
          <Image src="/vinil-card.jpg" alt="Venda de Vinil em Floripa" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-linear-to-t from-garimpo-dark/90 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <div className="bg-garimpo-rust text-white p-2 rounded-full w-fit mb-4"><Disc3 size={24} /></div>
            <h3 className="font-display text-3xl font-bold text-white mb-2">O Acervo Musical</h3>
            <p className="text-white/80 font-medium">Relíquias em 33 e 45 rotações.</p>
          </div>
        </Link>
      </section>

      {/* 4. VIBE LOCAL (Rodapé Institucional) */}
      <section className="bg-garimpo-olive/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <MapPin size={40} className="text-garimpo-olive mb-4" />
          <h2 className="font-display text-3xl font-bold text-garimpo-dark mb-4">
            Mais que uma loja, um ponto de encontro na Lagoa.
          </h2>
          <p className="font-sans text-lg text-garimpo-dark/80 max-w-2xl">
            Localizado na charmosa Lagoa da Conceição, o Garimpo & Música é o refúgio para quem gosta de perder o fôlego em um bom garimpo e o tempo em uma boa conversa. Venha tomar um café conosco e folhear nossos discos.
          </p>
        </div>
      </section>
    </div>
  );
}