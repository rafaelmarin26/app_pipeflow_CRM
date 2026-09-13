import type { Metadata } from "next";
import { SquareKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pipeline" };

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Seus negócios distribuídos nas seis etapas do funil."
        action={<Button disabled>Novo negócio</Button>}
      />

      <EmptyState
        icon={SquareKanban}
        title="Nenhum negócio no pipeline."
        description="O quadro Kanban com arrastar e soltar entre as etapas é montado aqui."
      />
    </div>
  );
}
