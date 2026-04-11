"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { auth } from "@/lib/firebase";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/user-not-found": "Nenhuma conta administrativa foi encontrada com esse e-mail.",
  "auth/wrong-password": "Senha incorreta. Verifique e tente novamente.",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push("/admin/dashboard");
    } catch (error) {
      const code = error instanceof Error ? (error as { code?: string }).code : undefined;
      setSubmitError(code ? authErrorMessages[code] ?? "Não foi possível entrar. Verifique seus dados e tente novamente." : "Não foi possível entrar. Verifique seus dados e tente novamente.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] md:p-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Admin</p>
          <h1 className="font-display text-4xl font-bold text-garimpo-dark">Entrar no painel</h1>
          <p className="mt-3 text-sm leading-relaxed text-garimpo-dark/70">
            Acesso exclusivo para gerenciamento de produtos, pedidos e estoque.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-garimpo-dark/80">E-mail</span>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus-within:border-garimpo-rust">
              <Mail size={16} className="text-garimpo-dark/40" />
              <input
                type="email"
                autoComplete="email"
                placeholder="voce@dominio.com"
                className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-garimpo-dark/80">Senha</span>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus-within:border-garimpo-rust">
              <LockKeyhole size={16} className="text-garimpo-dark/40" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Sua senha"
                className="w-full bg-transparent outline-none placeholder:text-garimpo-dark/35"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-garimpo-dark/45 transition-colors hover:text-garimpo-dark"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </label>

          {submitError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-garimpo-rust px-5 py-4 font-sans font-medium text-white transition-colors hover:bg-garimpo-rust-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </section>
    </main>
  );
}