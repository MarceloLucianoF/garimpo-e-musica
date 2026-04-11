import Link from "next/link";

export default function CarrinhoPage() {
	return (
		<main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
			<h1 className="font-display text-4xl font-bold text-garimpo-dark">Carrinho no menu lateral</h1>
			<p className="mt-4 text-garimpo-dark/70">
				Use o ícone de sacola no cabeçalho para ver seu carrinho no CartDrawer.
			</p>
			<Link
				href="/"
				className="mt-8 inline-flex items-center justify-center rounded-full bg-garimpo-rust px-5 py-3 font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
			>
				Voltar para Home
			</Link>
		</main>
	);
}
