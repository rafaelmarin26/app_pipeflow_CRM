import type { Metadata } from "next";

import { AuthCard, AuthShell } from "@/components/auth/auth-shell";
import { WorkspaceForm } from "@/components/onboarding/workspace-form";

export const metadata: Metadata = {
  title: "Criar workspace",
};

/**
 * Onboarding lives under `(app)` as CLAUDE.md §3 lays out, but outside the
 * `(shell)` group that carries the sidebar: it runs before the first workspace
 * exists, so there is nothing for a workspace switcher to show yet. It borrows
 * the access-screen frame instead.
 */
export default function OnboardingPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Criar seu workspace"
        description="Um workspace é a empresa ou o time que vai usar o pipeline. Você pode criar outros depois."
      >
        <WorkspaceForm />
      </AuthCard>
    </AuthShell>
  );
}
