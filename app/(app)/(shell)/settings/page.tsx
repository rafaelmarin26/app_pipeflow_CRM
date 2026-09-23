import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";

/** `/settings` has no content of its own — it lands on the first tab the role can see. */
export default async function SettingsIndexPage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  redirect(context.role === "admin" ? "/settings/workspace" : "/settings/members");
}
