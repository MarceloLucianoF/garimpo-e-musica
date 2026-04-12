"use client";

import { useCheckoutStore } from "@/store/checkoutStore";

const STEPS = [
  { step: 1, label: "Carrinho" },
  { step: 2, label: "Entrega" },
  { step: 3, label: "Pagamento" },
];

export function CheckoutProgress() {
  const currentStep = useCheckoutStore((state) => state.step);

  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
      {STEPS.map((item) => {
        const active = item.step === currentStep;
        const done = item.step < currentStep;

        return (
          <div key={item.step} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                active
                  ? "bg-[#F5F1E8] text-zinc-900"
                  : done
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-white/75"
              }`}
            >
              {item.step}
            </div>
            <div className="hidden md:block">
              <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${active ? "text-[#F5F1E8]" : "text-white/50"}`}>
                Etapa
              </p>
              <p className="font-medium text-[#F5F1E8]">{item.label}</p>
            </div>
            {item.step < 3 && <div className="h-px flex-1 bg-zinc-700" />}
          </div>
        );
      })}
    </div>
  );
}
