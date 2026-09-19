import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/**
 * Public shell — PLAN.md M3.
 *
 * Sibling of `(app)`, with no sidebar and no session: everything under this
 * group is readable by someone who has never logged in.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      {/*
        Sections below the fold start at `opacity: 0` and are revealed by an
        Intersection Observer. With scripting off no observer ever runs, so the
        rule that hides them has to be lifted — otherwise the page renders blank
        to a reader without JavaScript, and to any crawler that does not execute
        it.
      */}
      <noscript>
        <style>{"[data-reveal]{opacity:1 !important}"}</style>
      </noscript>

      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
