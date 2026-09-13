import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label, control, hint and error message as one block, with the aria wiring that
 * screen readers need. Built here rather than inside the auth forms because the
 * lead and deal dialogs of M6 and M7 need exactly the same shape.
 *
 * The control stays the caller's responsibility — spread `fieldAria()` onto it so
 * the ids match the markup below.
 */
export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>

      {children}

      {hint ? (
        <div id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </div>
      ) : null}

      {error ? (
        <p
          id={`${id}-error`}
          // Announced as it appears: validation runs on submit, by which point
          // focus has already left the field that failed.
          role="alert"
          className="text-xs text-lost-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Props that tie a control to its <Field> label, hint and error message. */
export function fieldAria({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: boolean;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy || undefined,
  } as const;
}
