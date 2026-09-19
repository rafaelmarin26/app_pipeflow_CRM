import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One headline figure — PLAN.md M8.
 *
 * A Server Component: the dashboard cards are read-only, so none of this needs
 * to reach the browser. The value arrives as a node rather than a number so the
 * caller decides its voice — Syne for a count, `money` for a sum in reais, as
 * the two typographic rules in CLAUDE.md §7 require.
 *
 * Nothing here is chartreuse. On this screen the accent is reserved for what
 * the user is pointing at; a card that sits still is information, not
 * interaction.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  enterDelayMs = 0,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  /** Offset of this card in the page's entrance cascade, in milliseconds. */
  enterDelayMs?: number;
}) {
  return (
    <div
      className={cn(
        "panel-in flex flex-col gap-3 rounded-lg border border-hairline bg-panel p-4",
      )}
      style={{ "--stagger": `${enterDelayMs}ms` } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label-mono text-faint">{label}</span>
        {Icon ? <Icon className="size-4 shrink-0 text-faint" aria-hidden /> : null}
      </div>

      <div className="text-3xl leading-none text-foreground">{value}</div>

      {hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
