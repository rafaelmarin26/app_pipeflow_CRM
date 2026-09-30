import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback for all three settings routes at once: `settings/layout.tsx` does
 * its own async workspace lookup, so this file's Suspense boundary sits above
 * the tab nav too, not just the tab's own page. The content block stays
 * generic — a labeled card of a few lines — because it stands in for three
 * different shapes (workspace form, members table, plan overview) rather
 * than mirroring one of them exactly.
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="flex gap-1">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      <div className="max-w-2xl space-y-4 rounded-lg border border-hairline bg-panel p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
