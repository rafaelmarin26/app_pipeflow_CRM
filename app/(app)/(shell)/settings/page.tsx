import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados do workspace, colaboradores e plano de assinatura."
      />

      <EmptyState
        icon={Settings}
        title="Nenhuma configuração disponível ainda."
        description="As abas de workspace, membros e plano são construídas nesta tela."
      />
    </div>
  );
}
