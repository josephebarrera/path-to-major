"use client";

import {
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings as SettingsIcon,
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

export function AppSidebar({ intendedMajors }: { intendedMajors: string[] }) {
  const pathname = usePathname();
  const majorLabel = formatMajors(intendedMajors);

  return (
    <aside className="glass-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col p-4 md:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-2 py-2 text-base font-semibold"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" />
        </span>
        PathToMajor
      </Link>
      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/80 font-medium text-foreground shadow-sm dark:bg-white/10"
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        {majorLabel && (
          <div className="rounded-xl border border-white/60 bg-white/40 p-3 text-xs dark:border-white/10 dark:bg-white/5">
            <div className="text-muted-foreground">Pursuing</div>
            <div className="mt-0.5 font-medium">{majorLabel}</div>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
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
    <div className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/40 py-2 md:hidden dark:border-white/10">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] ${
              active ? "text-foreground" : "text-muted-foreground"
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
