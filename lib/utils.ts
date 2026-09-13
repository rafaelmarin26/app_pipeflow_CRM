import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Merges conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Money lives in the database as integer cents (CLAUDE.md §4); it only becomes
 * a decimal here, at the edge, where it is rendered.
 */
export function formatCurrency(cents: number): string {
  return currency.format(cents / 100);
}

/**
 * Abbreviates a value for tight spots such as Kanban column totals, where a
 * six-figure sum would push the header out of the column.
 */
export function formatCurrencyCompact(cents: number): string {
  const value = cents / 100;

  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`;
  }

  if (Math.abs(value) >= 10_000) {
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    })} mil`;
  }

  return currency.format(value);
}

function toDate(value: string | Date): Date | null {
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** `12/09/2026` */
export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "—";
}

/** `12/09/2026 às 14:30` */
export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—";
}

/** `há 3 dias` — used on activity timelines and deal due dates. */
export function formatRelativeDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";

  return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
}

/** Two-letter fallback for avatars without a picture. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** `Agência Norte` -> `agencia-norte`, for workspace slugs. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
