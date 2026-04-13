"use client";

import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "garimpo_cookie_consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!storedConsent) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    } finally {
      setIsVisible(false);
    }
  };

  const acceptEssential = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    } finally {
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className="fixed bottom-0 left-0 z-[100] w-full border-t border-zinc-800 bg-zinc-950 shadow-2xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#F5F1E8]">Privacidade e Cookies</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300">
            Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar sua
            experiência e curadoria de discos.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={acceptEssential}
            className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-[#F5F1E8] transition-colors hover:bg-zinc-800"
          >
            Apenas Essenciais
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-5 py-2 text-sm font-semibold text-zinc-900 transition-transform hover:scale-105"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </section>
  );
}
