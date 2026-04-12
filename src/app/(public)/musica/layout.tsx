import { LadoAHeader } from "@/components/layout/LadoAHeader";

export default function MusicaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-zinc-900 text-[#F5F1E8]">
      <LadoAHeader />
      <main>{children}</main>
    </div>
  );
}
