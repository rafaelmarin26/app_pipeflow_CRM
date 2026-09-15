import type { Activity, Deal, Lead } from "@/types/database";

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
