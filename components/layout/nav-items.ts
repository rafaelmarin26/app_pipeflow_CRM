import {
  LayoutDashboard,
  Settings,
  SquareKanban,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Single source for the sidebar links and the topbar breadcrumb. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: SquareKanban },
  { href: "/settings", label: "Configurações", icon: Settings },
];

/** A section stays active on its child routes, e.g. /leads/[id]. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function currentNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
}

/** User profile fields the shell renders. Comes from auth.users in phase 3. */
export type ShellUser = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};
