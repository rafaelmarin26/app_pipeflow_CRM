import { Brand } from "@/components/layout/brand";
import type { ShellUser } from "@/components/layout/nav-items";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { Separator } from "@/components/ui/separator";
import type { MemberRole, Workspace } from "@/types/database";

export type SidebarContentProps = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  user: ShellUser;
  role: MemberRole;
  /** Set by the mobile drawer so tapping a link closes the sheet. */
  onNavigate?: () => void;
};

/**
 * The sidebar body, shared by the fixed desktop rail and the mobile drawer, so
 * the two can never drift apart. Everything it needs arrives as props — it
 * never reaches for the data itself.
 */
export function SidebarContent({
  workspaces,
  activeWorkspaceId,
  user,
  role,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Brand />
      </div>

      <div className="px-3 pb-3">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        />
      </div>

      <Separator />

      {/* Scrolls on its own once the nav outgrows the viewport. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <Separator />

      <div className="shrink-0 p-2">
        <UserMenu user={user} role={role} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
