"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function PaymentStep() {
  const step = useCheckoutStore((state) => state.step);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const deliveryOption = useCheckoutStore((state) => state.deliveryOption);
  const shippingCost = useCheckoutStore((state) => state.shippingCost);
  const customer = useCheckoutStore((state) => state.customer);
  const address = useCheckoutStore((state) => state.address);
  const setStep = useCheckoutStore((state) => state.setStep);

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const finalTotal = useMemo(() => subtotal + shippingCost, [shippingCost, subtotal]);
  const canCreatePayment = Boolean(
    items.length > 0 &&
      customer.name &&
      customer.email &&
      customer.cpf &&
      customer.phone &&
      address.cep &&
      address.number,
  );
  const requestKey = useMemo(
    () =>
      JSON.stringify({
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        delivery: {
          option: deliveryOption,
          shippingCost,
          address,
        },
        customer,
      }),
    [address, customer, deliveryOption, items, shippingCost],
  );

  useEffect(() => {
    if (step !== 3 || !canCreatePayment) {
      setPreferenceId(null);
      return;
    }

    let isActive = true;

    const createPreference = async () => {
      setIsCreatingPreference(true);
      setPaymentError(null);

      try {
        const response = await fetch("/api/mercadopago/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            delivery: {
              option: deliveryOption,
              shippingCost,
              address,
            },
            customer,
          }),
        });

        const data = (await response.json()) as { id?: string; error?: string };

        if (!response.ok || !data.id) {
          throw new Error(data.error || "Nao foi possivel iniciar o pagamento.");
        }

        if (isActive) {
          setPreferenceId(data.id);
        }
      } catch (error) {
        if (isActive) {
          setPreferenceId(null);
          setPaymentError(error instanceof Error ? error.message : "Erro inesperado ao iniciar o checkout.");
        }
      } finally {
        if (isActive) {
          setIsCreatingPreference(false);
        }
      }
    };

    void createPreference();

    return () => {
      isActive = false;
    };
  }, [address, canCreatePayment, customer, deliveryOption, items, requestKey, shippingCost, step]);

  if (step !== 3) {
    return null;
  }

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7 shadow-sm">
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">Etapa 3</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-[#F5F1E8]">Pagamento</h2>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white">
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/80">
          <span>Frete</span>
          <span>{formatCurrency(shippingCost)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm text-white/70">
        <p className="font-semibold text-[#F5F1E8]">Mercado Pago</p>
        <p className="mt-1">A preferencia e criada apenas nesta etapa, quando os dados do cliente e da entrega estiverem preenchidos.</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Pagamento seguro Mercado Pago
        </p>

        {isCreatingPreference && (
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <Loader2 size={18} className="animate-spin text-zinc-600" />
            Preparando checkout...
          </div>
        )}

        {paymentError && <p className="text-sm font-medium text-red-600">{paymentError}</p>}

        {preferenceId && (
          <Wallet
            initialization={{
              preferenceId,
            }}
            customization={{
              visual: {
                style: {
                  theme: "default",
                },
              },
            }}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 font-medium text-[#F5F1E8] transition-colors hover:bg-zinc-800"
        >
          Voltar
        </button>
      </div>
    </section>
  );
}
