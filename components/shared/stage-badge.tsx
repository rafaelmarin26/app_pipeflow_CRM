import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_LABELS, stageTone, type StageTone } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { DealStage } from "@/types/database";

/**
 * Colour is information here, not decoration (CLAUDE.md §7): green and red are
 * reserved for won and lost, everything still in play is indigo. The tone comes
 * from the enum, so a badge can never disagree with the column it sits in.
 */
const toneClasses: Record<StageTone, string> = {
  open: "border-open/25 bg-open/10 text-open-ink",
  won: "border-won/25 bg-won/10 text-won-ink",
  lost: "border-lost/25 bg-lost/10 text-lost-ink",
};

export function StageBadge({
  stage,
  className,
}: {
  stage: DealStage;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", toneClasses[stageTone(stage)], className)}
    >
      {DEAL_STAGE_LABELS[stage]}
    </Badge>
  );
}
