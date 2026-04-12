import { create } from "zustand";

export type ToastVariant = "success" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  image?: string;
  quantity?: number;
  totalItems?: number;
  total?: number;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
};

const DISMISS_AFTER_MS = 3800;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = globalThis.crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    globalThis.setTimeout(() => {
      const current = get().toasts.find((item) => item.id === id);
      if (current) {
        get().removeToast(id);
      }
    }, DISMISS_AFTER_MS);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export function showToast(toast: Omit<ToastItem, "id">) {
  useToastStore.getState().pushToast(toast);
}
