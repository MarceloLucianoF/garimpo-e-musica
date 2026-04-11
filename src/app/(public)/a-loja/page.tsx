import Image from "next/image";

const STORY_SECTIONS = [
	{
		title: "Curadoria que nasceu do olhar",
		text: "Benhur e Rosana construíram o Garimpo & Música com uma ideia clara: cada peça precisa carregar presença, contexto e desejo. O acervo não é aleatório; ele é selecionado para contar histórias e abrir caminhos de descoberta.",
		image: "/hero-loja.jpg",
		eyebrow: "História",
	},
	{
		title: "A Lagoa como endereço afetivo",
		text: "A loja física na Lagoa da Conceição é parte da experiência. O bairro, o movimento local e a atmosfera da região entram na composição da marca e ajudam a transformar a visita em memória.",
		image: "/look-card.jpg",
		eyebrow: "Território",
	},
	{
		title: "Moda, música e conversa",
		text: "Entre roupas, discos e encontros, o Garimpo & Música funciona como um espaço de repertório. A curadoria aproxima estilos, épocas e pessoas, sempre com um tom humano e direto.",
		image: "/vinil-card.jpg",
		eyebrow: "Experiência",
	},
];

export default function ALojaPage() {
	const whatsappHref =
		"https://wa.me/5548999999999?text=Ol%C3%A1!%20Quero%20conhecer%20o%20Garimpo%20%26%20M%C3%BAsica%20na%20Lagoa%20da%20Concei%C3%A7%C3%A3o.";

	return (
		<main className="bg-garimpo-bg text-garimpo-dark">
			<section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
				<div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
					<div className="max-w-3xl">
						<p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">A Loja</p>
						<h1 className="font-display text-4xl font-bold leading-tight text-garimpo-dark md:text-6xl">
							Benhur, Rosana e uma curadoria feita para a Lagoa.
						</h1>
					</div>

					<div className="rounded-[2rem] border border-garimpo-dark/10 bg-white/75 p-6 backdrop-blur-sm md:p-8">
						<p className="font-sans text-base leading-relaxed text-garimpo-dark/75">
							O Garimpo & Música nasceu para unir presença local, memória e descoberta. A loja física sustenta a personalidade do projeto e traduz, no espaço, o que a marca quer comunicar em cada vitrine.
						</p>
						<div className="mt-6 grid gap-3 text-sm text-garimpo-dark/75 sm:grid-cols-2">
							<div className="rounded-2xl bg-garimpo-bg p-4">
								<p className="font-semibold text-garimpo-rust">Localização</p>
								<p>Lagoa da Conceição, Florianópolis - SC</p>
							</div>
							<div className="rounded-2xl bg-garimpo-bg p-4">
								<p className="font-semibold text-garimpo-rust">Atendimento</p>
								<p>Visita presencial e contato por WhatsApp</p>
							</div>
						</div>
						<a
							href={whatsappHref}
							target="_blank"
							rel="noreferrer"
							className="mt-6 inline-flex items-center justify-center rounded-full bg-garimpo-rust px-5 py-3 font-sans font-medium text-white transition-colors hover:bg-garimpo-rust-hover"
						>
							Falar com a loja
						</a>
					</div>
				</div>

				<div className="mt-10 grid gap-6">
					{STORY_SECTIONS.map((section, index) => {
						const reverse = index % 2 === 1;

						return (
							<article
								key={section.title}
								className="grid gap-6 rounded-[2rem] border border-garimpo-dark/10 bg-white p-4 md:p-6 lg:grid-cols-2 lg:items-center"
							>
								<div className={reverse ? "lg:order-2" : ""}>
									<div className="relative h-72 w-full overflow-hidden rounded-[1.5rem] md:h-96">
										<Image
											src={section.image}
											alt={section.title}
											fill
											className="object-cover"
											sizes="(max-width: 1024px) 100vw, 50vw"
										/>
									</div>
								</div>
								<div className={reverse ? "space-y-4 px-1 md:px-4 lg:order-1 lg:px-6" : "space-y-4 px-1 md:px-4 lg:px-6"}>
									<p className="text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">{section.eyebrow}</p>
									<h2 className="font-display text-3xl font-bold leading-tight text-garimpo-dark">{section.title}</h2>
									<p className="font-sans text-base leading-relaxed text-garimpo-dark/75">{section.text}</p>
								</div>
							</article>
						);
					})}
				</div>
			</section>
		</main>
	);
}
