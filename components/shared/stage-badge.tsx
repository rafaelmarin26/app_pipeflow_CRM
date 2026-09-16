import { DEAL_STAGE_LABELS } from "@/lib/labels";
import { STAGE_BG, STAGE_TEXT } from "@/lib/stage-styles";
import { cn } from "@/lib/utils";
import type { DealStage } from "@/types/database";

/**
 * Stage of a deal — CLAUDE.md §7, Identidade Visual v2.
 *
 * A dot plus a mono label rather than a pill: v2 reads badges as data, and the
 * label voice of the product is small uppercase mono. The colour comes from the
 * stage map, never from a value written here, so a badge can never disagree with
 * the column the deal sits in.
 */
export function StageBadge({
  stage,
  className,
}: {
  stage: DealStage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 whitespace-nowrap",
        STAGE_TEXT[stage],
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", STAGE_BG[stage])}
        aria-hidden
      />
      {DEAL_STAGE_LABELS[stage]}
    </span>
  );
}
