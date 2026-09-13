import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Frame of the access screens — PLAN.md M5.
 *
 * Used by `app/(auth)/layout.tsx` and directly by the onboarding page, which sits
 * under `(app)` but cannot inherit the sidebar shell: it is the screen that runs
 * before any workspace exists for the sidebar to list.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <AuthBackdrop />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Brand href="/" className="mx-auto w-fit" />
        {children}
      </div>
    </div>
  );
}

/** The indigo to violet wash of CLAUDE.md §7, kept faint enough to read over. */
function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-canvas to-brand/8" />
      <div className="absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-linear-to-br from-primary/25 to-brand/25 blur-3xl" />
    </div>
  );
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div
        className={cn(
          "mt-6 rounded-lg border border-border bg-panel p-6 shadow-sm",
          className,
        )}
      >
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        ) : null}

        <div className="mt-6">{children}</div>
      </div>

      {footer ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
      ) : null}
    </>
  );
}
