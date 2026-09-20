import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require a session. Matched against `request.nextUrl.pathname`,
 * which is the URL path — the `(app)`/`(shell)` route groups around them in
 * `app/` never appear here, since groups do not change the URL (CLAUDE.md §3).
 */
const PROTECTED_PATHS = ["/dashboard", "/leads", "/pipeline", "/settings", "/onboarding"];

/** Screens that make no sense once a session already exists. */
const GUEST_ONLY_PATHS = ["/login", "/signup"];

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Refreshes the Supabase session on every request and guards the protected
 * area. This is the only place `getUser()` runs on a schedule instead of on
 * demand — CLAUDE.md §5: middleware complements RLS, it does not replace it,
 * so every Server Action and Server Component still authorizes itself too.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getUser(): anything that
  // touches the response before the session is known can drop the refreshed
  // cookies, which silently logs users out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // A redirect response replaces `supabaseResponse` outright, so any cookies
  // getUser() just refreshed onto it (a rotated refresh token, e.g.) have to
  // be copied across by hand — otherwise the redirect ships the stale
  // session and the next request can find it already invalidated.
  function redirectWithRefreshedCookies(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (!user && matchesPath(pathname, PROTECTED_PATHS)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return redirectWithRefreshedCookies(redirectUrl);
  }

  if (user && matchesPath(pathname, GUEST_ONLY_PATHS)) {
    return redirectWithRefreshedCookies(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
