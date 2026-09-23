"use client";

import { useState } from "react";
import { LoaderCircle, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { removeMember } from "@/app/(app)/(shell)/settings/_actions";
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

/** Removes someone else from the workspace — PLAN.md M15, Admin only. */
export function RemoveMemberDialog({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm(event: React.MouseEvent) {
    event.preventDefault();
    setPending(true);

    const result = await removeMember(userId);

    setPending(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    setOpen(false);
    toast.success(`${name} foi removido do workspace.`);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remover ${name}`}
          title="Remover"
          className="text-muted-foreground hover:text-lost-ink"
        >
          <UserMinus aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {name} perde o acesso a este workspace imediatamente. Os leads e negócios já
            atribuídos a essa pessoa continuam como estão, mas ela não poderá mais atualizá-los.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
