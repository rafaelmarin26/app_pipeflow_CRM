import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Anterior/Próxima pager for the leads list — PLAN.md M12. A server
 * component: the current page is already in the URL the page rendered from,
 * so there is nothing here that needs client state.
 */
export function LeadsPagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  /** `?page=` swapped for the given page, every other filter kept. */
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="label-mono text-faint">
        Página {page} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(page - 1)}>
              <ChevronLeft aria-hidden />
              Anterior
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft aria-hidden />
            Anterior
          </Button>
        )}

        {page < totalPages ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(page + 1)}>
              Próxima
              <ChevronRight aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Próxima
            <ChevronRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
