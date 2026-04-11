"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      router.replace(user ? "/admin/dashboard" : "/admin/login");
    });

    return unsubscribe;
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-garimpo-dark/70 shadow-sm">
        <Loader2 className="animate-spin text-garimpo-rust" size={18} />
        Redirecionando...
      </div>
    </main>
  );
}