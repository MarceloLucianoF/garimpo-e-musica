import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAdminServices } from "@/lib/firebase/admin";
import { createOrder, registerStockAlert } from "@/lib/services/order.service";

const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN || "",
});

type PaymentMetadata = {
	items?: Array<{
		productId: string;
		title: string;
		quantity: number;
		unitPrice: number;
	}>;
	deliveryOption?: "pickup" | "shipping";
	shippingCost?: number;
	address?: {
		cep?: string;
		street?: string;
		number?: string;
		city?: string;
		state?: string;
	};
	totals?: {
		subtotal: number;
		shipping: number;
		total: number;
	};
	customer?: {
		name?: string;
		email?: string;
		cpf?: string;
		phone?: string;
		password?: string;
	};
};

export async function POST(request: Request) {
	try {
		if (!process.env.MP_ACCESS_TOKEN) {
			console.error("[mercadopago/webhook] MP_ACCESS_TOKEN não configurado");
			return NextResponse.json({ ok: false }, { status: 500 });
		}

		const body = (await request.json()) as {
			action?: string;
			data?: { id?: string };
			type?: string;
		};

		const paymentId =
			body.data?.id ||
			new URL(request.url).searchParams.get("data.id") ||
			new URL(request.url).searchParams.get("id");

		if (!paymentId) {
			return NextResponse.json({ received: true }, { status: 200 });
		}

		const paymentApi = new Payment(client);
		const payment = await paymentApi.get({ id: paymentId });

		if (payment.status !== "approved") {
			return NextResponse.json({ received: true, ignored: true }, { status: 200 });
		}

		const metadata = (payment.metadata || {}) as PaymentMetadata;
		const customer = metadata.customer;
		const admin = getAdminServices();

		if (!admin) {
			console.error("[mercadopago/webhook] Serviços admin indisponíveis");
			return NextResponse.json({ received: true, warning: "admin_unavailable" }, { status: 200 });
		}

		if (customer?.email && customer.password) {
			try {
				await admin.adminAuth.getUserByEmail(customer.email);
			} catch {
				await admin.adminAuth.createUser({
					email: customer.email,
					password: customer.password,
					displayName: customer.name,
					phoneNumber: customer.phone?.replace(/\D/g, "")
						? `+55${customer.phone?.replace(/\D/g, "").slice(-11)}`
						: undefined,
				});
			}
		}

		try {
			let duplicatePayment = false;
			const paymentDocId = String(payment.id || paymentId);
			const paymentRef = admin.adminDb.collection("processedPayments").doc(paymentDocId);

			await admin.adminDb.runTransaction(async (transaction) => {
				const paymentSnapshot = await transaction.get(paymentRef);
				if (paymentSnapshot.exists) {
					duplicatePayment = true;
					return;
				}

				const orderItems = Array.isArray(metadata.items) ? metadata.items : [];
				for (const orderItem of orderItems) {
					const productRef = admin.adminDb.collection("products").doc(orderItem.productId);
					const productSnapshot = await transaction.get(productRef);

					if (!productSnapshot.exists) {
						throw new Error(`Produto ${orderItem.productId} nao encontrado para transacao de estoque.`);
					}

					const productData = productSnapshot.data() as { stock?: number; title?: string };
					const stock = Number(productData.stock ?? 0);

					if (stock <= 0 || stock < orderItem.quantity) {
						throw new Error(
							`Estoque insuficiente para ${productData.title || orderItem.title}. Atual=${stock}, requerido=${orderItem.quantity}.`,
						);
					}

					transaction.update(productRef, {
						stock: stock - orderItem.quantity,
						updatedAt: new Date().toISOString(),
					});
				}

				const createdOrderId = await createOrder(
					{
						id: String(payment.id || paymentId),
						status: payment.status || undefined,
						statusDetail: payment.status_detail || null,
						externalReference: payment.external_reference || undefined,
					},
					{
						items: Array.isArray(metadata.items) ? metadata.items : [],
						totals: metadata.totals,
						deliveryOption: metadata.deliveryOption,
						customer: metadata.customer as {
							name: string;
							email: string;
							cpf: string;
							phone: string;
						},
						address: metadata.address,
					},
					{ transaction, adminDb: admin.adminDb },
				);

				transaction.set(paymentRef, {
					paymentId: String(payment.id || ""),
					orderId: createdOrderId,
					createdAt: new Date().toISOString(),
				});
			});

			if (duplicatePayment) {
				return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
			}
		} catch (transactionError) {
			await registerStockAlert(
				String(payment.id || paymentId),
				transactionError instanceof Error
					? transactionError.message
					: "Falha desconhecida ao decrementar estoque apos pagamento aprovado.",
			);
			console.error("[mercadopago/webhook] ERRO CRITICO: pagamento aprovado com falha de estoque", {
				orderId: String(payment.id || paymentId),
				paymentId: payment.id,
				transactionError,
			});
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("[mercadopago/webhook] Erro ao processar webhook", error);
		return NextResponse.json({ received: true, error: true }, { status: 200 });
	}
}
