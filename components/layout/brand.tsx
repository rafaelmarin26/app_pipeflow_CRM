import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Product mark — CLAUDE.md §7.
 *
 * A chartreuse square with a "P" in it, and nothing else. v1 drew three rising
 * bars in a gradient; v2 rules gradients out and asks for something direct
 * enough to survive at 20px in a favicon, so the mark is a letter on a colour.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md bg-brand",
        className,
      )}
      aria-hidden
    >
      <span className="font-display text-[1.05rem] leading-none font-extrabold text-brand-ink">
        P
      </span>
    </span>
  );
}

export function Brand({
  href = "/dashboard",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      <BrandMark />
      <span className="font-display text-base leading-none tracking-tight">
        <span className="font-semibold text-foreground">PipeFlow</span>{" "}
        <span className="font-normal text-faint">CRM</span>
      </span>
    </Link>
  );
}
