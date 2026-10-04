import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

/**
 * Exchanges a Supabase auth `code` for a session. Kept for any flow that
 * still uses the PKCE code-exchange redirect (OAuth providers, if added
 * later) — signup confirmation moved to `/confirmar` (PLAN.md M17), which
 * verifies a `token_hash` behind a real button click instead of a bare GET,
 * because GoTrue's `/verify` endpoint auto-consumes the one-time token on
 * the first request that hits it. Gmail and corporate mail scanners
 * pre-fetch links to scan them for safety before the user ever opens the
 * message, so this route — reached via a link that performs the stateful
 * exchange on page load — was found live to let Google's own prefetch beat
 * the real user to the link, burning the token before they could click it.
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
