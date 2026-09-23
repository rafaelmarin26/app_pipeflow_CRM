import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";

/**
 * Shared frame of the three settings routes — PLAN.md M9. Resolves the role
 * once, for the tab nav; each tab's own page resolves its own context again
 * for its data and its own Admin check, matching the rest of the app's
 * pattern of never trusting a parent layout for authorization.
 */
export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados do workspace, colaboradores e plano de assinatura."
      />

      <SettingsTabs role={context.role} />

      {children}
    </div>
  );
}
