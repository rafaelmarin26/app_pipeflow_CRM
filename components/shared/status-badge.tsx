import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";

/**
 * Lead status deliberately avoids green and red — those belong to won and lost
 * deals (CLAUDE.md §7). Progression is read through intensity instead: a neutral
 * outline for a fresh lead, indigo as it warms up, violet once it converts.
 */
const statusClasses: Record<LeadStatus, string> = {
  new: "border-border bg-transparent text-muted-foreground",
  contacted: "border-open/25 bg-open/10 text-open-ink",
  qualified: "border-open/40 bg-open/20 font-semibold text-open-ink",
  unqualified: "border-transparent bg-muted text-muted-ink",
  customer: "border-brand/30 bg-brand/15 text-brand-ink",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusClasses[status], className)}
    >
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}
