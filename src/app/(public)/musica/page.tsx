"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, Star } from "lucide-react";
import { VinylLoader } from "@/components/ui/VinylLoader";
import { CONDITIONS, normalizeCondition } from "@/lib/constants/conditions";
import { getProductsByContext } from "@/lib/services/product.service";
import { useCartStore } from "@/store/cartStore";

type ProductImage = {
  url: string;
  path?: string;
  order?: number;
};

type MusicProduct = {
  id: string;
  slug?: string;
  title?: string;
  artist?: string;
  genre?: string | string[];
  price?: number;
  stock?: number;
  conditionMedia?: string;
  images?: ProductImage[];
  createdAt?: { seconds?: number };
};

function ConditionStars({ condition }: { condition?: string }) {
  const key = normalizeCondition(condition);
  const meta = CONDITIONS[key];

  return (
    <span className="inline-flex items-center gap-1" title={meta.description}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={13}
          className={index < meta.stars ? "fill-[#F5F1E8] text-[#F5F1E8]" : "text-white/20"}
        />
      ))}
    </span>
  );
}

export default function MusicaPage() {
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<MusicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);

      try {
        const data = (await getProductsByContext({
          type: "music",
          status: "available",
          availableOnline: true,
        })) as MusicProduct[];

        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const artists = useMemo(
    () =>
      [...new Set(products.map((product) => product.artist).filter(Boolean) as string[])]
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 12),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const artistOk = selectedArtists.length === 0 || (product.artist ? selectedArtists.includes(product.artist) : false);

      const rawGenre = product.genre;
      const genreList = Array.isArray(rawGenre)
        ? rawGenre.map((item) => String(item).toLowerCase())
        : rawGenre
          ? [String(rawGenre).toLowerCase()]
          : [];

      const genreOk = selectedGenre === "all" || genreList.includes(selectedGenre.toLowerCase());

      const price = product.price ?? 0;
      const priceOk =
        priceRange === "all" ||
        (priceRange === "low" && price <= 120) ||
        (priceRange === "mid" && price > 120 && price <= 260) ||
        (priceRange === "high" && price > 260);

      return artistOk && genreOk && priceOk;
    });
  }, [priceRange, products, selectedArtists, selectedGenre]);

  const sortedRecent = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aSeconds = a.createdAt?.seconds ?? 0;
      const bSeconds = b.createdAt?.seconds ?? 0;
      return bSeconds - aSeconds;
    });
  }, [filteredProducts]);

  const featured = sortedRecent.slice(0, 4);
  const featuredLead = featured[0];

  const toggleArtist = (artist: string) => {
    setSelectedArtists((current) =>
      current.includes(artist) ? current.filter((item) => item !== artist) : [...current, artist],
    );
  };

  const handleAddToCart = (product: MusicProduct) => {
    addItem({
      id: product.id,
      title: product.title || "Sem titulo",
      artist: product.artist || "Artista nao informado",
      price: product.price || 0,
      format: "vinyl_lp",
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity: 1,
    });
  };

  if (isLoading) {
    return <VinylLoader text="Buscando discos no acervo..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-[#F5F1E8]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-12">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Lado A Discos</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-[#F5F1E8] md:text-5xl">Acervo de Vinil</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
              Colecao com curadoria independente para quem compra musica como experiencia.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-[#F5F1E8] md:hidden"
          >
            <Menu size={16} />
            Filtros
          </button>
        </div>

        <div className="flex items-start gap-8">
          <aside className="hidden w-64 shrink-0 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Filtros</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#F5F1E8]">Artistas</h3>
              <div className="mt-3 space-y-2">
                {artists.map((artist) => (
                  <button
                    key={artist}
                    type="button"
                    onClick={() => toggleArtist(artist)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedArtists.includes(artist)
                        ? "border-[#F5F1E8] bg-zinc-800 text-[#F5F1E8]"
                        : "border-zinc-800 bg-zinc-900 text-white/70 hover:border-zinc-600"
                    }`}
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-semibold text-[#F5F1E8]">Genero</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { label: "Todos", value: "all" },
                  { label: "Rock", value: "rock" },
                  { label: "MPB", value: "mpb" },
                  { label: "Jazz", value: "jazz" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedGenre(option.value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedGenre === option.value
                        ? "border-[#F5F1E8] bg-zinc-800 text-[#F5F1E8]"
                        : "border-zinc-800 bg-zinc-900 text-white/70 hover:border-zinc-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-semibold text-[#F5F1E8]">Faixa de Preco</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { label: "Todas", value: "all" },
                  { label: "Ate R$ 120", value: "low" },
                  { label: "R$ 121 a R$ 260", value: "mid" },
                  { label: "Acima de R$ 260", value: "high" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriceRange(option.value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      priceRange === option.value
                        ? "border-[#F5F1E8] bg-zinc-800 text-[#F5F1E8]"
                        : "border-zinc-800 bg-zinc-900 text-white/70 hover:border-zinc-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-10">
            {featuredLead && (
              <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <article className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Curadoria da Semana</p>
                  <div className="mt-4 grid items-center gap-6 md:grid-cols-[170px_1fr]">
                    <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
                      <Image
                        src={featuredLead.images?.[0]?.url || "/vinil-card.jpg"}
                        alt={featuredLead.title || "Disco em destaque"}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="176px"
                      />
                    </div>

                    <div>
                      <h2 className="font-display text-3xl font-bold text-[#F5F1E8]">{featuredLead.title || "Selecao especial"}</h2>
                      <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-white/55">{featuredLead.artist || "Artista"}</p>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                        Uma edicao que marca geracao, com pressagem cobicada e presenca sonora que justifica cada giro no prato.
                        Recomendacao da semana para quem busca compra com historia.
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <Link
                          href={`/musica/${featuredLead.slug || featuredLead.id}`}
                          className="inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-5 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-105"
                        >
                          Ouvir e Comprar
                        </Link>
                        <p className="text-sm font-semibold text-white/75">R$ {(featuredLead.price ?? 0).toFixed(2).replace(".", ",")}</p>
                      </div>
                    </div>
                  </div>
                </article>

                <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Selecao</p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-[#F5F1E8]">Vinil com alma</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Cada disco do Lado A passa por triagem de estado, audio e relevancia cultural antes de entrar no acervo.
                  </p>
                </aside>
              </section>
            )}

            <section id="em-destaque">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold text-[#F5F1E8]">Em Destaque</h2>
                <span className="text-sm text-white/55">{featured.length} discos selecionados</span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {featured.map((disco) => {
                  const conditionKey = normalizeCondition(disco.conditionMedia);
                  const conditionMeta = CONDITIONS[conditionKey];

                  return (
                    <article key={`featured-${disco.id}`} className="group flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-950 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700">
                      <Link href={`/musica/${disco.slug || disco.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-900">
                        <Image
                          src={disco.images?.[0]?.url || "/vinil-card.jpg"}
                          alt={disco.title || "Produto musical"}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 1280px) 50vw, 25vw"
                        />
                      </Link>

                      <div className="mt-4 flex flex-1 flex-col">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{disco.artist || "Artista nao informado"}</p>
                        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-[#F5F1E8]">{disco.title || "Sem titulo"}</h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                          <ConditionStars condition={disco.conditionMedia} />
                          <span>{conditionMeta.label}</span>
                        </div>
                        <p className="mt-4 text-base font-semibold text-[#F5F1E8]">R$ {(disco.price ?? 0).toFixed(2).replace(".", ",")}</p>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(disco)}
                            disabled={(disco.stock ?? 0) <= 0}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-transform ${
                              (disco.stock ?? 0) <= 0
                                ? "bg-zinc-700 text-zinc-300"
                                : "bg-[#F5F1E8] text-zinc-900 hover:scale-105"
                            }`}
                          >
                            {(disco.stock ?? 0) <= 0 ? "Esgotado" : "Adicionar"}
                          </button>
                          <Link href={`/musica/${disco.slug || disco.id}`} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
                            Detalhes
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold text-[#F5F1E8]">Recem-Chegados</h2>
                <span className="text-sm text-white/55">{sortedRecent.length} itens</span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sortedRecent.map((disco) => {
                  const conditionKey = normalizeCondition(disco.conditionMedia);
                  const conditionMeta = CONDITIONS[conditionKey];

                  return (
                    <article key={disco.id} className="group flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-950 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700">
                      <Link href={`/musica/${disco.slug || disco.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-900">
                        <Image
                          src={disco.images?.[0]?.url || "/vinil-card.jpg"}
                          alt={disco.title || "Produto musical"}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 1280px) 50vw, 33vw"
                        />
                      </Link>

                      <div className="mt-4 flex flex-1 flex-col">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{disco.artist || "Artista nao informado"}</p>
                        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-[#F5F1E8]">{disco.title || "Sem titulo"}</h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                          <ConditionStars condition={disco.conditionMedia} />
                          <span>{conditionMeta.label}</span>
                        </div>
                        <p className="mt-4 text-base font-semibold text-[#F5F1E8]">R$ {(disco.price ?? 0).toFixed(2).replace(".", ",")}</p>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(disco)}
                            disabled={(disco.stock ?? 0) <= 0}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-transform ${
                              (disco.stock ?? 0) <= 0
                                ? "bg-zinc-700 text-zinc-300"
                                : "bg-[#F5F1E8] text-zinc-900 hover:scale-105"
                            }`}
                          >
                            {(disco.stock ?? 0) <= 0 ? "Esgotado" : "Adicionar"}
                          </button>
                          <Link href={`/musica/${disco.slug || disco.id}`} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
                            Detalhes
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="sobre" className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="font-display text-2xl font-bold text-[#F5F1E8]">Sobre a Lado A Discos</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
                Curadoria especializada para colecionadores e ouvintes exigentes, com foco em procedencia, conservacao e entrega segura para todo o Brasil.
              </p>
            </section>
          </div>
        </div>
      </section>

      {isFiltersOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button className="absolute inset-0 bg-black/70" onClick={() => setIsFiltersOpen(false)} aria-label="Fechar filtros" />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Filtros</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#F5F1E8]">Genero</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { label: "Todos", value: "all" },
                  { label: "Rock", value: "rock" },
                  { label: "MPB", value: "mpb" },
                  { label: "Jazz", value: "jazz" },
                ].map((option) => (
                  <button
                    key={`mobile-${option.value}`}
                    type="button"
                    onClick={() => setSelectedGenre(option.value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedGenre === option.value
                        ? "border-[#F5F1E8] bg-zinc-800 text-[#F5F1E8]"
                        : "border-zinc-800 bg-zinc-900 text-white/70"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
