/**
 * Only a same-origin, relative path is a safe redirect target. `next` comes
 * straight off the query string of a public URL, so it is attacker-editable —
 * a value like `@evil.com` turns `${origin}${next}` into
 * `https://app.example.com@evil.com`, which browsers parse as host
 * `evil.com` with `app.example.com` as userinfo (the classic "@" open
 * redirect trick). Requiring exactly one leading slash rules that out along
 * with the protocol-relative `//evil.com` variant, since neither can smuggle
 * a scheme or host past this check.
 *
 * Shared by `/callback` (code exchange) and `/confirmar` (token_hash
 * exchange) — both land a user back from an e-mail link with an
 * attacker-editable `next`.
 */
export function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}
