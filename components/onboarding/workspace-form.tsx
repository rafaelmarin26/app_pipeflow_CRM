"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createWorkspace } from "@/app/(app)/onboarding/_actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { FormError } from "@/components/shared/form-error";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import {
  workspaceSchema,
  type WorkspaceInput,
} from "@/lib/validations/workspace";

/**
 * Single step of onboarding — PLAN.md M5/M11: name the first workspace. The
 * slug is derived from the name rather than asked for, because it is an
 * implementation detail the user should never have to think about.
 *
 * `createWorkspace` creates the workspace and the admin membership for real
 * and redirects to the dashboard itself on success.
 */
export function WorkspaceForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "" },
  });

  const slug = slugify(watch("name"));

  async function onSubmit(values: WorkspaceInput) {
    setFormError(null);
    const result = await createWorkspace(values);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={formError} />

      <Field
        id="name"
        label="Nome do workspace"
        error={errors.name?.message}
        hint={
          <>
            Endereço:{" "}
            <span className="font-medium text-foreground">
              pipeflow.app/{slug || "seu-workspace"}
            </span>
          </>
        }
      >
        <Input
          {...register("name")}
          {...fieldAria({ id: "name", error: errors.name?.message, hint: true })}
          autoComplete="organization"
          placeholder="Agência Norte"
          autoFocus
        />
      </Field>

      <SubmitButton pending={isSubmitting} pendingLabel="Criando workspace...">
        Criar workspace
      </SubmitButton>
    </form>
  );
}
