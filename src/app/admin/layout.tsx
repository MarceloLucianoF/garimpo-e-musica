export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-zinc-50 text-garimpo-dark">{children}</div>;
}