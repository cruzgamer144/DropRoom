import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "DropRoom — Acesso Limitado. Autenticidade Garantida.",
  description: "DropRoom é a loja privada de sneakers premium com acesso por convite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white font-body text-slate-900 antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
