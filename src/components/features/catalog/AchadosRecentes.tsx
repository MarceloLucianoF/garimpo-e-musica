"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ProductImage = {
  url: string;
};

type MusicProduct = {
  id: string;
  slug?: string;
  title?: string;
  artist?: string;
  price?: number;
  stock?: number;
  conditionMedia?: string;
  images?: ProductImage[];
};

export function AchadosRecentes() {
  const [products, setProducts] = useState<MusicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentFinds = async () => {
      setIsLoading(true);

      try {
        const recentQuery = query(
          collection(db, "products"),
          where("type", "==", "Música"),
          where("status", "==", "available"),
          orderBy("createdAt", "desc"),
          limit(4),
        );

        const snapshot = await getDocs(recentQuery);
        const data: MusicProduct[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MusicProduct, "id">),
        }));

        setProducts(data);
      } catch {
        try {
          const fallbackQuery = query(
            collection(db, "products"),
            where("type", "==", "Música"),
            where("status", "==", "available"),
            limit(4),
          );

          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackData: MusicProduct[] = fallbackSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MusicProduct, "id">),
          }));

          setProducts(fallbackData);
        } catch {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecentFinds();
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:pb-20">
      <div className="mb-8 md:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-garimpo-rust">Novidades do Acervo</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-garimpo-dark">Achados Recentes</h2>
        <p className="mt-3 max-w-2xl text-garimpo-dark/70">
          Entradas mais recentes de discos no nosso acervo. Se gostou, aproveite agora: peças sem reposição.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-garimpo-dark/10" />
              <div className="mt-3 h-4 w-4/5 rounded bg-garimpo-dark/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-garimpo-dark/10" />
              <div className="mt-2 h-4 w-1/3 rounded bg-garimpo-dark/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((disco) => (
            <Link key={disco.id} href={`/musica/${disco.slug || disco.id}`} className="group flex flex-col">
              <article className="flex h-full flex-col">
                <div className="relative aspect-square overflow-hidden rounded-xl mb-3 md:mb-4 bg-white shadow-sm border border-garimpo-dark/5 transition-all group-hover:shadow-card group-hover:-translate-y-1">
                  <Image
                    src={disco.images?.[0]?.url || "/vinil-card.jpg"}
                    alt={disco.title || "Produto musical"}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {disco.stock === 1 && (
                    <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-bold tracking-wide text-white shadow-sm animate-pulse">
                      ULTIMA UNIDADE
                    </span>
                  )}
                  <span className="absolute top-3 right-3 rounded bg-garimpo-dark px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    {disco.conditionMedia || "VG"}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base md:text-lg leading-tight group-hover:text-garimpo-rust transition-colors mb-1">
                  {disco.title || "Sem titulo"}
                </h3>
                <p className="text-xs md:text-sm text-garimpo-dark/60 mb-2">{disco.artist || "Artista nao informado"}</p>
                <p className="font-sans font-semibold text-garimpo-rust text-base md:text-lg">
                  R$ {(disco.price ?? 0).toFixed(2).replace(".", ",")}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
