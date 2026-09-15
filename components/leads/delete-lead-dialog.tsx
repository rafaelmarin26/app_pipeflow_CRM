"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { fakeSubmit } from "@/lib/fake-submit";

/**
 * Destructive confirmation for a lead — PLAN.md M6.
 *
 * An `AlertDialog` rather than the plain `Dialog` on purpose: it announces
 * itself as an alert and refuses to close on a click outside, which is what a
 * destructive question should do.
 *
 * Deleting is fake until M12; `redirectTo` exists because the detail page has to
 * leave a record that no longer exists, while the list stays where it is.
 */
export function DeleteLeadDialog({
  leadName,
  trigger,
  redirectTo,
}: {
  leadName: string;
  trigger: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm(event: React.MouseEvent) {
    // The primitive closes on click; hold it open so the pending state is seen.
    event.preventDefault();
    setPending(true);

    await fakeSubmit();

    setPending(false);
    setOpen(false);
    toast.success(`${leadName} foi excluído.`);

    if (redirectTo) router.push(redirectTo);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {leadName}?</AlertDialogTitle>
          <AlertDialogDescription>
            O lead e o histórico de atividades dele saem do workspace. Os
            negócios vinculados permanecem no pipeline. Esta ação não pode ser
            desfeita.
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
            Excluir lead
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
