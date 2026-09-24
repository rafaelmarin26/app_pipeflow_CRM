import Stripe from "stripe";

let client: Stripe | undefined;

/**
 * Server-only Stripe client — CLAUDE.md §5: `STRIPE_SECRET_KEY` never reaches a
 * Client Component or a `NEXT_PUBLIC_*` variable. Created on first use so a
 * missing key fails the one request that needs Stripe, not every page that
 * happens to import this module.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}
