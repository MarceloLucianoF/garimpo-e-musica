"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Package,
  Save,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { CONDITIONS, CONDITION_OPTIONS, serializeCondition } from "@/lib/constants/conditions";
import { slugify } from "@/lib/utils";

const productSchema = z
  .object({
    type: z.enum(["music", "fashion"]),
    title: z.string().min(3, "Informe um título com pelo menos 3 caracteres."),
    price: z.number().min(0.01, "Informe um preço válido."),
    description: z.string().min(10, "Adicione uma descrição com mais contexto."),
    stock: z.number().int().min(0, "O estoque não pode ser negativo."),
    availableOnline: z.boolean(),
    images: z.custom<FileList>(
      (value) => value instanceof FileList && value.length > 0,
      "Adicione ao menos uma imagem.",
    ),
    artist: z.string().optional(),
    album: z.string().optional(),
    format: z.enum(["vinyl_lp", "cd"]).optional(),
    conditionMedia: z.enum(["M", "NM", "VG+", "VG", "G"]).optional(),
    conditionSleeve: z.enum(["M", "NM", "VG+", "VG", "G"]).optional(),
    spotifyUrl: z.string().optional(),
    category: z.string().optional(),
    size: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "music") {
      if (!data.artist?.trim()) {
        ctx.addIssue({ code: "custom", path: ["artist"], message: "Informe o artista." });
      }
      if (!data.album?.trim()) {
        ctx.addIssue({ code: "custom", path: ["album"], message: "Informe o álbum." });
      }
      if (!data.format) {
        ctx.addIssue({ code: "custom", path: ["format"], message: "Selecione o formato." });
      }
      if (!data.conditionMedia) {
        ctx.addIssue({ code: "custom", path: ["conditionMedia"], message: "Selecione a condição da mídia." });
      }
      if (!data.conditionSleeve) {
        ctx.addIssue({ code: "custom", path: ["conditionSleeve"], message: "Selecione a condição da capa." });
      }
      return;
    }

    if (!data.category?.trim()) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Selecione a categoria." });
    }
    if (!data.size?.trim()) {
      ctx.addIssue({ code: "custom", path: ["size"], message: "Selecione o tamanho." });
    }
  });

type ProductFormValues = z.infer<typeof productSchema>;

const musicFormats = [
  { label: "LP", value: "vinyl_lp" },
  { label: "CD", value: "cd" },
];

const fashionCategories = ["Jaquetas", "Camisetas", "Calças", "Vestidos", "Acessórios", "Outros"];
const fashionSizes = ["PP", "P", "M", "G", "GG", "Único"];

const defaultValues: Omit<ProductFormValues, "images"> = {
  type: "music",
  title: "",
  price: 0,
  description: "",
  stock: 1,
  availableOnline: true,
  artist: "",
  album: "",
  format: "vinyl_lp",
  conditionMedia: "NM",
  conditionSleeve: "NM",
  spotifyUrl: "",
  category: "Jaquetas",
  size: "M",
};

