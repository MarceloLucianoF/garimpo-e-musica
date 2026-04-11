import Image from "next/image";
import { MessageCircle } from "lucide-react";

const LOOKBOOK = [
	{
		title: "Jaqueta de Couro Vintage",
		description: "Peça com presença forte, estrutura marcante e linguagem atemporal.",
		image: "/look-card.jpg",
	},
	{
		title: "Camisa com Textura Retrô",
		description: "Garimpo leve, com caimento expressivo e leitura imediata de estilo.",
		image: "/hero-loja.jpg",
	},
	{
		title: "Look em Camadas",
		description: "Combinação pensada para destacar personalidade e repertório visual.",
		image: "/look-card.jpg",
	},
	{
		title: "Peça Única de Acervo",
		description: "Item selecionado pela raridade, pelo estado e pela força da imagem.",
		image: "/hero-loja.jpg",
	},
];

export default function BrechoPage() {
	const whatsappHref =
		"https://wa.me/5548999999999?text=Ol%C3%A1!%20Vi%20uma%20pe%C3%A7a%20no%20brech%C3%B3%20e%20queria%20saber%20se%20ainda%20est%C3%A1%20dispon%C3%ADvel.";

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
					{LOOKBOOK.map((item) => (
						<article
							key={item.title}
							className="group overflow-hidden rounded-[1.75rem] border border-garimpo-dark/10 bg-white shadow-[0_16px_50px_-36px_rgba(0,0,0,0.35)]"
						>
							<div className="relative aspect-[4/5] overflow-hidden">
								<Image
									src={item.image}
									alt={item.title}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-105"
									sizes="(max-width: 1280px) 50vw, 25vw"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
							</div>

							<div className="space-y-3 p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Lookbook</p>
								<h2 className="font-display text-2xl font-bold leading-tight text-garimpo-dark">{item.title}</h2>
								<p className="font-sans text-sm leading-relaxed text-garimpo-dark/70">{item.description}</p>
								<a
									href={whatsappHref}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 rounded-full bg-garimpo-rust px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
								>
									<MessageCircle size={16} />
									Tenho Interesse
								</a>
							</div>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
