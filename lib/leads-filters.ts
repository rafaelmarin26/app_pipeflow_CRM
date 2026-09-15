import { subDays } from "date-fns";

import { Constants, type LeadStatus } from "@/types/database";
import type { LeadWithOwner, Person } from "@/types/views";

/**
 * Search and filter rules for the leads list — PLAN.md M6.
 *
 * Deliberately pure: it takes arrays and the parsed query string and returns
 * arrays. M12 replaces the *bodies* of `applyLeadFilters` with a Postgres query,
 * while `parseLeadFilters` and the option lists below stay exactly as they are —
 * the URL contract does not change when the data source does.
 */

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

/**
 * Accent- and case-insensitive: someone searching "veronica" has to find
 * "Verônica", and nobody types the circumflex into a search box.
 */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesTerm(lead: LeadWithOwner, term: string): boolean {
  return [lead.name, lead.email, lead.company].some(
    (field) => field && normalize(field).includes(term),
  );
}

export function applyLeadFilters(
  leads: LeadWithOwner[],
  filters: LeadFilters,
): LeadWithOwner[] {
  const term = normalize(filters.q.trim());
  const period = LEAD_PERIODS.find((item) => item.value === filters.period);
  const since = period ? subDays(new Date(), period.days) : null;

  return leads.filter((lead) => {
    if (term && !matchesTerm(lead, term)) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.owner && lead.owner_id !== filters.owner) return false;
    if (since && new Date(lead.created_at) < since) return false;
    return true;
  });
}

/** Newest first — the list is a work queue, and new leads are the work. */
export function sortLeadsByCreatedAt(leads: LeadWithOwner[]): LeadWithOwner[] {
  return [...leads].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
