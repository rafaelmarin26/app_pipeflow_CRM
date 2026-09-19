import Link from "next/link";

import { Brand } from "@/components/layout/brand";

/** Public footer — PLAN.md M3. */

const FOOTER_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
  { href: "/login", label: "Entrar" },
  { href: "/signup", label: "Criar conta" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Brand href="/" />
          <p className="mt-4 text-sm text-muted-foreground">
            CRM de vendas para PMEs, freelancers e times pequenos. Pipeline,
            leads e métricas sem a complexidade que ninguém pediu.
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-col gap-3">
          {FOOTER_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="label-mono text-faint">
            PipeFlow CRM · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
