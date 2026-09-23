import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { ShellUser } from "@/components/layout/nav-items";
import { slugify } from "@/lib/utils";
import type { Database, MemberRole, Workspace } from "@/types/database";

const POSTGRES_UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 5;

/**
 * Cookie that remembers the workspace the user picked in the switcher. M15
 * "trocando de contexto de verdade, com a escolha persistida" builds on top of
 * this same cookie — this milestone only introduces it and reads it back.
 */
export const ACTIVE_WORKSPACE_COOKIE = "pf-active-workspace";

const ACTIVE_WORKSPACE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export type WorkspaceMembership = {
  workspace: Workspace;
  role: MemberRole;
};

/**
 * Every workspace the user belongs to, oldest first — so "the first one" is a
 * stable, deterministic fallback when there is no cookie yet (e.g. right after
 * signup, before onboarding ever runs, or a cookie that outlived its workspace).
 */
export async function getUserMemberships(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<WorkspaceMembership[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data
    .filter((row): row is typeof row & { workspace: Workspace } => row.workspace !== null)
    .map((row) => ({ workspace: row.workspace, role: row.role }));
}

/** Picks the cookie's workspace if the user still belongs to it, else the oldest one. */
export function resolveActiveMembership(
  memberships: WorkspaceMembership[],
  cookieWorkspaceId: string | undefined,
): WorkspaceMembership | null {
  if (memberships.length === 0) return null;

  const fromCookie = cookieWorkspaceId
    ? memberships.find((m) => m.workspace.id === cookieWorkspaceId)
    : undefined;

  return fromCookie ?? memberships[0];
}

function toShellUser(user: User): ShellUser {
  const name =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email ||
    "Usuário";

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    avatar_url:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
      null,
  };
}

export type ShellData =
  | { status: "unauthenticated" }
  | { status: "no-workspace" }
  | {
      status: "ready";
      user: ShellUser;
      memberships: WorkspaceMembership[];
      active: WorkspaceMembership;
    };

/**
 * Everything `app/(app)/(shell)/layout.tsx` needs, resolved on the server —
 * PLAN.md M11: "Workspace ativo resolvido no servidor e propagado pelo
 * layout." The three outcomes are kept distinct instead of collapsing to
 * `null` so the caller redirects to `/login` or `/onboarding` correctly; the
 * middleware already blocks a signed-out request from getting this far, but
 * CLAUDE.md §5 has this layer check for itself too rather than trust that.
 */
export async function getShellData(supabase: SupabaseClient<Database>): Promise<ShellData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const memberships = await getUserMemberships(supabase, user.id);
  if (memberships.length === 0) return { status: "no-workspace" };

  const cookieStore = await cookies();
  const active = resolveActiveMembership(
    memberships,
    cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value,
  );

  if (!active) return { status: "no-workspace" };

  return { status: "ready", user: toShellUser(user), memberships, active };
}

/**
 * Where to send the user right after `login`/`signup` succeeds, setting the
 * active-workspace cookie along the way so the shell layout's first render
 * already agrees with it — used by the login Server Action. Signup always
 * goes to onboarding instead: a brand new account never has a membership yet.
 */
export async function resolvePostLoginRedirect(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const memberships = await getUserMemberships(supabase, userId);
  if (memberships.length === 0) return "/onboarding";

  const cookieStore = await cookies();
  const active = resolveActiveMembership(
    memberships,
    cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value,
  );

  if (active) {
    cookieStore.set(ACTIVE_WORKSPACE_COOKIE, active.workspace.id, ACTIVE_WORKSPACE_COOKIE_OPTIONS);
  }

  return "/dashboard";
}

export async function setActiveWorkspaceCookie(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, ACTIVE_WORKSPACE_COOKIE_OPTIONS);
}

export type WorkspaceContext = {
  user: User;
  workspace: Workspace;
  role: MemberRole;
};

/**
 * The "autenticar → resolver workspace ativo" opening of CLAUDE.md §3, shared
 * by every mutation in `leads/_actions.ts` and `pipeline/_actions.ts` (M12,
 * M13) so that order is written once instead of copied into each action.
 * `null` means the caller has no authenticated session or no membership in
 * the cookie's workspace — either way the action has nothing to do and the
 * caller redirects to `/login`.
 */
export async function requireWorkspaceContext(
  supabase: SupabaseClient<Database>,
): Promise<WorkspaceContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const memberships = await getUserMemberships(supabase, user.id);
  const cookieStore = await cookies();
  const active = resolveActiveMembership(
    memberships,
    cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value,
  );
  if (!active) return null;

  return { user, workspace: active.workspace, role: active.role };
}

/**
 * Creates a workspace and its founding admin membership through
 * `create_workspace_with_owner()` (M10) — the only path onto that first
 * `workspace_members` row, since the insert policy requires the caller to
 * already belong to the workspace. Shared by the M11 onboarding action and
 * the M15 "criar outro workspace" action in the switcher, so the slug-retry
 * loop is written once.
 */
export async function createWorkspaceWithOwner(
  supabase: SupabaseClient<Database>,
  name: string,
): Promise<{ workspace: Workspace } | { error: string }> {
  const baseSlug = slugify(name) || "workspace";

  // The slug is derived from the name and the column is unique, so two
  // workspaces named the same thing need a fallback rather than a raw
  // constraint error.
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const { data: workspace, error } = await supabase.rpc("create_workspace_with_owner", {
      workspace_name: name,
      workspace_slug: slug,
    });

    if (!error && workspace) return { workspace };

    if (error && error.code !== POSTGRES_UNIQUE_VIOLATION) {
      return { error: "Não foi possível criar o workspace. Tente novamente." };
    }
  }

  return { error: "Já existe um workspace com um endereço parecido. Tente outro nome." };
}
