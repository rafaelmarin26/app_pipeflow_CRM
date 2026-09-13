"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";

import type { ShellUser } from "@/components/layout/nav-items";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { cn, initials } from "@/lib/utils";
import type { MemberRole } from "@/types/database";

export function UserMenu({
  user,
  role,
  onNavigate,
}: {
  user: ShellUser;
  role: MemberRole;
  onNavigate?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
          "hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
        aria-label="Menu do usuário"
      >
        <Avatar className="size-7 shrink-0">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt="" />
          ) : null}
          <AvatarFallback className="text-xs">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {user.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {MEMBER_ROLE_LABELS[role]}
          </span>
        </span>

        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
      >
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" onClick={onNavigate}>
            <Settings className="size-4" aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation only: M11 turns this into the sign-out Server Action. */}
        <DropdownMenuItem asChild>
          <Link href="/login" onClick={onNavigate}>
            <LogOut className="size-4" aria-hidden />
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
