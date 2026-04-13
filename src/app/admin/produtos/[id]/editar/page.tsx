"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { AlertCircle, ImagePlus, Loader2, Package, Save, Sparkles, UploadCloud } from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { CONDITIONS, CONDITION_OPTIONS, normalizeCondition, serializeCondition } from "@/lib/constants/conditions";
import { slugify } from "@/lib/utils";

const productSchema = z
  .object({
    type: z.enum(["music", "fashion"]),
    title: z.string().min(3, "Informe um titulo com pelo menos 3 caracteres."),
    price: z.number().min(0.01, "Informe um preco valido."),
    description: z.string().min(10, "Adicione uma descricao com mais contexto."),
    stock: z.number().int().min(0, "O estoque nao pode ser negativo."),
    availableOnline: z.boolean(),
    images: z.custom<FileList | undefined>((value) => value === undefined || value instanceof FileList),
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
        ctx.addIssue({ code: "custom", path: ["album"], message: "Informe o album." });
      }
      if (!data.format) {
        ctx.addIssue({ code: "custom", path: ["format"], message: "Selecione o formato." });
      }
      if (!data.conditionMedia) {
        ctx.addIssue({ code: "custom", path: ["conditionMedia"], message: "Selecione a condicao da midia." });
      }
      if (!data.conditionSleeve) {
        ctx.addIssue({ code: "custom", path: ["conditionSleeve"], message: "Selecione a condicao da capa." });
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

type ExistingImage = {
  url: string;
  path?: string;
  order?: number;
};

const musicFormats = [
  { label: "LP", value: "vinyl_lp" },
  { label: "CD", value: "cd" },
];

const fashionCategories = ["Jaquetas", "Camisetas", "Calcas", "Vestidos", "Acessorios", "Outros"];
const fashionSizes = ["PP", "P", "M", "G", "GG", "Unico"];

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingUpload, setIsCompressingUpload] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
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
    },
  });

  const watchedType = watch("type");
  const watchedImages = watch("images");

  const imageCountLabel = useMemo(() => {
    const count = watchedImages?.length ?? 0;
    return count === 0 ? "Nenhuma nova imagem selecionada" : `${count} nova(s) imagem(ns)`;
  }, [watchedImages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      setIsCheckingAuth(false);

      if (!productId) {
        setSubmitError("ID de produto invalido.");
        setIsLoadingProduct(false);
        return;
      }

      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          setSubmitError("Produto nao encontrado.");
          setIsLoadingProduct(false);
          return;
        }

        const data = productSnap.data() as Record<string, unknown>;

        reset({
          type: (data.type as "music" | "fashion") || "music",
          title: (data.title as string) || "",
          price: Number(data.price || 0),
          description: (data.description as string) || "",
          stock: Number(data.stock || 0),
          availableOnline: Boolean(data.availableOnline),
          artist: (data.artist as string) || "",
          album: (data.album as string) || "",
          format: (data.format as "vinyl_lp" | "cd") || "vinyl_lp",
          conditionMedia: serializeCondition(normalizeCondition(data.conditionMedia as string | undefined)) as
            | "M"
            | "NM"
            | "VG+"
            | "VG"
            | "G",
          conditionSleeve: serializeCondition(normalizeCondition(data.conditionSleeve as string | undefined)) as
            | "M"
            | "NM"
            | "VG+"
            | "VG"
            | "G",
          spotifyUrl: (data.spotifyUrl as string) || "",
          category: (data.category as string) || "Jaquetas",
          size: (data.size as string) || "M",
          images: undefined,
        });

        setExistingImages((data.images as ExistingImage[]) || []);
      } catch {
        setSubmitError("Nao foi possivel carregar o produto para edicao.");
      } finally {
        setIsLoadingProduct(false);
      }
    });

    return unsubscribe;
  }, [productId, reset, router]);

  useEffect(() => {
    if (watchedType === "music") {
      setValue("category", "");
      setValue("size", "");
      return;
    }

    setValue("artist", "");
    setValue("album", "");
    setValue("format", undefined);
    setValue("conditionMedia", undefined);
    setValue("conditionSleeve", undefined);
    setValue("spotifyUrl", "");
  }, [setValue, watchedType]);

  const onSubmit = async (values: ProductFormValues) => {
    if (!productId) {
      return;
    }

    setSubmitError("");
    setIsSaving(true);

    try {
      let uploadedImages = existingImages;

      if (values.images && values.images.length > 0) {
        const productSlug = slugify(values.title);
        const files = Array.from(values.images);
        setIsCompressingUpload(true);

        uploadedImages = await Promise.all(
          files.map(async (file, index) => {
            const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);

            console.log("[image-compression][editar-produto]", {
              fileName: file.name,
              originalSizeKB: Number((file.size / 1024).toFixed(2)),
              compressedSizeKB: Number((compressedFile.size / 1024).toFixed(2)),
            });

            const extension = file.name.split(".").pop() || "jpg";
            const fileName = `${productSlug}-${index + 1}.${extension}`;
            const filePath = `products/${values.type}/${productSlug}/${fileName}`;
            const fileRef = ref(storage, filePath);
            const snapshot = await uploadBytes(fileRef, compressedFile);
            const url = await getDownloadURL(snapshot.ref);

            return {
              url,
              path: filePath,
              order: index + 1,
            };
          }),
        );

        setIsCompressingUpload(false);
      }

      await updateDoc(doc(db, "products", productId), {
        type: values.type,
        title: values.title.trim(),
        slug: slugify(values.title),
        price: values.price,
        description: values.description.trim(),
        stock: values.stock,
        availableOnline: values.availableOnline,
        images: uploadedImages,
        updatedAt: serverTimestamp(),
        ...(values.type === "music"
          ? {
              artist: values.artist?.trim(),
              album: values.album?.trim(),
              format: values.format,
              conditionMedia: values.conditionMedia,
              conditionSleeve: values.conditionSleeve,
              spotifyUrl: values.spotifyUrl?.trim() || null,
            }
          : {
              category: values.category,
              size: values.size,
              spotifyUrl: null,
            }),
      });

      router.push("/admin/produtos");
    } catch {
      setSubmitError("Nao foi possivel atualizar o produto. Tente novamente.");
    } finally {
      setIsCompressingUpload(false);
      setIsSaving(false);
    }
  };

  if (isCheckingAuth || isLoadingProduct) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-garimpo-dark/70 shadow-sm">
          <Loader2 className="animate-spin text-garimpo-rust" size={18} />
          Carregando editor de produto...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-garimpo-dark md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-garimpo-rust">Admin / Produtos</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-garimpo-dark md:text-5xl">Editar produto</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-garimpo-dark/70 md:text-lg">
            Formulario reutilizando a mesma estrutura de cadastro para manter consistencia de dados.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-garimpo-rust/10 p-2 text-garimpo-rust">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Informacoes basicas</h2>
                <p className="text-sm text-garimpo-dark/60">Titulo, preco, estoque e visibilidade.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Tipo</span>
                <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("type")}>
                  <option value="music">Musica</option>
                  <option value="fashion">Moda</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Titulo</span>
                <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("title")} />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Preco</span>
                <input type="number" step="0.01" min="0" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("price", { valueAsNumber: true })} />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Estoque</span>
                <input type="number" min="0" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("stock", { valueAsNumber: true })} />
              </label>

              <label className="md:col-span-2 space-y-2">
                <span className="text-sm font-medium text-garimpo-dark/80">Descricao</span>
                <textarea rows={5} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("description")} />
              </label>

              <label className="md:col-span-2 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                <div>
                  <span className="block text-sm font-medium text-garimpo-dark/80">Disponivel online</span>
                </div>
                <input type="checkbox" {...register("availableOnline")} />
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
                  <h2 className="font-display text-2xl font-bold">Detalhes de musica</h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Artista</span>
                  <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("artist")} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Album</span>
                  <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("album")} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Formato</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("format")}>
                    {musicFormats.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Condicao da midia</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("conditionMedia")}>
                    {CONDITION_OPTIONS.map((item) => (
                      <option key={item} value={serializeCondition(item)}>{CONDITIONS[item].label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Condicao da capa</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("conditionSleeve")}>
                    {CONDITION_OPTIONS.map((item) => (
                      <option key={item} value={serializeCondition(item)}>{CONDITIONS[item].label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">URL do Spotify</span>
                  <input className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" placeholder="https://open.spotify.com/..." {...register("spotifyUrl")} />
                </label>
              </div>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.4)] md:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Categoria</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("category")}>
                    {fashionCategories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-garimpo-dark/80">Tamanho</span>
                  <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" {...register("size")}>
                    {fashionSizes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
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
                <p className="text-sm text-garimpo-dark/60">Envie novas imagens para substituir as atuais.</p>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col gap-4 rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-3 text-garimpo-rust shadow-sm">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <p className="font-medium text-garimpo-dark">Selecionar novas imagens</p>
                </div>
              </div>
              <input type="file" accept="image/*" multiple className="sr-only" {...register("images")} />
              <span className="text-sm text-garimpo-dark/60">{imageCountLabel}</span>
            </label>

            {isCompressingUpload && (
              <p className="mt-3 text-sm font-medium text-garimpo-rust">Comprimindo e enviando imagem...</p>
            )}

            {existingImages.length > 0 && (
              <p className="mt-3 text-sm text-garimpo-dark/60">{existingImages.length} imagem(ns) atual(is) salvas.</p>
            )}
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
              {isSaving ? "Salvando..." : "Atualizar produto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
