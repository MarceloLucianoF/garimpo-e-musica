import { Header } from "@/components/layout/Header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-garimpo-bg text-garimpo-dark">
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}