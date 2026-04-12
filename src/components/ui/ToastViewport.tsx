"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export function ToastViewport() {
  const router = useRouter();
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-md flex-col gap-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter pointer-events-auto overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 text-[#F5F1E8] shadow-2xl"
        >
          <div className="flex items-start gap-4 p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-800">
              {toast.image ? (
                <Image src={toast.image} alt={toast.title} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-white/30">
                  •
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{toast.message}</p>
                  <p className="mt-1 text-base font-semibold text-[#F5F1E8]">{toast.title}</p>
                  <p className="mt-2 text-sm text-white/75">
                    Qtd. {toast.quantity ?? 1} · {toast.totalItems ?? 0} itens no carrinho
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Total: R$ {(toast.total ?? 0).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 text-white/50 transition-colors hover:text-white"
                  aria-label="Fechar toast"
                >
                  <X size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeToast(toast.id);
                  router.push("/checkout");
                }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#F5F1E8] px-4 py-3 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.02]"
              >
                Ir para o Checkout
              </button>
            </div>
          </div>
          <div className={`h-1.5 ${toast.variant === "warning" ? "bg-red-500" : "bg-[#F5F1E8]"}`} />
        </div>
      ))}
      <style jsx>{`
        .toast-enter {
          animation: toastSlideDown 260ms ease-out;
        }

        @keyframes toastSlideDown {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
