import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

type CheckoutItem = {
	id: string;
	title: string;
	quantity: number;
	price: number;
};

type CheckoutPayload = {
	items?: CheckoutItem[];
	deliveryOption?: "pickup" | "shipping";
	shippingCost?: number;
	address?: {
		cep?: string;
		street?: string;
		number?: string;
		city?: string;
		state?: string;
	};
	customer?: {
		name: string;
		email: string;
		cpf: string;
		phone: string;
		password?: string;
	};
};

const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
	try {
		if (!process.env.MP_ACCESS_TOKEN) {
			return NextResponse.json({ error: "MP_ACCESS_TOKEN não configurado." }, { status: 500 });
		}

		const body = (await request.json()) as CheckoutPayload;
		const items = body.items ?? [];
		const deliveryOption = body.deliveryOption ?? "pickup";
		const shippingCost = Number(body.shippingCost ?? 0);
		const customer = body.customer;
		const address = body.address;
		const origin = request.headers.get("origin") ?? "http://localhost:3000";
		const firestore = getFirestore(db.app);

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json({ error: "Carrinho vazio para criar preferência." }, { status: 400 });
		}

		const normalizedItems = await Promise.all(
			items.map(async (item) => {
				const productSnapshot = await getDoc(doc(collection(firestore, "products"), item.id));

				if (!productSnapshot.exists) {
					throw new Error(`Produto ${item.id} nao encontrado.`);
				}

				const productData = productSnapshot.data() as { stock?: number; title?: string };
				const stock = typeof productData.stock === "number" ? productData.stock : Number.MAX_SAFE_INTEGER;

				if (item.quantity > stock) {
					throw new Error(`Estoque insuficiente para ${productData.title || item.title}.`);
				}

				return {
					id: String(item.id),
					title: item.title,
					quantity: Number(item.quantity),
					unit_price: Number(item.price),
					currency_id: "BRL",
				};
			}),
		);

		const mpItems = [...normalizedItems];

		if (deliveryOption === "shipping" && shippingCost > 0) {
			mpItems.push({
				id: "shipping",
				title: "Frete",
				quantity: 1,
				unit_price: shippingCost,
				currency_id: "BRL",
			});
		}

		const preferenceApi = new Preference(client);
		const preference = await preferenceApi.create({
			body: {
				items: mpItems,
				metadata: {
					deliveryOption,
					shippingCost: deliveryOption === "shipping" ? shippingCost : 0,
					customer,
					address,
				},
				back_urls: {
					success: `${origin}/checkout`,
					failure: `${origin}/checkout`,
					pending: `${origin}/checkout`,
				},
			},
		});

		return NextResponse.json({ id: preference.id });
	} catch (error) {
		console.error("[mercadopago/create-payment] Erro ao criar preferência", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Falha ao criar preferência de pagamento." },
			{ status: 400 },
		);
	}
}
