"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Field, fieldAria } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fakeSubmit } from "@/lib/fake-submit";
import { ACTIVITY_TYPE_LABELS, activityTypeOptions } from "@/lib/labels";
import { activitySchema, type ActivityInput } from "@/lib/validations/activity";

/**
 * Register an activity on the lead — PLAN.md M6.
 *
 * Inline rather than in a dialog: logging a call is the most frequent thing
 * anyone does on this page, and a dialog would put a click in front of it.
 *
 * Still a fake submit — M12 turns `onSubmit` into the Server Action that stamps
 * `author_id` from the authenticated user and revalidates the route.
 */
export function ActivityForm({ leadName }: { leadName: string }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "call", description: "" },
  });

  async function onSubmit() {
    await fakeSubmit();

    toast.success(`Atividade registrada para ${leadName.split(" ")[0]}.`);
    reset({ type: "call", description: "" });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-lg border border-border bg-panel p-4"
    >
      <Field id="activity-type" label="Tipo" error={errors.type?.message}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                {...fieldAria({
                  id: "activity-type",
                  error: errors.type?.message,
                })}
                className="w-full sm:w-48"
              >
                {/* Explicit label: Radix only fills the trigger after mount, and
                    this form is server-rendered with the page. */}
                <SelectValue>{ACTIVITY_TYPE_LABELS[field.value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activityTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field
        id="activity-description"
        label="Descrição"
        error={errors.description?.message}
      >
        <Textarea
          {...register("description")}
          {...fieldAria({
            id: "activity-description",
            error: errors.description?.message,
          })}
          rows={3}
          placeholder="O que aconteceu nesta interação?"
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : null}
          Registrar atividade
        </Button>
      </div>
    </form>
  );
}
