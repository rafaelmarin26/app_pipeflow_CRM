"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_OPTION,
  hasActiveLeadFilters,
  LEAD_PERIODS,
  type LeadFilters,
} from "@/lib/leads-filters";
import { LEAD_STATUS_LABELS, leadStatusOptions } from "@/lib/labels";
import type { Person } from "@/types/views";

const DEBOUNCE_MS = 300;

/**
 * Search and filters for the leads list — PLAN.md M6.
 *
 * All four controls write to the URL and nothing else: the query string is the
 * single source of truth, so a filtered view survives a reload, can be shared as
 * a link, and is read on the server. `router.replace` rather than `push` keeps
 * every keystroke out of the back button.
 */
export function LeadsToolbar({
  filters,
  owners,
}: {
  filters: LeadFilters;
  owners: Person[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // The text input is the one control held locally, because it is debounced.
  // The selects commit immediately and read straight from `filters`.
  const [term, setTerm] = useState(filters.q);

  function commit(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    // Every call here changes what the list shows, so whatever page the user
    // was on stops meaning anything — send them back to the first one instead
    // of leaving `?page=3` pointed at a result set that may not have one.
    params.delete("page");

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  useEffect(() => {
    if (term === filters.q) return;

    const timer = setTimeout(() => commit({ q: term || null }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `commit` is recreated every render; the effect only depends on the term.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, filters.q]);

  function clearAll() {
    setTerm("");
    commit({ q: null, status: null, owner: null, period: null });
  }

  const active = hasActiveLeadFilters(filters);

  // Radix renders the selected item's text only after mount, which leaves three
  // empty triggers in the server HTML. The labels are known here, so they are
  // passed explicitly and the first paint already reads correctly.
  const statusLabel = filters.status
    ? LEAD_STATUS_LABELS[filters.status]
    : "Todos os status";

  const ownerLabel =
    owners.find((person) => person.id === filters.owner)?.name ??
    "Todos os responsáveis";

  const periodLabel =
    LEAD_PERIODS.find((period) => period.value === filters.period)?.label ??
    "Qualquer período";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          type="search"
          aria-label="Buscar por nome, e-mail ou empresa"
          placeholder="Buscar por nome, e-mail ou empresa"
          className="pl-9"
        />
        {pending ? (
          <LoaderCircle
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>

      <Select
        value={filters.status ?? ALL_OPTION}
        onValueChange={(value) =>
          commit({ status: value === ALL_OPTION ? null : value })
        }
      >
        <SelectTrigger aria-label="Filtrar por status" className="w-full sm:w-44">
          <SelectValue>{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OPTION}>Todos os status</SelectItem>
          {leadStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.owner ?? ALL_OPTION}
        onValueChange={(value) =>
          commit({ owner: value === ALL_OPTION ? null : value })
        }
      >
        <SelectTrigger
          aria-label="Filtrar por responsável"
          className="w-full sm:w-48"
        >
          <SelectValue>{ownerLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OPTION}>Todos os responsáveis</SelectItem>
          {owners.map((person) => (
            <SelectItem key={person.id} value={person.id}>
              {person.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.period ?? ALL_OPTION}
        onValueChange={(value) =>
          commit({ period: value === ALL_OPTION ? null : value })
        }
      >
        <SelectTrigger
          aria-label="Filtrar por data de criação"
          className="w-full sm:w-44"
        >
          <SelectValue>{periodLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OPTION}>Qualquer período</SelectItem>
          {LEAD_PERIODS.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active ? (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X aria-hidden />
          Limpar filtros
        </Button>
      ) : null}
    </div>
  );
}
