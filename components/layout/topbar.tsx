"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { currentNavItem } from "@/components/layout/nav-items";
import {
  SidebarContent,
  type SidebarContentProps,
} from "@/components/layout/sidebar-content";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * The top bar owns the mobile drawer trigger, so the sidebar below `md` is the
 * same component in a sheet rather than a second implementation.
 */
export function Topbar(props: SidebarContentProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const section = currentNavItem(pathname);
  const workspace = props.workspaces.find(
    (item) => item.id === props.activeWorkspaceId,
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-panel px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 gap-0 bg-panel p-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Workspaces, seções do aplicativo e menu do usuário.
          </SheetDescription>

          <SidebarContent {...props} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <Brand className="md:hidden" />

      {/* Breadcrumb replaces the brand on desktop, where the sidebar carries it. */}
      <div className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
        {workspace ? (
          <>
            <span className="truncate text-muted-foreground">
              {workspace.name}
            </span>
            <ChevronRight
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </>
        ) : null}
        <span className="truncate font-medium text-foreground">
          {section?.label ?? "PipeFlow"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
