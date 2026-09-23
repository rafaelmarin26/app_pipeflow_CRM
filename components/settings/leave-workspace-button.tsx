"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

import { leaveWorkspace } from "@/app/(app)/(shell)/settings/_actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Any member's self-service exit — PLAN.md M15. Blocked on the server when
 * the caller is the workspace's last Admin, so this can render for everyone
 * and let the action itself decide.
 */
export function LeaveWorkspaceButton({ workspaceName }: { workspaceName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm(event: React.MouseEvent) {
    event.preventDefault();
    setPending(true);

    const result = await leaveWorkspace();

    setPending(false);

    if (result && "error" in result) {
      toast.error(result.error);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sair do workspace"
          title="Sair do workspace"
          className="text-muted-foreground hover:text-lost-ink"
        >
          <LogOut aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair de {workspaceName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Você perde o acesso a este workspace imediatamente. Alguém com acesso pode te
            convidar de volta a qualquer momento.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            Sair do workspace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
