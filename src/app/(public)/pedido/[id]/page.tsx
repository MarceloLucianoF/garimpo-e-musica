import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "@/lib/services/order.service";
import type { OrderDetails } from "@/lib/services/order.service";

type PedidoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;
}

function statusLabel(status: OrderDetails["status"]) {
  if (status === "paid") {
    return "Pagamento Aprovado";
  }

  if (status === "shipped") {
    return "Enviado";
  }

  if (status === "ready_for_pickup") {
    return "Pronto para Retirada";
  }

  return "Concluido";
}

function DeliverySummary({ order }: { order: OrderDetails }) {
  if (order.delivery.option === "pickup") {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Entrega</p>
        <p className="mt-2 text-sm text-[#F5F1E8]">Retirada na loja selecionada no checkout.</p>
      </div>
    );
  }

  const address = order.delivery.address;

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Endereço de Entrega</p>
      <p className="mt-2 text-sm text-[#F5F1E8]">
        {address?.street || "Rua não informada"}, {address?.number || "S/N"}
      </p>
      <p className="mt-1 text-sm text-white/70">
        {address?.city || "Cidade não informada"} - {address?.state || "UF"}
      </p>
      <p className="mt-1 text-sm text-white/70">CEP: {address?.cep || "Não informado"}</p>
    </div>
  );
}

export default async function PedidoDetalhePage({ params }: PedidoPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <main className="min-h-screen bg-zinc-900 px-4 py-12 text-[#F5F1E8]">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-700 bg-zinc-800/40 p-8 text-center shadow-2xl">
          <h1 className="font-display text-3xl font-bold">Pedido não encontrado</h1>
          <p className="mt-3 text-sm text-white/70">
            Não conseguimos localizar esse pedido. Confira o link ou retorne para a loja.
          </p>
          <Link
            href="/musica"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-6 py-3 text-sm font-semibold text-zinc-900 transition-transform hover:scale-[1.02]"
          >
            Voltar para a loja
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 px-4 py-12 text-[#F5F1E8]">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-700 bg-zinc-800/40 p-6 shadow-2xl md:p-8">
        <header className="rounded-2xl border border-zinc-700 bg-zinc-800/60 p-5">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/50 text-[#F5F1E8]">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Pedido Confirmado!</h1>
              <p className="mt-1 text-sm text-white/70">Sua agulha já está se preparando para tocar.</p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Status do Pedido</p>
            <span className="inline-flex items-center rounded-full border border-emerald-800 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-200">
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/50">Pedido #{order.id}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Itens Comprados</p>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">Sem capa</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#F5F1E8]">{item.title}</p>
                  <p className="mt-1 text-xs text-white/60">Qtd. {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[#F5F1E8]">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-800/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Resumo Financeiro</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/75">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-white/75">
                <span>Frete</span>
                <span>{formatCurrency(order.totals.shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-bold text-[#F5F1E8]">
                <span>Total pago</span>
                <span>{formatCurrency(order.totals.total)}</span>
              </div>
            </div>
          </div>

          <DeliverySummary order={order} />
        </section>

        <footer className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800/60 p-5">
          <p className="text-sm leading-relaxed text-white/80">
            Este disco foi higienizado e embalado com cuidado pela curadoria do Garimpo & Música. Acompanhe as
            atualizações pelo seu e-mail.
          </p>
          <Link
            href="/musica"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-6 py-3 text-sm font-semibold text-zinc-900 transition-transform hover:scale-[1.02]"
          >
            Continuar Explorando
          </Link>
        </footer>
      </div>
    </main>
  );
}
