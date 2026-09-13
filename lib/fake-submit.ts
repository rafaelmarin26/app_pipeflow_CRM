/**
 * Stand-in for the round trip a Server Action will make, so the loading states of
 * the M5 screens are visible while the backend does not exist yet.
 *
 * M11 replaces every call site with a real action and deletes this file.
 */
export function fakeSubmit(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