export default function NovoProdutoPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const watchedType = watch("type");
  const watchedImages = watch("images");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (watchedType === "music") {
      setValue("category", "");
      setValue("size", "");
      setValue("format", "vinyl_lp");
      setValue("conditionMedia", "NM");
      setValue("conditionSleeve", "NM");
      return;
    }

    setValue("artist", "");
    setValue("album", "");
    setValue("format", undefined);
    setValue("conditionMedia", undefined);
    setValue("conditionSleeve", undefined);
    setValue("spotifyUrl", "");
  }, [setValue, watchedType]);

  const imageCountLabel = useMemo(() => {
    const count = watchedImages?.length ?? 0;
    return count === 0 ? "Nenhuma imagem selecionada" : `${count} imagem(ns) selecionada(s)`;
  }, [watchedImages]);

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitError("");
    setIsSaving(true);

    try {
      const productSlug = slugify(values.title);
      const files = Array.from(values.images);

      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const extension = file.name.split(".").pop() || "jpg";
          const fileName = `${productSlug}-${index + 1}.${extension}`;
          const filePath = `products/${values.type}/${productSlug}/${fileName}`;
          const fileRef = ref(storage, filePath);
          const snapshot = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snapshot.ref);

          return {
            url,
            path: filePath,
            order: index + 1,
          };
        }),
      );

      await addDoc(collection(db, "products"), {
        type: values.type,
        status: "available",
        availableOnline: values.availableOnline,
        title: values.title.trim(),
        slug: productSlug,
        price: values.price,
        description: values.description.trim(),
        stock: values.stock,
        images: uploadedImages,
        pickupAvailable: values.type === "music",
        shippingAvailable: values.type === "music",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(values.type === "music"
          ? {
              artist: values.artist?.trim(),
              album: values.album?.trim(),
              format: values.format,
              conditionMedia: values.conditionMedia,
              conditionSleeve: values.conditionSleeve,
              spotifyUrl: values.spotifyUrl?.trim() || null,
              genre: [],
            }
          : {
              category: values.category,
              size: values.size,
              spotifyUrl: null,
            }),
      });

      router.push("/admin/produtos");
    } catch {
      setSubmitError("Não foi possível salvar o produto. Verifique os campos e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-garimpo-dark/70 shadow-sm">
          <Loader2 className="animate-spin text-garimpo-rust" size={18} />
          Verificando acesso...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-garimpo-dark md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Admin / Produtos</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-garimpo-dark md:text-5xl">
            Novo produto
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-garimpo-dark/70 md:text-lg">
            Cadastre música ou moda com uma estrutura simples, curada e pronta para upload de imagens no Firebase Storage.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Informações básicas</h2>
                <p className="text-sm text-garimpo-dark/60">Título, preço, estoque e visibilidade.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Tipo</span>
                <select
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                  {...register("type")}
                >
                  <option value="music">Música</option>
                  <option value="fashion">Moda</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Título</span>
                <input
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                  placeholder="Ex: Led Zeppelin IV"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Preço</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                  placeholder="0,00"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Estoque</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                  placeholder="1"
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
              </label>

              <label className="md:col-span-2 space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Descrição</span>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                  placeholder="Descreva o item com contexto e honestidade."
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
              </label>

              <label className="md:col-span-2 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                <div>
                  <span className="block text-sm font-medium text-garimpo-dark/80">Disponível online</span>
                  <span className="text-sm text-garimpo-dark/55">Ative quando quiser exibir o produto na loja virtual.</span>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="peer sr-only" {...register("availableOnline")} />
                  <div className="h-7 w-12 rounded-full bg-zinc-300 transition-colors peer-checked:bg-garimpo-rust" />
                  <div className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </section>

          {watchedType === "music" ? (
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
                  <Package size={18} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Detalhes de música</h2>
                  <p className="text-sm text-garimpo-dark/60">Campos específicos para discos e CDs.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Artista</span>
                  <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("artist")} placeholder="Ex: Pink Floyd" />
                  {errors.artist && <p className="text-sm text-red-600">{errors.artist.message}</p>}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Álbum</span>
                  <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("album")} placeholder="Ex: The Dark Side of the Moon" />
                  {errors.album && <p className="text-sm text-red-600">{errors.album.message}</p>}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Formato</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("format")}>
                    {musicFormats.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.format && <p className="text-sm text-red-600">{errors.format.message}</p>}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Condição da mídia</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("conditionMedia")}>
                    {CONDITION_OPTIONS.map((item) => (
                      <option key={item} value={serializeCondition(item)}>
                        {CONDITIONS[item].label}
                      </option>
                    ))}
                  </select>
                  {errors.conditionMedia && <p className="text-sm text-red-600">{errors.conditionMedia.message}</p>}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Condição da capa</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("conditionSleeve")}>
                    {CONDITION_OPTIONS.map((item) => (
                      <option key={item} value={serializeCondition(item)}>
                        {CONDITIONS[item].label}
                      </option>
                    ))}
                  </select>
                  {errors.conditionSleeve && <p className="text-sm text-red-600">{errors.conditionSleeve.message}</p>}
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">URL do Spotify</span>
                  <input
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust"
                    placeholder="https://open.spotify.com/..."
                    {...register("spotifyUrl")}
                  />
                </label>
              </div>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
                  <Package size={18} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Detalhes de moda</h2>
                  <p className="text-sm text-garimpo-dark/60">Campos específicos para peças de brechó.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Categoria</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("category")}>
                    {fashionCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Tamanho</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-colors focus:border-garimpo-rust" {...register("size")}>
                    {fashionSizes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.size && <p className="text-sm text-red-600">{errors.size.message}</p>}
                </label>
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
                <ImagePlus size={18} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Imagens</h2>
                <p className="text-sm text-garimpo-dark/60">Faça upload direto para o Firebase Storage.</p>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col gap-4 rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-6 transition-colors hover:border-garimpo-rust hover:bg-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-3 text-garimpo-rust shadow-sm">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <p className="font-medium text-garimpo-dark">Selecionar imagens</p>
                  <p className="text-sm text-garimpo-dark/60">Você pode enviar mais de uma foto do item.</p>
                </div>
              </div>
              <input type="file" accept="image/*" multiple className="sr-only" {...register("images")} />
              <span className="text-sm text-garimpo-dark/60">{imageCountLabel}</span>
            </label>
            {errors.images && <p className="mt-3 text-sm text-red-600">{errors.images.message as string}</p>}
          </section>

          {submitError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/produtos")}
              className="rounded-full border border-zinc-200 bg-white px-5 py-3 font-medium text-garimpo-dark transition-colors hover:bg-zinc-100"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-garimpo-rust px-5 py-3 font-medium text-white transition-colors hover:bg-garimpo-rust-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Salvando..." : "Salvar produto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
