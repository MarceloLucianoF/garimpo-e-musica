"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMusicRoute = pathname.startsWith("/musica");
  const isCheckoutRoute = pathname === "/checkout";
  const isDarkCommerceRoute = isMusicRoute || isCheckoutRoute;
  const shouldHideDefaultHeader = isMusicRoute || isCheckoutRoute;

  return (
    <div className={`flex min-h-screen flex-col ${isDarkCommerceRoute ? "bg-zinc-900 text-[#F5F1E8]" : "bg-garimpo-bg text-garimpo-dark"}`}>
      {!shouldHideDefaultHeader && <Header />}
      <main className="flex-grow">{children}</main>
      <ToastViewport />
    </div>
  );
}
