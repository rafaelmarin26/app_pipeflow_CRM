import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Only a same-origin, relative path is a safe redirect target. `next` comes
 * straight off the query string of a public URL, so it is attacker-editable —
 * a value like `@evil.com` turns `${origin}${next}` into
 * `https://app.example.com@evil.com`, which browsers parse as host
 * `evil.com` with `app.example.com` as userinfo (the classic "@" open
 * redirect trick). Requiring exactly one leading slash rules that out along
 * with the protocol-relative `//evil.com` variant, since neither can smuggle
 * a scheme or host past this check.
 */
function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

/**
 * Exchanges the Supabase auth `code` for a session — PLAN.md M11. Every flow
 * that redirects a user back from an e-mail link (signup confirmation today,
 * password recovery and invite acceptance later) lands here first; `next`
 * says where to send them once the session exists.
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
