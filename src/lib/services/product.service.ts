import { collection, doc, getDoc, getDocs, limit as qLimit, orderBy, query, QueryConstraint, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeCondition } from "@/lib/constants/conditions";
import { Condition, Product } from "@/types";

type GetProductByIdOptions = {
  allowSlugLookup?: boolean;
  status?: string;
};

type ProductsContext = {
  type?: "music" | "fashion";
  status?: string;
  availableOnline?: boolean;
  limit?: number;
  orderByCreatedAtDesc?: boolean;
};

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    title: String(data.title || "Sem titulo"),
    price: Number(data.price || 0),
    stock: Number(data.stock || 0),
    condition: normalizeCondition(String(data.conditionMedia || data.condition || "VG")) as Condition,
    spotifyUrl: (data.spotifyUrl as string | null | undefined) ?? null,
    images: Array.isArray(data.images) ? (data.images as Product["images"]) : [],
    createdAt: data.createdAt,
    slug: (data.slug as string | undefined) ?? undefined,
    artist: (data.artist as string | undefined) ?? undefined,
    album: (data.album as string | undefined) ?? undefined,
    format: (data.format as string | undefined) ?? undefined,
    status: (data.status as string | undefined) ?? undefined,
    type: (data.type as string | undefined) ?? undefined,
    availableOnline: (data.availableOnline as boolean | undefined) ?? undefined,
    description: (data.description as string | undefined) ?? undefined,
    conditionMedia: (data.conditionMedia as string | undefined) ?? undefined,
    conditionSleeve: (data.conditionSleeve as string | undefined) ?? undefined,
    genre: (data.genre as string | string[] | undefined) ?? undefined,
  };
}

export async function getProductById(productId: string, options: GetProductByIdOptions = {}): Promise<Product | null> {
  const productRef = doc(db, "products", productId);
  const directSnapshot = await getDoc(productRef);

  if (directSnapshot.exists()) {
    const directData = directSnapshot.data() as Record<string, unknown>;
    if (!options.status || directData.status === options.status) {
      return toProduct(directSnapshot.id, directData);
    }
  }

  if (!options.allowSlugLookup) {
    return null;
  }

  const constraints: QueryConstraint[] = [where("slug", "==", productId), qLimit(1)];
  if (options.status) {
    constraints.push(where("status", "==", options.status));
  }

  const slugQuery = query(collection(db, "products"), ...constraints);
  const slugSnapshot = await getDocs(slugQuery);

  if (slugSnapshot.empty) {
    return null;
  }

  const slugDoc = slugSnapshot.docs[0];
  return toProduct(slugDoc.id, slugDoc.data() as Record<string, unknown>);
}

export async function getProductsByContext(context: ProductsContext = {}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [];

  if (context.type === "music") {
    constraints.push(where("type", "in", ["Música", "music"]));
  } else if (context.type === "fashion") {
    constraints.push(where("type", "==", "fashion"));
  }

  if (context.status) {
    constraints.push(where("status", "==", context.status));
  }

  if (typeof context.availableOnline === "boolean") {
    constraints.push(where("availableOnline", "==", context.availableOnline));
  }

  if (context.orderByCreatedAtDesc) {
    constraints.push(orderBy("createdAt", "desc"));
  }

  if (context.limit && context.limit > 0) {
    constraints.push(qLimit(context.limit));
  }

  const productsQuery = query(collection(db, "products"), ...constraints);
  const snapshot = await getDocs(productsQuery);

  return snapshot.docs.map((item) => toProduct(item.id, item.data() as Record<string, unknown>));
}
