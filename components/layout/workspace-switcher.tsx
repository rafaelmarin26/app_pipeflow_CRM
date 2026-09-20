"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { switchWorkspace } from "@/app/(app)/(shell)/_actions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAN_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/database";

/**
 * The active workspace is resolved on the server (`lib/workspace.ts`,
 * PLAN.md M11) and arrives here as a prop; picking another one calls the
 * `switchWorkspace` Server Action to move the cookie, then refreshes the
 * router so every Server Component on the current page re-reads it.
 */
export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: Workspace[];
  activeWorkspaceId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selected =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];

  function handleSelect(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) return;

    startTransition(async () => {
      const result = await switchWorkspace(workspaceId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-border bg-canvas px-2.5 py-2 text-left text-sm outline-none transition-colors",
          "hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:opacity-60",
        )}
        aria-label="Trocar de workspace"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="size-4" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {selected.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            Plano {PLAN_LABELS[selected.plan]}
          </span>
        </span>

        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Seus workspaces
        </DropdownMenuLabel>

        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => handleSelect(workspace.id)}
            className="gap-2"
          >
            <span className="min-w-0 flex-1 truncate">{workspace.name}</span>

            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {PLAN_LABELS[workspace.plan]}
            </Badge>

            <Check
              className={cn(
                "size-4 shrink-0 text-primary",
                workspace.id === activeWorkspaceId ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
