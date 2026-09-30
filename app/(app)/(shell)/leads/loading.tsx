import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the leads list geometry — header, toolbar, table — so the real
 * content lands where the shells were. Same row count and column visibility
 * as `LeadsTable`, so the skeleton doesn't promise columns the real table
 * hides below `md`/`lg`.
 */
export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-9 w-full sm:w-44" />
        <Skeleton className="h-9 w-full sm:w-48" />
        <Skeleton className="h-9 w-full sm:w-44" />
      </div>

      <Skeleton className="h-3 w-24" />

      <div className="overflow-hidden rounded-lg border border-hairline bg-panel">
        <div className="flex h-11 items-center gap-4 border-b border-hairline px-4">
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-28 md:block" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="hidden h-3 w-24 lg:block" />
          <Skeleton className="hidden h-3 w-20 sm:block" />
        </div>

        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex h-11 items-center gap-4 border-b border-hairline px-4 last:border-b-0"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-40 md:hidden" />
            </div>
            <Skeleton className="hidden h-3 w-28 md:block" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="hidden h-3 w-24 lg:block" />
            <Skeleton className="hidden h-3 w-16 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
