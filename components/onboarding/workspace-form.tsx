"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { fakeSubmit } from "@/lib/fake-submit";
import { slugify } from "@/lib/utils";
import {
  workspaceSchema,
  type WorkspaceInput,
} from "@/lib/validations/workspace";

/**
 * Single step of onboarding — PLAN.md M5: name the first workspace. The slug is
 * derived from the name rather than asked for, because it is an implementation
 * detail the user should never have to think about.
 *
 * M11 replaces `fakeSubmit` with the action that creates the workspace and the
 * admin membership for real.
 */
export function WorkspaceForm() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

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
  const pending = isSubmitting || redirecting;

  async function onSubmit(values: WorkspaceInput) {
    await fakeSubmit();
    setRedirecting(true);
    toast.success(`Workspace ${values.name} criado.`);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

      <SubmitButton pending={pending} pendingLabel="Criando workspace...">
        Criar workspace
      </SubmitButton>
    </form>
  );
}
