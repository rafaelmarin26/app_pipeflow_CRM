import { Skeleton } from "@/components/ui/skeleton";

/** Cards per column shell — enough to suggest a board, not enough to look full. */
const CARDS_PER_COLUMN = [3, 3, 2, 2, 2, 1];

/**
 * Mirrors the board geometry exactly — same column width, same gaps, same
 * divider before the closed stages — so the real columns land where the shells
 * were and nothing jumps when the data arrives.
 */
export default function PipelineLoading() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="-mx-6 min-h-0 flex-1 overflow-hidden px-6">
        <div className="flex h-full min-h-[24rem] items-stretch gap-4">
          {CARDS_PER_COLUMN.map((cards, index) => (
            <div key={index} className="contents">
              {/* Same divider the board draws between funnel and outcome. */}
              {index === 4 ? (
                <div
                  className="mx-2 w-px shrink-0 self-stretch bg-hairline"
                  aria-hidden
                />
              ) : null}

              <div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border border-hairline bg-panel/40">
                <Skeleton className="h-0.5 w-full rounded-none" />

                <div className="flex items-center gap-2 border-b border-hairline px-3 py-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="ml-auto h-3 w-14" />
                </div>

                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: cards }).map((_, card) => (
                    <Skeleton key={card} className="h-28 rounded-md" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
