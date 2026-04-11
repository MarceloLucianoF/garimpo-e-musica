"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Search, SlidersHorizontal } from "lucide-react";
import { db } from "@/lib/firebase";
import { VinylLoader } from "@/components/ui/VinylLoader";

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
  price?: number;
  conditionMedia?: string;
  images?: ProductImage[];
};

export default function MusicaPage() {
  const [products, setProducts] = useState<MusicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);

      try {
        const productsQuery = query(
          collection(db, "products"),
          where("type", "in", ["Música", "music"]),
          where("status", "==", "available"),
          where("availableOnline", "==", true),
        );

        const snapshot = await getDocs(productsQuery);
        const data: MusicProduct[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MusicProduct, "id">),
        }));

        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  if (isLoading) {
    return <VinylLoader text="Buscando discos no acervo..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold mb-4 text-garimpo-dark">Música & Colecionáveis</h1>
          <p className="text-garimpo-dark/70">Discos de vinil e CDs selecionados por quem ama música. Peças raras e clássicos para sua coleção.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-garimpo-dark/40" size={18} />
            <input type="text" placeholder="Buscar artista ou álbum..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-garimpo-dark/10 focus:outline-garimpo-rust" />
          </div>
          <button className="p-2 border border-garimpo-dark/10 rounded-lg hover:bg-white transition-colors"><SlidersHorizontal size={20} /></button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((disco) => (
          <Link key={disco.id} href={`/musica/${disco.slug || disco.id}`} className="group flex flex-col">
            <article className="flex h-full flex-col">
              <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-white shadow-sm border border-garimpo-dark/5 transition-all group-hover:shadow-card group-hover:-translate-y-1">
                <Image
                  src={disco.images?.[0]?.url || "/vinil-card.jpg"}
                  alt={disco.title || "Produto musical"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <span className="absolute top-3 right-3 bg-garimpo-dark/90 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {disco.conditionMedia || "VG"}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg leading-tight group-hover:text-garimpo-rust transition-colors">{disco.title || "Sem título"}</h3>
              <p className="text-sm text-garimpo-dark/60 mb-2">{disco.artist || "Artista não informado"}</p>
              <p className="font-sans font-semibold text-garimpo-rust">
                R$ {(disco.price ?? 0).toFixed(2).replace(".", ",")}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}