"use client";

import { useState } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";

function formatPhoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function DeliveryStep() {
  const customer = useCheckoutStore((state) => state.customer);
  const address = useCheckoutStore((state) => state.address);
  const updateCustomer = useCheckoutStore((state) => state.updateCustomer);
  const updateAddress = useCheckoutStore((state) => state.updateAddress);
  const setStep = useCheckoutStore((state) => state.setStep);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGoToPayment = () => {
    if (!customer.name.trim()) {
      setValidationError("Informe o nome completo.");
      return;
    }

    if (customer.cpf.replace(/\D/g, "").length !== 11) {
      setValidationError("CPF invalido. Verifique os 11 digitos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      setValidationError("Email invalido.");
      return;
    }

    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setValidationError("Celular invalido. Informe DDD + numero.");
      return;
    }

    if (address.cep.replace(/\D/g, "").length !== 8) {
      setValidationError("CEP invalido. Informe 8 digitos.");
      return;
    }

    if (!address.number.trim()) {
      setValidationError("Informe o numero do endereco.");
      return;
    }

    setValidationError(null);
    setStep(3);
  };

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7 shadow-sm">
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">Etapa 2</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-[#F5F1E8]">Entrega e dados do cliente</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Nome</span>
          <input
            value={customer.name}
            onChange={(event) => updateCustomer({ name: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="Nome completo"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">CPF</span>
          <input
            value={customer.cpf}
            onChange={(event) => updateCustomer({ cpf: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="000.000.000-00"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Email</span>
          <input
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="voce@email.com"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Celular</span>
          <input
            type="tel"
            inputMode="tel"
            value={customer.phone}
            onChange={(event) => updateCustomer({ phone: formatPhoneMask(event.target.value) })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="(48) 99999-9999"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">CEP</span>
          <input
            value={address.cep}
            onChange={(event) => updateAddress({ cep: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="00000-000"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Rua</span>
          <input
            value={address.street}
            onChange={(event) => updateAddress({ street: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="Rua, avenida ou travessa"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Numero</span>
          <input
            value={address.number}
            onChange={(event) => updateAddress({ number: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="123"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Cidade</span>
          <input
            value={address.city}
            onChange={(event) => updateAddress({ city: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="Florianopolis"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Estado</span>
          <input
            value={address.state}
            onChange={(event) => updateAddress({ state: event.target.value })}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400"
            placeholder="SC"
          />
        </label>
      </div>

      {validationError && <p className="text-sm font-medium text-red-500">{validationError}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 font-medium text-[#F5F1E8] transition-colors hover:bg-zinc-800"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleGoToPayment}
          className="flex-1 rounded-full bg-[#F5F1E8] px-5 py-3 font-medium text-zinc-900 transition-transform hover:scale-[1.01]"
        >
          Ir para Pagamento
        </button>
      </div>
    </section>
  );
}
