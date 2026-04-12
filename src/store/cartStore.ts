import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showToast } from "@/store/toastStore";

export type CartItem = {
	id: string;
	title: string;
	artist: string;
	price: number;
	format: string;
	image?: string;
	quantity: number;
	stock?: number;
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
				const productStock = item.stock ?? Number.MAX_SAFE_INTEGER;

				set((state) => {
					const existingItem = state.items.find((cartItem) => cartItem.id === item.id);
					const existingStock = existingItem?.stock ?? productStock;
					const currentItems = state.items;

					if (existingItem) {
						if (existingItem.quantity >= existingStock || existingItem.quantity + quantityToAdd > existingStock) {
							showToast({
								title: item.title,
								message: "Limite de estoque atingido",
								image: item.image,
								quantity: existingItem.quantity,
								totalItems: currentItems.reduce((total, cartItem) => total + cartItem.quantity, 0),
								total: currentItems.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0),
								variant: "warning",
							});

							return state;
						}

						return {
							items: state.items.map((cartItem) =>
								cartItem.id === item.id
									? { ...cartItem, quantity: cartItem.quantity + quantityToAdd, stock: cartItem.stock ?? item.stock }
									: cartItem,
							),
						};
					}

					if (quantityToAdd > productStock) {
						showToast({
							title: item.title,
							message: "Limite de estoque atingido",
							image: item.image,
							quantity: quantityToAdd,
								totalItems: currentItems.reduce((total, cartItem) => total + cartItem.quantity, 0),
								total: currentItems.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0),
							variant: "warning",
						});

						return state;
					}

					const newItem: CartItem = {
						...item,
						quantity: quantityToAdd,
						stock: item.stock,
					};

					const nextState = {
						items: [...state.items, newItem],
					};

					showToast({
						title: item.title,
						message: "Ja adicionamos o produto ao carrinho!",
						image: item.image,
						quantity: quantityToAdd,
						totalItems: nextState.items.reduce((total, cartItem) => total + cartItem.quantity, 0),
						total: nextState.items.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0),
						variant: "success",
					});

					return nextState;
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
						item.id === id
							? {
								...item,
								quantity: item.stock ? Math.min(quantity, item.stock) : quantity,
							}
							: item,
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
