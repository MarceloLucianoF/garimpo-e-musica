"use client";

import { useState } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";

type IbgeState = {
  sigla: string;
  nome: string;
};

type IbgeCity = {
  nome: string;
};

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

function formatCpfMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCepMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function DeliveryStep() {
  const customer = useCheckoutStore((state) => state.customer);
  const address = useCheckoutStore((state) => state.address);
  const updateCustomer = useCheckoutStore((state) => state.updateCustomer);
  const updateAddress = useCheckoutStore((state) => state.updateAddress);
  const setStep = useCheckoutStore((state) => state.setStep);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [invalidField, setInvalidField] = useState<string | null>(null);

  const loadStates = async () => {
    if (states.length > 0) {
      return;
    }

    try {
      const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as IbgeState[];
      setStates(data.sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch {
      // Silently fail: fields remain usable.
    }
  };

  const loadCitiesByState = async (uf: string) => {
    if (!uf) {
      setCities([]);
      return;
    }

    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      if (!response.ok) {
        setCities([]);
        return;
      }

      const data = (await response.json()) as IbgeCity[];
      setCities(data.map((item) => item.nome).sort((a, b) => a.localeCompare(b)));
    } catch {
      setCities([]);
    }
  };

  const handleCepBlur = async () => {
    const cleanedCep = address.cep.replace(/\D/g, "");

    if (cleanedCep.length !== 8) {
      setAddressError("CEP invalido. Informe 8 digitos.");
      return;
    }

    setAddressError(null);
    setIsAddressLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (!response.ok || data.erro) {
        setManualAddressMode(true);
        setAddressError("Nao foi possivel localizar o CEP. Complete o endereco manualmente.");
        await loadStates();
        return;
      }

      setManualAddressMode(false);
      updateAddress({
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      });
    } catch {
      setManualAddressMode(true);
      setAddressError("Falha ao consultar CEP. Complete o endereco manualmente.");
      await loadStates();
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleStateChange = async (uf: string) => {
    updateAddress({ state: uf, city: "" });
    await loadCitiesByState(uf);
  };

  const handleGoToPayment = () => {
    if (!customer.name.trim()) {
      setInvalidField("name");
      setValidationError("Informe o nome completo.");
      return;
    }

    if (customer.cpf.replace(/\D/g, "").length !== 11) {
      setInvalidField("cpf");
      setValidationError("CPF invalido. Verifique os 11 digitos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      setInvalidField("email");
      setValidationError("Email invalido.");
      return;
    }

    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setInvalidField("phone");
      setValidationError("Celular invalido. Informe DDD + numero.");
      return;
    }

    if (address.cep.replace(/\D/g, "").length !== 8) {
      setInvalidField("cep");
      setValidationError("CEP invalido. Informe 8 digitos.");
      return;
    }

    if (!address.street.trim()) {
      setInvalidField("street");
      setValidationError("Informe a rua.");
      return;
    }

    if (!address.neighborhood.trim()) {
      setInvalidField("neighborhood");
      setValidationError("Informe o bairro.");
      return;
    }

    if (!address.city.trim()) {
      setInvalidField("city");
      setValidationError("Informe a cidade.");
      return;
    }

    if (!address.state.trim()) {
      setInvalidField("state");
      setValidationError("Informe o estado.");
      return;
    }

    if (!address.number.trim()) {
      setInvalidField("number");
      setValidationError("Informe o numero do endereco.");
      return;
    }

    setInvalidField(null);
    setValidationError(null);
    setStep(3);
  };

  return (
    <section className="w-full max-w-full space-y-6 rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7 shadow-sm">
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
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "name" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="Nome completo"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">CPF</span>
          <input
            inputMode="numeric"
            value={customer.cpf}
            onChange={(event) => updateCustomer({ cpf: formatCpfMask(event.target.value) })}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "cpf" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="000.000.000-00"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Email</span>
          <input
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "email" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
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
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "phone" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="(48) 99999-9999"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">CEP</span>
          <input
            inputMode="numeric"
            value={address.cep}
            onChange={(event) => updateAddress({ cep: formatCepMask(event.target.value) })}
            onBlur={handleCepBlur}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "cep" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="00000-000"
          />
          {isAddressLoading && <p className="text-xs text-white/60">Buscando endereco...</p>}
          {addressError && <p className="text-xs text-red-500">{addressError}</p>}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Rua</span>
          <input
            value={address.street}
            onChange={(event) => updateAddress({ street: event.target.value })}
            readOnly={!manualAddressMode}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 read-only:bg-zinc-900 read-only:text-zinc-500 read-only:border-zinc-800 read-only:cursor-not-allowed focus:read-only:ring-0 ${invalidField === "street" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="Rua, avenida ou travessa"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Bairro</span>
          <input
            value={address.neighborhood}
            onChange={(event) => updateAddress({ neighborhood: event.target.value })}
            readOnly={!manualAddressMode}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 read-only:bg-zinc-900 read-only:text-zinc-500 read-only:border-zinc-800 read-only:cursor-not-allowed focus:read-only:ring-0 ${invalidField === "neighborhood" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="Bairro"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Numero</span>
          <input
            value={address.number}
            onChange={(event) => updateAddress({ number: event.target.value })}
            className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 ${invalidField === "number" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            placeholder="123"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Cidade</span>
          {manualAddressMode ? (
            <select
              value={address.city}
              onChange={(event) => updateAddress({ city: event.target.value })}
              className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none ${invalidField === "city" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            >
              <option value="">Selecione a cidade</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={address.city}
              readOnly
              className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 read-only:bg-zinc-900 read-only:text-zinc-500 read-only:border-zinc-800 read-only:cursor-not-allowed focus:read-only:ring-0 ${invalidField === "city" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
              placeholder="Cidade"
            />
          )}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/75">Estado</span>
          {manualAddressMode ? (
            <select
              value={address.state}
              onFocus={loadStates}
              onChange={(event) => {
                void handleStateChange(event.target.value);
              }}
              className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none ${invalidField === "state" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
            >
              <option value="">Selecione o estado</option>
              {states.map((state) => (
                <option key={state.sigla} value={state.sigla}>
                  {state.sigla} - {state.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={address.state}
              readOnly
              className={`w-full rounded-2xl border bg-zinc-800 px-4 py-3 text-[#F5F1E8] outline-none placeholder:text-zinc-400 read-only:bg-zinc-900 read-only:text-zinc-500 read-only:border-zinc-800 read-only:cursor-not-allowed focus:read-only:ring-0 ${invalidField === "state" ? "border-red-500 animate-shake" : "border-zinc-700"}`}
              placeholder="UF"
            />
          )}
        </label>
      </div>

      {!manualAddressMode && (
        <button
          type="button"
          onClick={async () => {
            setManualAddressMode(true);
            setAddressError(null);
            await loadStates();
          }}
          className="text-left text-xs font-medium text-white/65 underline underline-offset-4 hover:text-white"
        >
          Nao encontrou seu endereco? Preencher manualmente
        </button>
      )}

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
