import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
	id: string;
	title: string;
	artist: string;
	price: number;
	format: string;
	image?: string;
	quantity: number;
};

type CartStore = {
	items: CartItem[];
	addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
	totalItems: () => number;
	subtotal: () => number;
};

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (item) => {
				const quantityToAdd = Math.max(1, item.quantity ?? 1);

				set((state) => {
					const existingItem = state.items.find((cartItem) => cartItem.id === item.id);

					if (existingItem) {
						return {
							items: state.items.map((cartItem) =>
								cartItem.id === item.id
									? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
									: cartItem,
							),
						};
					}

					const newItem: CartItem = {
						...item,
						quantity: quantityToAdd,
					};

					return {
						items: [...state.items, newItem],
					};
				});
			},

			removeItem: (id) => {
				set((state) => ({
					items: state.items.filter((item) => item.id !== id),
				}));
			},

			updateQuantity: (id, quantity) => {
				if (quantity <= 0) {
					set((state) => ({
						items: state.items.filter((item) => item.id !== id),
					}));
					return;
				}

				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, quantity } : item,
					),
				}));
			},

			clearCart: () => {
				set({ items: [] });
			},

			totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

			subtotal: () =>
				get().items.reduce((total, item) => total + item.price * item.quantity, 0),
		}),
		{
			name: "garimpo-cart-storage",
			partialize: (state) => ({ items: state.items }),
		},
	),
);
