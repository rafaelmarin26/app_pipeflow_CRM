import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActivityForm } from "@/components/leads/activity-form";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { LeadDeals } from "@/components/leads/lead-deals";
import { LeadDetailHeader } from "@/components/leads/lead-detail-header";
import {
  ACTIVE_WORKSPACE_ID,
  findUser,
  mockActivities,
  mockDeals,
  mockLeads,
  mockMembers,
} from "@/lib/mock-data";
import type {
  ActivityWithAuthor,
  DealWithOwner,
  LeadWithOwner,
  Person,
} from "@/types/views";

type PageProps = { params: Promise<{ id: string }> };

/**
 * Lead detail — PLAN.md M6.
 *
 * The workspace filter on every read is not decoration: it is the shape the
 * queries take in M12, where the same isolation is enforced again by RLS. A lead
 * from another workspace has to be a 404 here, not a lead with missing data.
 */
function loadLead(id: string) {
  const row = mockLeads.find(
    (lead) => lead.id === id && lead.workspace_id === ACTIVE_WORKSPACE_ID,
  );
  if (!row) return null;

  const lead: LeadWithOwner = { ...row, owner: findUser(row.owner_id) ?? null };

  // Three reads that become three parallel queries in M12.
  const deals: DealWithOwner[] = mockDeals
    .filter((deal) => deal.lead_id === row.id)
    .map((deal) => ({ ...deal, owner: findUser(deal.owner_id) ?? null }))
    .sort((a, b) => b.value_cents - a.value_cents);

  const activities: ActivityWithAuthor[] = mockActivities
    .filter((activity) => activity.lead_id === row.id)
    .map((activity) => ({
      ...activity,
      author: findUser(activity.author_id) ?? null,
    }))
    // Most recent first: the last thing that happened is the thing being
    // followed up on.
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));

  const owners: Person[] = mockMembers
    .filter((member) => member.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((member) => findUser(member.user_id))
    .filter((person): person is Person => Boolean(person));

  return { lead, deals, activities, owners };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = loadLead(id);

  return { title: data ? data.lead.name : "Lead não encontrado" };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = loadLead(id);

  // Renders the not-found screen of the shell. Note that Next 15 streams the
  // response before this throws, so the status stays 200 while the screen is
  // correct — the robots rule of M17 is what keeps such a URL out of indexes.
  if (!data) notFound();

  const { lead, deals, activities, owners } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para leads
      </Link>

      <LeadDetailHeader lead={lead} owners={owners} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Atividades</h2>

          <ActivityForm leadName={lead.name} />
          <ActivityTimeline activities={activities} />
        </section>

        <div className="lg:col-span-1">
          <LeadDeals deals={deals} />
        </div>
      </div>
    </div>
  );
}
