import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SupaHub — Gestionnaire d'Infrastructure Supabase",
  description:
    "Maintien actif automatique et snapshots Cloudflare R2 en 1 clic pour libérer les quotas gratuits de Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className="min-h-screen bg-[#faf8fd] text-[#000000] font-figtree antialiased selection:bg-[#cfe7ed] selection:text-[#000000]">
        {children}
      </body>
    </html>
  );
}
