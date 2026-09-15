import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the detail layout — identity card, then activities beside deals — so
 * arriving from the list does not shift the page around once the data lands.
 */
export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-56 rounded-lg" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
