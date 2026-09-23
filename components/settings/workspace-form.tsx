"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { updateWorkspaceName } from "@/app/(app)/(shell)/settings/_actions";
import { Field, fieldAria } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";
import type { Workspace } from "@/types/database";

/** Rename the workspace — PLAN.md M9, Admin only (the page already gated this). */
export function WorkspaceForm({ workspace }: { workspace: Workspace }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: workspace.name },
  });

  async function onSubmit(values: WorkspaceInput) {
    const result = await updateWorkspaceName(values);
    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace atualizado.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Nome e endereço do seu workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field id="workspace-name" label="Nome" error={errors.name?.message}>
            <Input
              {...register("name")}
              {...fieldAria({ id: "workspace-name", error: errors.name?.message })}
              autoComplete="organization"
            />
          </Field>

          <Field
            id="workspace-slug"
            label="Endereço"
            hint="Derivado do nome quando o workspace foi criado; não muda sozinho ao renomear."
          >
            <Input id="workspace-slug" value={workspace.slug} disabled readOnly />
          </Field>

          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
