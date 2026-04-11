"use client";

import {
	CreditCard,
	Landmark,
	Mail,
	MapPin,
	Package,
	Phone,
	ShieldCheck,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

const deliveryMethods = [
	{
		id: "pickup",
		label: "Retirada na Loja",
		description: "Retire na Lagoa da Conceição sem custo adicional.",
		icon: MapPin,
	},
	{
		id: "shipping",
		label: "Envio por Correios",
		description: "Calcule o frete depois de informar o CEP.",
		icon: Truck,
	},
];

const paymentMethods = [
	{
		id: "pix",
		label: "Pix",
		description: "Fluxo rápido e ideal para a operação inicial.",
		icon: Landmark,
	},
	{
		id: "card",
		label: "Cartão",
		description: "Pagamento em cartão para mais flexibilidade.",
		icon: CreditCard,
	},
];

export default function CheckoutPage() {
	const items = useCartStore((state) => state.items);
	const totalItems = useCartStore((state) => state.totalItems());
	const subtotal = useCartStore((state) => state.subtotal());

	return (
		<main className="bg-garimpo-bg text-garimpo-dark">
			<section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
				<div className="mb-8 max-w-3xl">
					<p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Checkout</p>
					<h1 className="font-display text-4xl font-bold leading-tight text-garimpo-dark md:text-5xl">
						Finalizar compra com clareza e confiança.
					</h1>
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-garimpo-dark/75 md:text-lg">
						Estrutura estática do checkout em duas colunas, alinhada ao design system do projeto e pronta para integrar as próximas etapas de pagamento e frete.
					</p>
				</div>

				<div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-garimpo-dark/10 bg-white p-5 md:p-7">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
									<User size={18} />
								</div>
								<div>
									<h2 className="font-display text-2xl font-bold">Contato</h2>
									<p className="text-sm text-garimpo-dark/60">Informe os dados para acompanhar o pedido.</p>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<label className="space-y-2">
									<span className="text-sm font-medium text-garimpo-dark/80">Nome</span>
									<div className="flex items-center gap-3 rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3">
										<User size={16} className="text-garimpo-dark/40" />
										<input className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35" placeholder="Seu nome" />
									</div>
								</label>
								<label className="space-y-2">
									<span className="text-sm font-medium text-garimpo-dark/80">E-mail</span>
									<div className="flex items-center gap-3 rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3">
										<Mail size={16} className="text-garimpo-dark/40" />
										<input className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35" placeholder="voce@email.com" />
									</div>
								</label>
								<label className="space-y-2 md:col-span-2">
									<span className="text-sm font-medium text-garimpo-dark/80">WhatsApp</span>
									<div className="flex items-center gap-3 rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3">
										<Phone size={16} className="text-garimpo-dark/40" />
										<input className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35" placeholder="(48) 99999-9999" />
									</div>
								</label>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-garimpo-dark/10 bg-white p-5 md:p-7">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
									<Package size={18} />
								</div>
								<div>
									<h2 className="font-display text-2xl font-bold">Entrega</h2>
									<p className="text-sm text-garimpo-dark/60">Escolha entre retirada na loja ou envio por Correios.</p>
								</div>
							</div>

							<div className="grid gap-3 md:grid-cols-2">
								{deliveryMethods.map((method) => {
									const Icon = method.icon;

									return (
										<button
											key={method.id}
											type="button"
											className="rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg p-4 text-left transition-colors hover:border-garimpo-rust hover:bg-white"
										>
											<div className="mb-3 flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<span className="rounded-full bg-white p-2 text-garimpo-rust shadow-sm">
														<Icon size={16} />
													</span>
													<span className="font-medium">{method.label}</span>
												</div>
												<span className="h-3 w-3 rounded-full border border-garimpo-dark/30" />
											</div>
											<p className="text-sm text-garimpo-dark/70">{method.description}</p>
										</button>
									);
								})}
							</div>

							<div className="mt-4 grid gap-4 md:grid-cols-2">
								<label className="space-y-2">
									<span className="text-sm font-medium text-garimpo-dark/80">CEP</span>
									<div className="flex items-center gap-3 rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3">
										<MapPin size={16} className="text-garimpo-dark/40" />
										<input className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35" placeholder="00000-000" />
									</div>
								</label>
								<label className="space-y-2">
									<span className="text-sm font-medium text-garimpo-dark/80">Número</span>
									<input className="w-full rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3 outline-none placeholder:text-garimpo-dark/35" placeholder="123" />
								</label>
								<label className="space-y-2 md:col-span-2">
									<span className="text-sm font-medium text-garimpo-dark/80">Endereço</span>
									<input className="w-full rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg px-4 py-3 outline-none placeholder:text-garimpo-dark/35" placeholder="Rua, avenida ou travessa" />
								</label>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-garimpo-dark/10 bg-white p-5 md:p-7">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
									<ShieldCheck size={18} />
								</div>
								<div>
									<h2 className="font-display text-2xl font-bold">Pagamento</h2>
									<p className="text-sm text-garimpo-dark/60">Selecione a opção desejada para concluir o pedido.</p>
								</div>
							</div>

							<div className="grid gap-3 md:grid-cols-2">
								{paymentMethods.map((method) => {
									const Icon = method.icon;

									return (
										<button
											key={method.id}
											type="button"
											className="rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg p-4 text-left transition-colors hover:border-garimpo-rust hover:bg-white"
										>
											<div className="mb-3 flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<span className="rounded-full bg-white p-2 text-garimpo-rust shadow-sm">
														<Icon size={16} />
													</span>
													<span className="font-medium">{method.label}</span>
												</div>
												<span className="h-3 w-3 rounded-full border border-garimpo-dark/30" />
											</div>
											<p className="text-sm text-garimpo-dark/70">{method.description}</p>
										</button>
									);
								})}
							</div>
						</section>
					</div>

					<aside className="space-y-6 lg:sticky lg:top-6">
						<section className="rounded-[1.75rem] border border-garimpo-dark/10 bg-white p-5 md:p-7">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
									<Package size={18} />
								</div>
								<div>
									<h2 className="font-display text-2xl font-bold">Resumo do Pedido</h2>
									<p className="text-sm text-garimpo-dark/60">Dados vindos do Zustand.</p>
								</div>
							</div>

							<div className="space-y-4">
								{items.length === 0 ? (
									<div className="rounded-2xl border border-dashed border-garimpo-dark/15 bg-garimpo-bg p-5 text-sm text-garimpo-dark/60">
										Seu carrinho está vazio no momento.
									</div>
								) : (
									items.map((item) => (
										<div key={item.id} className="flex gap-4 rounded-2xl border border-garimpo-dark/10 bg-garimpo-bg p-3">
											<div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white">
												{item.image ? (
													<Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
												) : (
													<div className="flex h-full w-full items-center justify-center text-garimpo-dark/20">
														<Package size={24} />
													</div>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="truncate font-semibold text-garimpo-dark">{item.title}</h3>
												<p className="text-sm text-garimpo-dark/60">{item.artist}</p>
												<p className="mt-2 text-sm text-garimpo-dark/70">
													{item.format} · Qtd. {item.quantity}
												</p>
												<p className="mt-1 font-semibold text-garimpo-rust">
													R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
												</p>
											</div>
										</div>
									))
								)}
							</div>

							<div className="mt-6 space-y-3 border-t border-garimpo-dark/10 pt-5 text-sm">
								<div className="flex items-center justify-between text-garimpo-dark/70">
									<span>Itens</span>
									<span>{totalItems}</span>
								</div>
								<div className="flex items-center justify-between text-garimpo-dark/70">
									<span>Subtotal</span>
									<span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
								</div>
								<div className="flex items-center justify-between text-base font-semibold text-garimpo-dark">
									<span>Total</span>
									<span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
								</div>
							</div>

							<button
								type="button"
								className="mt-6 flex w-full items-center justify-center rounded-full bg-garimpo-rust px-5 py-4 font-sans font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
							>
								Finalizar compra
							</button>
						</section>
					</aside>
				</div>
			</section>
		</main>
	);
}
