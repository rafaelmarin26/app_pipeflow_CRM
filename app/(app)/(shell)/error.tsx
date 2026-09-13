"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reporting goes to a real sink in M17; the raw error never reaches the UI.
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-due/10 text-due-ink">
          <TriangleAlert className="size-6" aria-hidden />
        </span>

        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Não foi possível carregar esta tela.</h1>
          <p className="text-sm text-muted-foreground">
            Tente novamente. Se o problema continuar, recarregue a página.
          </p>
        </div>

        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
