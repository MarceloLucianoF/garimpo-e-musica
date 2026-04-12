"use client";

import { useMemo, useState } from "react";
import { Package, Truck, Home, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";

const SHIPPING_RATES = [
  { label: "PAC", cost: 34.05 },
  { label: "SEDEX", cost: 65.16 },
];

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function CartStep() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());
  const deliveryOption = useCheckoutStore((state) => state.deliveryOption);
  const shippingCost = useCheckoutStore((state) => state.shippingCost);
  const setStep = useCheckoutStore((state) => state.setStep);
  const setDeliveryOption = useCheckoutStore((state) => state.setDeliveryOption);
  const setShippingCost = useCheckoutStore((state) => state.setShippingCost);
  const updateAddress = useCheckoutStore((state) => state.updateAddress);
  const [cep, setCep] = useState("");
  const [ratesVisible, setRatesVisible] = useState(false);

  const finalTotal = useMemo(() => subtotal + shippingCost, [shippingCost, subtotal]);

  const handleCalculateShipping = () => {
    if (cep.replace(/\D/g, "").length < 8) {
      return;
    }

    setDeliveryOption("shipping");
    setRatesVisible(true);
    updateAddress({ cep });
  };

  const handleIncreaseQuantity = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    }
  };

  if (items.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white/40">
          <Package size={24} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-[#F5F1E8]">Seu carrinho esta vazio</h2>
        <p className="mt-2 text-sm text-white/60">Volte ao acervo para escolher um disco antes de continuar.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="rounded-full bg-zinc-900 p-2 text-[#F5F1E8]">
          <Package size={18} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F5F1E8]">Carrinho</h2>
          <p className="text-sm text-white/60">Escolha a logistica antes de seguir.</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-800">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/20">
                  <Package size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-[#F5F1E8]">{item.title}</h3>
              <p className="text-sm text-white/60">{item.artist}</p>
              <p className="mt-2 text-sm text-white/65">{item.format}</p>
              <p className="mt-1 font-semibold text-[#F5F1E8]">{formatCurrency(item.price * item.quantity)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.id)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                aria-label="Remover item"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800">
                <button
                  onClick={() => handleDecreaseQuantity(item.id)}
                  className="inline-flex items-center justify-center h-7 w-7 text-white/70 hover:text-white transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-[#F5F1E8]">{item.quantity}</span>
                <button
                  onClick={() => handleIncreaseQuantity(item.id)}
                  className="inline-flex items-center justify-center h-7 w-7 text-white/70 hover:text-white transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">CEP</span>
          <input
            value={cep}
            onChange={(event) => setCep(event.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="00000-000"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setDeliveryOption("pickup");
            setShippingCost(0);
            setRatesVisible(false);
            setStep(2);
          }}
          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
            deliveryOption === "pickup" && shippingCost === 0
              ? "border-[#F5F1E8] bg-zinc-800"
              : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-zinc-800 p-2 text-[#F5F1E8] shadow-sm">
                <Home size={16} />
              </span>
              <span className="font-medium text-[#F5F1E8]">Retirada gratis</span>
            </div>
            <span className="text-sm font-semibold text-white/70">0,00</span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleCalculateShipping}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-left transition-colors hover:border-zinc-500"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-zinc-800 p-2 text-[#F5F1E8] shadow-sm">
                <Truck size={16} />
              </span>
              <span className="font-medium text-[#F5F1E8]">Calcular frete</span>
            </div>
            <span className="text-sm font-semibold text-white/70">Mock</span>
          </div>
        </button>
      </div>

      {ratesVisible && (
        <div className="grid gap-3 md:grid-cols-2">
          {SHIPPING_RATES.map((rate) => (
            <button
              key={rate.label}
              type="button"
              onClick={() => {
                setDeliveryOption("shipping");
                setShippingCost(rate.cost);
                setStep(2);
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                shippingCost === rate.cost
                  ? "border-[#F5F1E8] bg-zinc-800"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#F5F1E8]">{rate.label}</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(rate.cost)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-[#F5F1E8] border border-zinc-800">
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Itens</span>
          <span>{totalItems}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/80">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        disabled={deliveryOption === null || (deliveryOption === "shipping" && shippingCost === 0)}
        className="w-full rounded-full bg-[#F5F1E8] px-5 py-4 font-medium text-zinc-900 transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar para Entrega
      </button>
    </section>
  );
}
