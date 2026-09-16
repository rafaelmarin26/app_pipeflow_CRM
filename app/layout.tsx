import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Syne } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/**
 * Three voices — CLAUDE.md §7.
 *
 * Syne has the opinions (headings, the product name), DM Sans carries the prose,
 * and IBM Plex Mono states the facts: money, labels, metadata, anything the user
 * reads as data rather than as a sentence.
 */
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "PipeFlow CRM",
    template: "%s · PipeFlow CRM",
  },
  description:
    "CRM de vendas com pipeline Kanban, gestão de leads e métricas — simples o bastante para começar hoje.",
};

/**
 * The application is dark only. There is no theme toggle and no pre-paint script
 * any more: the `dark` class is static, kept because the vendored shadcn
 * components carry `dark:` variants that have to keep resolving.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} ${plexMono.variable} dark`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
