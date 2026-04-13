export enum Condition {
  G = "G",
  VG = "VG",
  VG_PLUS = "VG_PLUS",
  NM = "NM",
}

export type OrderStatus = "paid" | "shipped" | "ready_for_pickup" | "completed";

export type ProductImage = {
  url: string;
  path?: string;
  order?: number;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  condition: Condition;
  spotifyUrl?: string | null;
  images: ProductImage[];
  createdAt?: unknown;
  slug?: string;
  artist?: string;
  album?: string;
  format?: string;
  status?: string;
  type?: string;
  availableOnline?: boolean;
  description?: string;
  conditionMedia?: string;
  conditionSleeve?: string;
  genre?: string | string[];
};

export type OrderItem = {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  total: number;
};

export type OrderCustomer = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
};

export type OrderDelivery = {
  option: "pickup" | "shipping";
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    city?: string;
    state?: string;
  };
};

export type OrderPayment = {
  provider: "mercadopago";
  paymentId?: string;
  preferenceId?: string;
  statusDetail?: string | null;
};

export type Order = {
  id: string;
  items: OrderItem[];
  totals: OrderTotals;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  payment: OrderPayment;
  status: OrderStatus;
  createdAt: string;
};
