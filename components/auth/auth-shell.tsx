import { Brand } from "@/components/layout/brand";
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

      <div className="w-full max-w-md">
        <Brand href="/" className="mx-auto w-fit" />
        {children}
      </div>
    </div>
  );
}

/**
 * A modular grid, not a glow — CLAUDE.md §7.
 *
 * v1 put a blurred indigo orb behind these screens; v2 rules that out along with
 * the rest of the neon vocabulary. The structure the brand leans on instead is
 * the grid itself, drawn in hairlines and faded out at the edges so it reads as
 * paper stock rather than as a background image.
 */
function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(70% 55% at 50% 40%, #000 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 55% at 50% 40%, #000 0%, transparent 100%)",
        }}
      />
      {/* One accent hairline across the top — the single flourish allowed. */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/40 to-transparent" />
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
        <h1 className="display-md text-xl">{title}</h1>
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
