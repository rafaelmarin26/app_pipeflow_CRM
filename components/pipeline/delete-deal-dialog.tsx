"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

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
import { deleteDeal } from "@/app/(app)/(shell)/pipeline/_actions";

/**
 * Destructive confirmation for a deal — PLAN.md M13, mirroring
 * `DeleteLeadDialog` (M6): an `AlertDialog` rather than the plain `Dialog`
 * because it announces itself as an alert and refuses to close on a click
 * outside, which is what a destructive question should do.
 */
export function DeleteDealDialog({
  dealId,
  dealTitle,
  trigger,
}: {
  dealId: string;
  dealTitle: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm(event: React.MouseEvent) {
    // The primitive closes on click; hold it open so the pending state is seen.
    event.preventDefault();
    setPending(true);

    const result = await deleteDeal(dealId);

    setPending(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    setOpen(false);
    toast.success(`${dealTitle} foi excluído.`);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {dealTitle}?</AlertDialogTitle>
          <AlertDialogDescription>
            O negócio sai do pipeline e a etapa deixa de contar o valor dele.
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={pending}>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : null}
            Excluir negócio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
