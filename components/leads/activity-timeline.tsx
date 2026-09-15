import { CalendarDays, FileText, Mail, Phone, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ACTIVITY_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime, formatRelativeDate } from "@/lib/utils";
import type { ActivityType } from "@/types/database";
import type { ActivityWithAuthor } from "@/types/views";

/**
 * Activity history of a lead — PLAN.md M6.
 *
 * Icons carry the type so the eye can scan the column without reading every
 * label, and they stay in the neutral ink: green and red belong to won and lost
 * deals (CLAUDE.md §7), and an activity is neither.
 */
const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
  note: StickyNote,
};

export function ActivityTimeline({
  activities,
}: {
  activities: ActivityWithAuthor[];
}) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma atividade registrada."
        description="Registre a primeira ligação, e-mail, reunião ou nota para manter o histórico deste lead."
      />
    );
  }

  return (
    <ol className="space-y-0">
      {activities.map((activity, index) => {
        const Icon = ACTIVITY_ICONS[activity.type];
        const last = index === activities.length - 1;

        return (
          <li key={activity.id} className="relative flex gap-3 pb-6 last:pb-0">
            {/* The rail stops at the last item, so the column does not dangle. */}
            {last ? null : (
              <span
                className="absolute top-9 bottom-0 left-4 w-px bg-border"
                aria-hidden
              />
            )}

            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden />
            </span>

            <div className="min-w-0 flex-1 space-y-1 pt-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </span>
                {activity.author ? (
                  <span className="text-xs text-muted-foreground">
                    por {activity.author.name}
                  </span>
                ) : null}
                <time
                  dateTime={activity.occurred_at}
                  title={formatDateTime(activity.occurred_at)}
                  className="text-xs text-muted-foreground"
                >
                  · {formatRelativeDate(activity.occurred_at)}
                </time>
              </div>

              <p className="text-sm text-foreground">{activity.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
