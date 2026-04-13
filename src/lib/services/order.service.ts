import { FieldValue, Firestore, Transaction } from "firebase-admin/firestore";
import { getAdminServices } from "@/lib/firebase/admin";
import { Order, OrderDelivery, OrderItem, OrderStatus, OrderTotals } from "@/types";

type PaymentData = {
  id: string;
  status?: string;
  statusDetail?: string | null;
  externalReference?: string;
};

type OrderMetadata = {
  items?: Array<{
    productId: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
  totals?: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  deliveryOption?: "pickup" | "shipping";
  customer?: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    city?: string;
    state?: string;
  };
};

type CreateOrderOptions = {
  transaction?: Transaction;
  adminDb?: Firestore;
};

export type OrderDetailsItem = OrderItem & {
  imageUrl?: string;
};

export type OrderDetails = Omit<Order, "id" | "items"> & {
  id: string;
  items: OrderDetailsItem[];
};

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  paid: ["shipped", "ready_for_pickup"],
  shipped: ["completed"],
  ready_for_pickup: ["completed"],
  completed: [],
};

type UpdateOrderStatusInput = {
  paymentId?: string;
  statusDetail?: string | null;
};

function buildOrderFromPayment(paymentData: PaymentData, metadata: OrderMetadata): Omit<Order, "id"> {
  const items: OrderItem[] = Array.isArray(metadata.items)
    ? metadata.items.map((item) => ({
        productId: String(item.productId),
        title: String(item.title),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))
    : [];

  const totals: OrderTotals = {
    subtotal: Number(metadata.totals?.subtotal ?? 0),
    shipping: Number(metadata.totals?.shipping ?? 0),
    total: Number(metadata.totals?.total ?? 0),
  };

  const delivery: OrderDelivery = {
    option: metadata.deliveryOption === "shipping" ? "shipping" : "pickup",
    address: metadata.address,
  };

  return {
    items,
    totals,
    customer: {
      name: String(metadata.customer?.name ?? ""),
      email: String(metadata.customer?.email ?? ""),
      cpf: String(metadata.customer?.cpf ?? ""),
      phone: String(metadata.customer?.phone ?? ""),
    },
    delivery,
    payment: {
      provider: "mercadopago",
      paymentId: paymentData.id,
      statusDetail: paymentData.statusDetail ?? null,
    },
    status: "paid",
    createdAt: new Date().toISOString(),
  };
}

export async function createOrder(
  paymentData: PaymentData,
  metadata: OrderMetadata,
  options: CreateOrderOptions = {},
): Promise<string> {
  const admin = getAdminServices();
  const adminDb = options.adminDb ?? admin?.adminDb;
  if (!adminDb) {
    throw new Error("Servicos administrativos indisponiveis para criar pedido.");
  }

  const orderData = buildOrderFromPayment(paymentData, metadata);
  const orderId = String(paymentData.id);

  const orderRef = adminDb.collection("orders").doc(orderId);
  const payload = {
    ...orderData,
    externalReference: paymentData.externalReference ?? null,
    updatedAt: new Date().toISOString(),
  };

  if (options.transaction) {
    options.transaction.set(orderRef, payload, { merge: true });
  } else {
    await orderRef.set(payload, { merge: true });
  }

  return orderId;
}

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, payment?: UpdateOrderStatusInput) {
  const admin = getAdminServices();
  if (!admin) {
    throw new Error("Servicos administrativos indisponiveis para atualizar pedido.");
  }

  const orderRef = admin.adminDb.collection("orders").doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) {
    throw new Error(`Pedido ${orderId} nao encontrado para transicao.`);
  }

  const currentStatus = snapshot.data()?.status as OrderStatus;
  if (!isValidOrderStatusTransition(currentStatus, status)) {
    throw new Error(`Transicao de status invalida: ${currentStatus} -> ${status}.`);
  }

  const updatePayload: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (payment?.paymentId) {
    updatePayload["payment.paymentId"] = payment.paymentId;
  }

  if (payment?.statusDetail !== undefined) {
    updatePayload["payment.statusDetail"] = payment.statusDetail;
  }

  await orderRef.set(updatePayload, { merge: true });
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const admin = getAdminServices();
  if (!admin) {
    throw new Error("Servicos administrativos indisponiveis para consultar pedido.");
  }

  const orderSnapshot = await admin.adminDb.collection("orders").doc(orderId).get();
  if (!orderSnapshot.exists) {
    throw new Error(`Pedido ${orderId} nao encontrado.`);
  }

  const data = orderSnapshot.data() as { items?: OrderItem[] };
  return Array.isArray(data.items) ? data.items : [];
}

export async function getOrderById(orderId: string): Promise<OrderDetails | null> {
  const admin = getAdminServices();
  if (!admin) {
    throw new Error("Servicos administrativos indisponiveis para consultar pedido.");
  }

  const orderSnapshot = await admin.adminDb.collection("orders").doc(orderId).get();
  if (!orderSnapshot.exists) {
    return null;
  }

  const data = orderSnapshot.data() as Omit<Order, "id">;
  const rawItems = Array.isArray(data.items) ? data.items : [];

  const items = await Promise.all(
    rawItems.map(async (item) => {
      try {
        const productSnapshot = await admin.adminDb.collection("products").doc(item.productId).get();
        const productData = (productSnapshot.data() || {}) as {
          images?: Array<{ url?: string }>;
        };
        const imageUrl = Array.isArray(productData.images) ? productData.images[0]?.url : undefined;

        return {
          ...item,
          imageUrl,
        };
      } catch {
        return {
          ...item,
          imageUrl: undefined,
        };
      }
    }),
  );

  return {
    ...data,
    id: orderSnapshot.id,
    items,
  };
}

export async function registerStockAlert(orderId: string, reason: string) {
  const admin = getAdminServices();
  if (!admin) {
    return;
  }

  await admin.adminDb.collection("stockAlerts").add({
    orderId,
    reason,
    createdAt: FieldValue.serverTimestamp(),
  });
}
