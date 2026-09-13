import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-6" aria-hidden />
        </span>

        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Página não encontrada.</h1>
          <p className="text-sm text-muted-foreground">
            O endereço não existe ou o registro foi removido do workspace.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
