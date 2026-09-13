"use client";

import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The single primary action of an access screen (CLAUDE.md §7): full width, and
 * locked while the request is in flight so a double click cannot submit twice.
 */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
