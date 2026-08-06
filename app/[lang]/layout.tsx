import AppShell from "../../components/AppShell";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased bg-[#fafaf9]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}