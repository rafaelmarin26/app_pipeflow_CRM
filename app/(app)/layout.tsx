import { SidebarContent } from "@/components/layout/sidebar-content";
import { Topbar } from "@/components/layout/topbar";
import {
  ACTIVE_WORKSPACE_ID,
  currentUser,
  currentUserRole,
  mockWorkspaces,
} from "@/lib/mock-data";

/**
 * Shell of the authenticated area — PLAN.md M4.
 *
 * This is the only place in the shell that knows where the data comes from.
 * M11 swaps these fixtures for `getUser()` plus the active workspace resolved on
 * the server; every component below keeps receiving the same props.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shell = {
    workspaces: mockWorkspaces,
    activeWorkspaceId: ACTIVE_WORKSPACE_ID,
    user: currentUser,
    role: currentUserRole,
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
