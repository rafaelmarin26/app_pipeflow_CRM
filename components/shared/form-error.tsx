/**
 * Form-level error banner, for messages that don't belong to one field — a
 * failed login, a signup rejected by Supabase, a workspace name that collided
 * server-side. `Field` (components/shared/field.tsx) stays the per-field one.
 */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-md border border-lost/30 bg-lost/10 px-3 py-2 text-sm text-lost-ink"
    >
      {message}
    </p>
  );
}
