import { redirect } from "next/navigation";

import { SidebarContent } from "@/components/layout/sidebar-content";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { getShellData } from "@/lib/workspace";

/**
 * Shell of the authenticated area — PLAN.md M4/M11.
 *
 * This is the only place in the shell that knows where the data comes from:
 * the user and the active workspace are resolved here, on the server, and
 * every component below just receives them as props. The middleware already
 * keeps a signed-out request from reaching this layout, but CLAUDE.md §5 has
 * this layer authorize itself too rather than rely on that alone.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const data = await getShellData(supabase);

  if (data.status === "unauthenticated") {
    redirect("/login");
  }

  if (data.status === "no-workspace") {
    redirect("/onboarding");
  }

  const shell = {
    workspaces: data.memberships.map((membership) => membership.workspace),
    activeWorkspaceId: data.active.workspace.id,
    user: data.user,
    role: data.active.role,
  };

  return (
    <div className="flex h-svh overflow-hidden bg-canvas">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-panel md:block">
        <SidebarContent {...shell} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar {...shell} />

        {/* Scrolls independently of the sidebar. */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
