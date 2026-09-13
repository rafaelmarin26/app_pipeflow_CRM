import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
 * Dark is the default theme: <html> ships with the class and this script only
 * takes it off when the visitor has explicitly chosen light. Running before
 * hydration is what keeps the page from flashing the wrong palette.
 */
const themeScript = `
(function () {
  try {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
