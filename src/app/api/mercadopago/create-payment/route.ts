import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";
import { getProductById } from "@/lib/services/product.service";

const checkoutPayloadSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.string().min(1),
				quantity: z.number().int().min(1),
			}),
		)
		.min(1),
	delivery: z
		.object({
			option: z.enum(["pickup", "shipping"]).default("pickup"),
			shippingCost: z.number().min(0).default(0),
			address: z
				.object({
					cep: z.string().optional(),
					street: z.string().optional(),
					number: z.string().optional(),
					city: z.string().optional(),
					state: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
	deliveryOption: z.enum(["pickup", "shipping"]).optional(),
	shippingCost: z.number().min(0).default(0),
	address: z
		.object({
			cep: z.string().optional(),
			street: z.string().optional(),
			number: z.string().optional(),
			city: z.string().optional(),
			state: z.string().optional(),
		})
		.optional(),
	customer: z.object({
		name: z.string().min(1),
		email: z.string().email(),
		cpf: z.string().min(11),
		phone: z.string().min(10),
		password: z.string().optional(),
	}),
});

const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
	try {
		if (!process.env.MP_ACCESS_TOKEN) {
			return NextResponse.json({ error: "MP_ACCESS_TOKEN não configurado." }, { status: 500 });
		}

		const body = checkoutPayloadSchema.parse(await request.json());
		const items = body.items;
		const deliveryOption = body.delivery?.option ?? body.deliveryOption ?? "pickup";
		const shippingCost = Number(body.delivery?.shippingCost ?? body.shippingCost ?? 0);
		const customer = body.customer;
		const address = body.delivery?.address ?? body.address;
		const origin = request.headers.get("origin") ?? "http://localhost:3000";

		const validatedItems = await Promise.all(
			items.map(async (item) => {
				const product = await getProductById(item.id);
				if (!product) {
					throw new Error(`Produto ${item.id} nao encontrado.`);
				}
				const stock = Number(product.stock ?? 0);

				if (item.quantity > stock) {
					throw new Error(`Estoque insuficiente para ${product.title}.`);
				}

				return {
					id: String(item.id),
					title: product.title,
					quantity: Number(item.quantity),
					unitPrice: Number(product.price),
					currency_id: "BRL",
				};
			}),
		);

		const subtotal = validatedItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
		const shipping = deliveryOption === "shipping" ? shippingCost : 0;
		const total = subtotal + shipping;

		const mpItems = validatedItems.map((item) => ({
			id: item.id,
			title: item.title,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			currency_id: item.currency_id,
		}));

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
		const externalReference = `checkout_${Date.now()}`;
		const preference = await preferenceApi.create({
			body: {
				items: mpItems,
				external_reference: externalReference,
				metadata: {
					items: validatedItems.map((item) => ({
						productId: item.id,
						title: item.title,
						quantity: item.quantity,
						unitPrice: item.unitPrice,
					})),
					deliveryOption,
					shippingCost: shipping,
					totals: { subtotal, shipping, total },
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
