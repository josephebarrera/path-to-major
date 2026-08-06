"use client";

import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "~/lib/actions";
import { formatMajors } from "~/lib/majors";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppSidebar({
  intendedMajors,
  isAdmin,
}: {
  intendedMajors: string[];
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const majorLabel = formatMajors(intendedMajors);
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col border border-sidebar-border bg-sidebar p-4 md:flex">
      <Link href="/dashboard" className="p2m-app-brand flex items-center gap-2 px-2 py-2">
        <span className="p2m-app-logo h-8 w-8">
          <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M4 26 L12 18 L20 20 L28 6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="4" cy="26" r="2.3" fill="currentColor" />
            <circle cx="12" cy="18" r="2.3" fill="currentColor" />
            <circle cx="20" cy="20" r="2.3" fill="currentColor" />
            <circle cx="28" cy="6" r="3" fill="currentColor" />
          </svg>
        </span>
        PathToMajor
      </Link>
      <nav data-tour="sidebar-nav" className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p2m-app-nav-link flex items-center gap-3 px-3 py-2 text-sm ${
                active ? "is-active" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <Link
          href="/admin"
          className={`p2m-app-nav-link mt-2 flex items-center gap-3 px-3 py-2 text-sm ${
            adminActive ? "is-active" : ""
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </Link>
      )}
      <div className="mt-auto pt-4">
        {majorLabel ? (
          <div className="p2m-app-chip bg-foreground p-3 text-xs text-background">
            <div className="text-background/70">Pursuing</div>
            <div className="mt-0.5 font-medium text-background">{majorLabel}</div>
          </div>
        ) : (
          <Link
            href="/profile"
            className="flex items-center justify-center gap-1.5 border border-dashed border-sidebar-border p-3 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your intended major
          </Link>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = NAV.slice(0, 5);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-sidebar-border bg-sidebar py-2 md:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] ${
              active ? "font-medium text-foreground" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
