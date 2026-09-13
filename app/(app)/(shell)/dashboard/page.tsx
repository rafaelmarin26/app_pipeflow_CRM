import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Métricas do funil, valor em aberto e prazos próximos."
      />

      <EmptyState
        icon={LayoutDashboard}
        title="Nenhuma métrica calculada ainda."
        description="Os cards de desempenho e o gráfico de funil aparecem aqui assim que houver negócios no pipeline."
      />
    </div>
  );
}
