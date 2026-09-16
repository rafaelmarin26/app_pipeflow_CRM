import { LEAD_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";

/**
 * Status of a lead — CLAUDE.md §7, Identidade Visual v2.
 *
 * Same shape as the stage badge, a dot and a mono label, because the two are
 * read in the same glance on the lead detail page. The colours come from the
 * semantic scale, not from the pipeline scale: lead status is a different axis
 * from deal stage, and borrowing a stage hue here would imply a link that does
 * not exist.
 *
 * Progression runs neutral → cool → accent → positive, with `unqualified` the
 * only one that goes quiet instead of coloured. A dead lead should recede.
 */
const statusDot: Record<LeadStatus, string> = {
  new: "bg-faint",
  contacted: "bg-cool",
  qualified: "bg-brand",
  unqualified: "bg-border",
  customer: "bg-positive",
};

const statusText: Record<LeadStatus, string> = {
  new: "text-faint",
  contacted: "text-cool",
  qualified: "text-brand",
  unqualified: "text-faint",
  customer: "text-positive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 whitespace-nowrap",
        statusText[status],
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", statusDot[status])}
        aria-hidden
      />
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
