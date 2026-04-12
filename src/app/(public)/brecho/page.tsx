"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";

type ProductImage = {
	url: string;
};

type FashionProduct = {
	id: string;
	title?: string;
	description?: string;
	price?: number;
	images?: ProductImage[];
};

export default function BrechoPage() {
	const [products, setProducts] = useState<FashionProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadProducts = async () => {
			setIsLoading(true);

			try {
				const productsQuery = query(
					collection(db, "products"),
					where("type", "==", "Moda"),
					where("status", "==", "available"),
				);

				const snapshot = await getDocs(productsQuery);
				const data: FashionProduct[] = snapshot.docs.map((doc) => ({
					id: doc.id,
					...(doc.data() as Omit<FashionProduct, "id">),
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

	const getWhatsappHref = (title: string) => {
		const message = encodeURIComponent(
					`Vi a peça no site Garimpo & Música e quero saber se ela ainda está disponível: ${title}.`,
		);

		return `https://wa.me/5548996404427?text=${message}`;
	};

	return (
		<main className="bg-garimpo-bg text-garimpo-dark">
			<section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
				<div className="max-w-3xl">
					<p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Brechó</p>
					<h1 className="font-display text-4xl font-bold leading-tight text-garimpo-dark md:text-6xl">
						Vitrine de moda com história.
					</h1>
					<p className="mt-6 max-w-2xl text-base leading-relaxed text-garimpo-dark/75 md:text-lg">
						O brechó aparece aqui como vitrine e não como carrinho. A experiência é visual, editorial e direta: o item chama atenção, o interesse vira conversa e o WhatsApp segue como canal principal.
					</p>
				</div>

				<div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
					{isLoading &&
						Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="overflow-hidden rounded-[1.75rem] border border-garimpo-dark/10 bg-white p-5 animate-pulse">
								<div className="aspect-[4/5] rounded-xl bg-garimpo-dark/10" />
								<div className="mt-4 h-4 w-3/4 rounded bg-garimpo-dark/10" />
								<div className="mt-3 h-3 w-full rounded bg-garimpo-dark/10" />
							</div>
						))}

					{!isLoading && products.map((item) => (
						<article
							key={item.id}
							className="group overflow-hidden rounded-[1.75rem] border border-garimpo-dark/10 bg-white shadow-[0_16px_50px_-36px_rgba(0,0,0,0.35)]"
						>
							<div className="relative aspect-[4/5] overflow-hidden">
								<Image
									src={item.images?.[0]?.url || "/look-card.jpg"}
									alt={item.title || "Peca de moda"}
									fill
									unoptimized
									className="object-cover transition-transform duration-500 group-hover:scale-105"
									sizes="(max-width: 1280px) 50vw, 25vw"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
							</div>

							<div className="space-y-3 p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Lookbook</p>
								<h2 className="font-display text-2xl font-bold leading-tight text-garimpo-dark">{item.title || "Peca sem nome"}</h2>
								<p className="font-sans text-sm leading-relaxed text-garimpo-dark/70">{item.description || "Garimpo selecionado do acervo de moda."}</p>
								<p className="font-sans text-base font-semibold text-garimpo-rust">
									R$ {(item.price ?? 0).toFixed(2).replace(".", ",")}
								</p>
								<a
									href={getWhatsappHref(item.title || "Peca de moda")}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center justify-between gap-3 rounded-full bg-garimpo-rust px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
								>
									Tenho Interesse
									<ArrowRight size={16} />
								</a>
							</div>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
