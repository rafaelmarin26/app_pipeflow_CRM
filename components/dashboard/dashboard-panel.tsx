import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * The framed block the dashboard's two lower sections share — PLAN.md M8.
 *
 * Header in the product's label voice, a hairline, then whatever the section
 * renders. `bodyClassName` exists because the two bodies want opposite padding:
 * a chart needs room to breathe around its axis, a table brings its own cell
 * padding and has to run to the panel's edges.
 */
export function DashboardPanel({
  title,
  meta,
  children,
  className,
  bodyClassName,
  enterDelayMs = 0,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  enterDelayMs?: number;
}) {
  return (
    <section
      className={cn(
        "panel-in flex flex-col overflow-hidden rounded-lg border border-hairline bg-panel",
        className,
      )}
      style={{ "--stagger": `${enterDelayMs}ms` } as CSSProperties}
    >
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <h2 className="label-mono text-foreground">{title}</h2>
        {meta ? <span className="label-mono text-faint">{meta}</span> : null}
      </header>

      <div className={cn("flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
