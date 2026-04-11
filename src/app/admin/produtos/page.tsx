"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { AlertCircle, ArrowLeft, Loader2, PackagePlus, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";

type ProductItem = {
	id: string;
	type?: string;
	title?: string;
	price?: number;
	stock?: number;
	availableOnline?: boolean;
	status?: string;
};

export default function ProdutosPage() {
	const router = useRouter();
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [products, setProducts] = useState<ProductItem[]>([]);
	const [fetchError, setFetchError] = useState("");
	const [actionError, setActionError] = useState("");
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const loadProducts = async () => {
		setFetchError("");
		setActionError("");
		setIsLoading(true);

		try {
			const snapshot = await getDocs(collection(db, "products"));
			const data: ProductItem[] = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as Omit<ProductItem, "id">),
			}));

			setProducts(data);
		} catch {
			setFetchError("Não foi possível carregar os produtos agora.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (productId: string) => {
		const confirmed = window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.");
		if (!confirmed) {
			return;
		}

		setActionError("");
		setDeletingId(productId);

		try {
			await deleteDoc(doc(db, "products", productId));
			setProducts((prev) => prev.filter((item) => item.id !== productId));
		} catch {
			setActionError("Não foi possível excluir o produto agora.");
		} finally {
			setDeletingId(null);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				router.push("/admin/login");
				return;
			}

			setIsCheckingAuth(false);
			void loadProducts();
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
				<header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between md:p-8">
					<div>
						<p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Admin / Produtos</p>
						<div className="flex items-center gap-3">
							<Link
								href="/admin/dashboard"
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-garimpo-dark transition-colors hover:bg-zinc-100"
								aria-label="Voltar para dashboard"
							>
								<ArrowLeft size={16} />
							</Link>
							<h1 className="font-display text-4xl font-bold text-garimpo-dark md:text-5xl">Lista de produtos</h1>
						</div>
						<p className="mt-3 text-base text-garimpo-dark/70">Gerencie os itens cadastrados no Firestore.</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onClick={() => void loadProducts()}
							className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 font-medium text-garimpo-dark transition-colors hover:bg-zinc-100"
						>
							<RefreshCcw size={16} />
							Atualizar
						</button>
						<Link
							href="/admin/produtos/novo"
							className="inline-flex items-center justify-center gap-2 rounded-full bg-garimpo-rust px-5 py-3 font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
						>
							<PackagePlus size={16} />
							Cadastrar Novo Item
						</Link>
					</div>
				</header>

				{fetchError && (
					<div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						<AlertCircle size={16} className="mt-0.5 shrink-0" />
						{fetchError}
					</div>
				)}

				{actionError && (
					<div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						<AlertCircle size={16} className="mt-0.5 shrink-0" />
						{actionError}
					</div>
				)}

				<section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_50px_-40px_rgba(0,0,0,0.35)]">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[760px] text-left">
							<thead className="bg-zinc-50">
								<tr className="border-b border-zinc-200">
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Título</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Tipo</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Preço</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Estoque</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Online</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Status</th>
									<th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-garimpo-dark/60">Ações</th>
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td colSpan={7} className="px-5 py-10">
											<div className="flex items-center justify-center gap-3 text-sm text-garimpo-dark/70">
												<Loader2 className="animate-spin text-garimpo-rust" size={18} />
												Carregando produtos...
											</div>
										</td>
									</tr>
								) : products.length === 0 ? (
									<tr>
										<td colSpan={7} className="px-5 py-10 text-center text-sm text-garimpo-dark/60">
											Nenhum produto cadastrado ainda.
										</td>
									</tr>
								) : (
									products.map((product) => (
										<tr key={product.id} className="border-b border-zinc-100 last:border-b-0">
											<td className="px-5 py-4 font-medium text-garimpo-dark">{product.title || "Sem título"}</td>
											<td className="px-5 py-4 text-garimpo-dark/70">{product.type === "music" ? "Música" : product.type === "fashion" ? "Moda" : "-"}</td>
											<td className="px-5 py-4 text-garimpo-dark/70">
												{typeof product.price === "number" ? `R$ ${product.price.toFixed(2).replace(".", ",")}` : "-"}
											</td>
											<td className="px-5 py-4 text-garimpo-dark/70">{typeof product.stock === "number" ? product.stock : "-"}</td>
											<td className="px-5 py-4">
												<span
													className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
														product.availableOnline
															? "bg-emerald-100 text-emerald-700"
															: "bg-zinc-200 text-zinc-600"
													}`}
												>
													{product.availableOnline ? "Ativo" : "Inativo"}
												</span>
											</td>
											<td className="px-5 py-4 text-garimpo-dark/70">{product.status || "-"}</td>
											<td className="px-5 py-4">
												<div className="flex items-center gap-2">
													<Link
														href={`/admin/produtos/${product.id}/editar`}
														className="inline-flex items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-garimpo-dark transition-colors hover:bg-zinc-100"
													>
														<Pencil size={14} />
														Editar
													</Link>
													<button
														type="button"
														onClick={() => void handleDelete(product.id)}
														disabled={deletingId === product.id}
														className="inline-flex items-center justify-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
													>
														{deletingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
														{deletingId === product.id ? "Excluindo..." : "Excluir"}
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</main>
	);
}
