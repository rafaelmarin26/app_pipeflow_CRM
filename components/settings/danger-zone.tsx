"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { deleteWorkspace } from "@/app/(app)/(shell)/settings/_actions";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Excluir workspace — PLAN.md M9/M15. Typing the workspace's own name before
 * the button unlocks is the confirmation: every lead, deal, activity and
 * membership goes with it, in one cascading delete, and there is no undo.
 */
export function DangerZone({ workspaceName }: { workspaceName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);

  const canConfirm = confirmation.trim() === workspaceName;

  async function onConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (!canConfirm) return;

    setPending(true);
    const result = await deleteWorkspace();
    setPending(false);

    if (result && "error" in result) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-negative/30">
      <CardHeader>
        <CardTitle>Zona de perigo</CardTitle>
        <CardDescription>
          Excluir o workspace apaga leads, negócios, atividades e o acesso de todo o time. Não pode ser desfeito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setConfirmation("");
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Excluir workspace</Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {workspaceName}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é definitiva. Para confirmar, digite{" "}
                <strong className="text-foreground">{workspaceName}</strong> abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="sr-only">
                Nome do workspace
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost" disabled={pending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={onConfirm}
                disabled={!canConfirm || pending}
              >
                {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                Excluir permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
