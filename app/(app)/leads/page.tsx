import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Todos os contatos do workspace, com busca e filtros."
        action={<Button disabled>Novo lead</Button>}
      />

      <EmptyState
        icon={Users}
        title="Nenhum lead cadastrado ainda."
        description="Cadastre o primeiro contato para começar a acompanhar o relacionamento e registrar atividades."
      />
    </div>
  );
}
