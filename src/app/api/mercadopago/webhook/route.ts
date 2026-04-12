import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAdminServices } from "@/lib/firebase/admin";

const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN || "",
});

type PaymentMetadata = {
	deliveryOption?: "pickup" | "shipping";
	shippingCost?: number;
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

		let userId: string | null = null;

		if (customer?.email && customer.password) {
			try {
				const existing = await admin.adminAuth.getUserByEmail(customer.email);
				userId = existing.uid;
			} catch {
				const created = await admin.adminAuth.createUser({
					email: customer.email,
					password: customer.password,
					displayName: customer.name,
					phoneNumber: customer.phone?.replace(/\D/g, "")
						? `+55${customer.phone?.replace(/\D/g, "").slice(-11)}`
						: undefined,
				});
				userId = created.uid;
			}
		}

		await admin.adminDb.collection("orders").add({
			provider: "mercadopago",
			paymentId: payment.id,
			status: payment.status,
			statusDetail: payment.status_detail || null,
			deliveryOption: metadata.deliveryOption || "pickup",
			shippingCost: Number(metadata.shippingCost || 0),
			customer: {
				name: customer?.name || payment.additional_info?.payer?.first_name || null,
				email: customer?.email || payment.payer?.email || null,
				cpf: customer?.cpf || null,
				phone: customer?.phone || null,
			},
			amount: payment.transaction_amount,
			currency: payment.currency_id || "BRL",
			orderItems: payment.additional_info?.items || [],
			userId,
			createdAt: new Date().toISOString(),
		});

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("[mercadopago/webhook] Erro ao processar webhook", error);
		return NextResponse.json({ received: true, error: true }, { status: 200 });
	}
}
