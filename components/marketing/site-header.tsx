"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public header — PLAN.md M3.
 *
 * Sticky and **solid**, not frosted: `backdrop-filter: blur` is on the list of
 * effects CLAUDE.md §7 rules out, so the bar sits on the page colour with a
 * hairline under it and lets the content scroll behind nothing.
 *
 * A client component only because of the mobile disclosure. The links inside it
 * are plain anchors, so the navigation works before hydration.
 */

const NAV_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand href="/" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Seções">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden md:inline-flex">
            <Link href="/signup">Começar grátis</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className={cn("border-t border-hairline bg-canvas md:hidden")}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
          aria-label="Seções"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
          >
            Entrar
          </Link>

          <Button asChild className="mt-2">
            <Link href="/signup" onClick={() => setOpen(false)}>
              Começar grátis
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
