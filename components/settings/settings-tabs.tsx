"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MemberRole } from "@/types/database";

type SettingsTab = { value: string; label: string };

const ALL_TABS: SettingsTab[] = [
  { value: "workspace", label: "Workspace" },
  { value: "members", label: "Membros" },
  { value: "billing", label: "Plano" },
];

/**
 * Tab nav across the three settings routes — PLAN.md M9. Each tab is a real
 * route (`app/(app)/(shell)/settings/<tab>/page.tsx`) so the page itself can
 * decide what a Member is allowed to see; this component only skips
 * rendering the "Workspace" tab link for a Member, since that page always
 * redirects them away (CLAUDE.md §7: hidden in the UI *and* checked on the
 * server, never one or the other).
 */
export function SettingsTabs({ role }: { role: MemberRole }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = role === "admin" ? ALL_TABS : ALL_TABS.filter((tab) => tab.value !== "workspace");
  const active = tabs.find((tab) => pathname.startsWith(`/settings/${tab.value}`))?.value;

  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.push(`/settings/${value}`)}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
