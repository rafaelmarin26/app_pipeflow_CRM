import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActivityForm } from "@/components/leads/activity-form";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { LeadDeals } from "@/components/leads/lead-deals";
import { LeadDetailHeader } from "@/components/leads/lead-detail-header";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";
import type {
  ActivityWithAuthor,
  DealWithOwner,
  LeadWithOwner,
  Person,
} from "@/types/views";

type PageProps = { params: Promise<{ id: string }> };

/**
 * Lead detail — PLAN.md M6, with M12's Postgres queries in place of the
 * fixture reads.
 *
 * The workspace filter on every read is not decoration: RLS already enforces
 * it, but a lead from another workspace still has to render as a 404 here,
 * not as a lead with missing data — CLAUDE.md §5's "this layer checks for
 * itself too" applied to reads, not just to the mutations in `_actions.ts`.
 */
async function loadLead(id: string) {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  const { workspace } = context;

  const [leadResult, dealsResult, activitiesResult, membersResult] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*, owner:owner_id(id, name, email, avatar_url)")
        .eq("id", id)
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
      supabase
        .from("deals")
        .select("*, owner:owner_id(id, name, email, avatar_url)")
        .eq("lead_id", id)
        .eq("workspace_id", workspace.id)
        .order("value_cents", { ascending: false }),
      supabase
        .from("activities")
        .select("*, author:author_id(id, name, email, avatar_url)")
        .eq("lead_id", id)
        .eq("workspace_id", workspace.id)
        // Most recent first: the last thing that happened is the thing being
        // followed up on.
        .order("occurred_at", { ascending: false }),
      supabase
        .from("workspace_members")
        .select("profile:user_id(id, name, email, avatar_url)")
        .eq("workspace_id", workspace.id),
    ]);

  if (!leadResult.data) return null;

  const lead = leadResult.data as LeadWithOwner;
  const deals = (dealsResult.data ?? []) as DealWithOwner[];
  const activities = (activitiesResult.data ?? []) as ActivityWithAuthor[];

  const owners: Person[] = (membersResult.data ?? [])
    .map((row) => row.profile)
    .filter((person): person is Person => Boolean(person));

  return { lead, deals, activities, owners };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await loadLead(id);

  return { title: data ? data.lead.name : "Lead não encontrado" };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await loadLead(id);

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

          <ActivityForm leadId={lead.id} leadName={lead.name} />
          <ActivityTimeline activities={activities} />
        </section>

        <div className="lg:col-span-1">
          <LeadDeals deals={deals} />
        </div>
      </div>
    </div>
  );
}
