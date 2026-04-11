"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Boxes, ClipboardList, Loader2, PackagePlus, ShoppingBag, Users } from "lucide-react";
import { auth } from "@/lib/firebase";

const stats = [
	{
		title: "Produtos cadastrados",
		value: "42",
		detail: "Catálogo ativo",
		icon: Boxes,
	},
	{
		title: "Pedidos hoje",
		value: "7",
		detail: "Fluxo diário",
		icon: ShoppingBag,
	},
	{
		title: "Clientes atendidos",
		value: "18",
		detail: "Loja + online",
		icon: Users,
	},
];

export default function DashboardPage() {
	const router = useRouter();
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				router.push("/admin/login");
				return;
			}

			setIsCheckingAuth(false);
		});

		return unsubscribe;
	}, [router]);

	if (isCheckingAuth) {
		return (
			<main className="flex min-h-screen items-center justify-center px-4">
				<div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-garimpo-dark/70 shadow-sm">
					<Loader2 className="animate-spin text-garimpo-rust" size={18} />
					Validando acesso ao painel...
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-zinc-50 px-4 py-10 md:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-7xl">
				<header className="mb-8 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.35)] md:p-8">
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Admin</p>
					<h1 className="font-display text-4xl font-bold text-garimpo-dark md:text-5xl">Visão Geral</h1>
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-garimpo-dark/70">
						Painel rápido para acompanhar a operação e navegar entre produtos e pedidos.
					</p>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Link
							href="/admin/produtos"
							className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 font-medium text-garimpo-dark transition-colors hover:bg-zinc-100"
						>
							<ClipboardList size={16} />
							Ver Produtos
						</Link>
						<Link
							href="/admin/produtos/novo"
							className="inline-flex items-center justify-center gap-2 rounded-full bg-garimpo-rust px-5 py-3 font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
						>
							<PackagePlus size={16} />
							Cadastrar Novo Item
						</Link>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					{stats.map((item) => {
						const Icon = item.icon;

						return (
							<article
								key={item.title}
								className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.35)]"
							>
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-garimpo-rust/10 text-garimpo-rust">
									<Icon size={18} />
								</div>
								<p className="text-sm text-garimpo-dark/70">{item.title}</p>
								<p className="mt-2 font-display text-4xl font-bold text-garimpo-dark">{item.value}</p>
								<p className="mt-1 text-sm text-garimpo-dark/55">{item.detail}</p>
							</article>
						);
					})}
				</section>
			</div>
		</main>
	);
}
