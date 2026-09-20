import { Constants, type LeadStatus } from "@/types/database";
import type { Person } from "@/types/views";

/**
 * Search and filter rules for the leads list — PLAN.md M6, with M12's
 * Postgres query replacing the in-memory `applyLeadFilters`/
 * `sortLeadsByCreatedAt` this file used to export. `parseLeadFilters` and the
 * option lists below are the part of M6 that was already a URL contract, not
 * an implementation detail, so they stay exactly as they were — the source
 * of the data changed, not the shape of the query string.
 */

/** Rows per page, matched to the Free plan's lead cap (CLAUDE.md §5). */
export const LEADS_PAGE_SIZE = 50;

/** `?page=` from the URL, defaulting to (and never below) the first page. */
export function parseLeadsPage(params: SearchParams): number {
  const raw = Number(single(params.page));
  return Number.isInteger(raw) && raw > 1 ? raw : 1;
}

export const LEAD_PERIODS = [
  { value: "7d", label: "Últimos 7 dias", days: 7 },
  { value: "30d", label: "Últimos 30 dias", days: 30 },
  { value: "90d", label: "Últimos 90 dias", days: 90 },
] as const;

export type LeadPeriod = (typeof LEAD_PERIODS)[number]["value"];

export type LeadFilters = {
  q: string;
  status: LeadStatus | null;
  owner: string | null;
  period: LeadPeriod | null;
};

export const EMPTY_LEAD_FILTERS: LeadFilters = {
  q: "",
  status: null,
  owner: null,
  period: null,
};

/** Sentinel for the "no filter" option: Radix Select rejects an empty value. */
export const ALL_OPTION = "all";

export type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * URL -> filters. Unknown values are dropped rather than rejected: a stale or
 * hand-edited link should show the full list, not an error.
 */
export function parseLeadFilters(
  params: SearchParams,
  owners: Person[],
): LeadFilters {
  const status = single(params.status);
  const owner = single(params.owner);
  const period = single(params.period);

  return {
    q: single(params.q).slice(0, 120),
    status: (Constants.public.Enums.lead_status as readonly string[]).includes(
      status,
    )
      ? (status as LeadStatus)
      : null,
    owner: owners.some((person) => person.id === owner) ? owner : null,
    period: LEAD_PERIODS.some((item) => item.value === period)
      ? (period as LeadPeriod)
      : null,
  };
}

export function hasActiveLeadFilters(filters: LeadFilters): boolean {
  return Boolean(
    filters.q || filters.status || filters.owner || filters.period,
  );
}

/** How many days back a period filter reaches — `leads/page.tsx` turns this into a `gte("created_at", ...)`. */
export function periodSinceDays(period: LeadPeriod | null): number | null {
  return LEAD_PERIODS.find((item) => item.value === period)?.days ?? null;
}

/**
 * A search term, escaped for Postgrest's `ilike` pattern syntax — `%` and `_`
 * are wildcards there, and a lead named "50% Off Co." has to be searchable
 * without those literal characters reopening the pattern.
 *
 * Dropped from the M6 mock behaviour: matching there ignored accents
 * ("veronica" found "Verônica"). Postgres `ilike` alone is case-insensitive
 * but not accent-insensitive; folding accents server-side needs the
 * `unaccent` extension wired into an index, which is a real addition to the
 * schema for a search-quality nicety — left for when a workspace's lead list
 * is large enough to be worth doing right.
 */
export function escapeIlikePattern(term: string): string {
  return term.replace(/[%_\\]/g, (char) => `\\${char}`);
}
