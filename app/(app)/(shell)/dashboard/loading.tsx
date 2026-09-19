import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the dashboard's geometry exactly — four cards, then the 5/7 split of
 * funnel and deadlines — so the real content lands where the shells were and
 * nothing on the first screen after login jumps.
 *
 * M14 reuses this file as the Suspense fallback while the aggregate queries
 * resolve; until then Next renders it on navigation.
 */

/** Bar widths of the funnel shell, in percent. Suggests a funnel, not data. */
const FUNNEL_BARS = [72, 60, 48, 34, 44, 30];

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border border-hairline bg-panel p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-panel xl:col-span-5">
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="space-y-4 px-3 py-5">
            {FUNNEL_BARS.map((width, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-3 w-[140px] shrink-0" />
                <Skeleton
                  className="h-4 rounded-sm"
                  style={{ width: `${width}%` }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-panel xl:col-span-7">
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="divide-y divide-hairline">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex h-11 items-center gap-4 px-4">
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="hidden h-3 w-28 sm:block" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
