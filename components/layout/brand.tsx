import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Product mark: three rising bars, the pipeline itself. Drawn inline rather than
 * imported so it inherits the indigo to violet gradient from the tokens.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-brand",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <rect x="4" y="13" width="4" height="7" rx="1.5" fill="white" fillOpacity="0.65" />
        <rect x="10" y="9" width="4" height="11" rx="1.5" fill="white" fillOpacity="0.85" />
        <rect x="16" y="4" width="4" height="16" rx="1.5" fill="white" />
      </svg>
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
        "flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      <BrandMark />
      <span className="text-base font-semibold tracking-tight text-foreground">
        PipeFlow
      </span>
    </Link>
  );
}
