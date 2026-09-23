"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { createWorkspaceFromSwitcher } from "@/app/(app)/(shell)/_actions";
import { Field, fieldAria } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";

/**
 * "Criar outro workspace" from the switcher, PLAN.md M15. The Admin Solo
 * persona (PRD) runs one workspace per client, so this has to stay reachable
 * without going back through onboarding.
 *
 * Controlled from outside, with no DialogTrigger of its own: it opens from a
 * DropdownMenuItem inside WorkspaceSwitcher's menu, and a Dialog nested
 * inside a DropdownMenuContent fights that primitive's own focus trap when it
 * owns its trigger.
 */
export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: WorkspaceInput) {
    const result = await createWorkspaceFromSwitcher(values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`${result.workspace.name} criado.`);
    onOpenChange(false);
    reset({ name: "" });
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) reset({ name: "" });
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo workspace</DialogTitle>
          <DialogDescription>
            Um espaço isolado para outra empresa ou outro time. Leads e negócios não se misturam
            entre workspaces.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field id="new-workspace-name" label="Nome" error={errors.name?.message}>
            <Input
              {...register("name")}
              {...fieldAria({ id: "new-workspace-name", error: errors.name?.message })}
              placeholder="Agência Norte"
              autoComplete="organization"
              autoFocus
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              Criar workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
