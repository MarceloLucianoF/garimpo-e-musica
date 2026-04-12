"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckoutProgress } from "@/components/features/checkout/CheckoutProgress";
import { CartStep } from "@/components/features/checkout/CartStep";
import { DeliveryStep } from "@/components/features/checkout/DeliveryStep";
import { PaymentStep } from "@/components/features/checkout/PaymentStep";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const step = useCheckoutStore((state) => state.step);
  const setStep = useCheckoutStore((state) => state.setStep);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  useEffect(() => {
    if (items.length === 0) {
      resetCheckout();
    }
  }, [items.length, resetCheckout]);

  return (
    <main className="min-h-screen bg-zinc-900 text-[#F5F1E8]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Checkout</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-[#F5F1E8] md:text-5xl">
            Checkout fluido e sem friccao.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Avance do carrinho ao pagamento em etapas claras, sem ruído e com consistência entre frontend e backend.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/15 bg-zinc-950 p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-bold text-[#F5F1E8]">Seu carrinho esta vazio</h2>
            <p className="mt-3 text-sm text-white/65">Escolha um disco no acervo para continuar o checkout.</p>
            <Link
              href="/musica"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-5 py-3 font-medium text-zinc-900 transition-transform hover:scale-105"
            >
              Voltar ao acervo
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <CheckoutProgress />
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
              <div className="space-y-6">
                {step === 1 && <CartStep />}
                {step === 2 && <DeliveryStep />}
                {step === 3 && <PaymentStep />}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-6">
                <section className="rounded-[1.75rem] border border-white/15 bg-zinc-950 p-5 md:p-7 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">CRO</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-[#F5F1E8]">Compra com confiança</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Dados de logística, cliente e pagamento ficam sincronizados para reduzir fricção e evitar inconsistências.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
