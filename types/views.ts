import type { Activity, Deal, Invite, Lead, MemberRole } from "@/types/database";

/**
 * Row shapes the screens consume — a table row plus the rows it was joined to.
 *
 * Today the Server Component of each page builds these from the fixtures in
 * `lib/mock-data.ts`; in phase 3 the exact same shape comes back from a SQL join
 * (`select *, owner:owner_id (...)`). Components only ever see this type, so the
 * swap stays inside the page.
 */

/** A person as the UI renders them. Comes from `auth.users` in phase 3. */
export type Person = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};

export type LeadWithOwner = Lead & { owner: Person | null };

export type DealWithOwner = Deal & { owner: Person | null };

export type ActivityWithAuthor = Activity & { author: Person | null };

/**
 * A deal as the Kanban card renders it: the row plus both of its joins.
 *
 * This is the shape of `select *, owner:owner_id (...), lead:lead_id (...)` that
 * M13 runs against the `deals` table — only the columns the card actually shows
 * are picked from the lead, so the board never ships a payload it does not paint.
 */
export type DealCardData = DealWithOwner & {
  lead: Pick<Lead, "id" | "name" | "company"> | null;
};

/**
 * A workspace roster row as the Members tab renders it — PLAN.md M15: the
 * `workspace_members` row plus the profile it points to.
 */
export type MemberWithProfile = {
  user_id: string;
  role: MemberRole;
  created_at: string;
  profile: Person;
};

/** A pending invite plus who sent it, for the Members tab's pending list. */
export type InviteWithInviter = Invite & { inviter: Person | null };
