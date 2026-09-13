import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An empty state is never a blank screen (CLAUDE.md §7): it says what would be
 * here and offers the first action. `action` is a slot so the caller decides
 * whether it opens a dialog, links somewhere, or is absent entirely.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Tighter variant for a Kanban column, which has no room for the full block. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center",
        compact ? "gap-1.5 p-4" : "gap-3 p-10",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "text-muted-foreground",
            compact ? "size-5" : "size-8",
          )}
          aria-hidden
        />
      ) : null}

      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p
          className={cn(
            "font-medium text-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              "mx-auto max-w-sm text-muted-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className={compact ? "" : "pt-1"}>{action}</div> : null}
    </div>
  );
}
