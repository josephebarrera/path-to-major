"use client";

import {
  Compass,
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

  return (
    <aside className="aurora-sidebar sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col p-4 md:flex">
      <Link
        href="/dashboard"
        className="relative z-10 flex items-center gap-2 px-2 py-2 text-base font-semibold text-white"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur">
          <Compass className="h-4 w-4" />
        </span>
        PathToMajor
      </Link>
      <nav className="relative z-10 mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white font-medium text-neutral-900 shadow-md"
                  : "text-white/75 hover:bg-white/15 hover:text-white"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${active ? "text-blue-600" : "text-white/75"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <Link
          href="/admin"
          className={`relative z-10 mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
            pathname === "/admin" || pathname.startsWith("/admin/")
              ? "bg-white font-medium text-neutral-900 shadow-md"
              : "text-white/75 hover:bg-white/15 hover:text-white"
          }`}
        >
          <ShieldCheck
            className={`h-4 w-4 ${
              pathname === "/admin" || pathname.startsWith("/admin/")
                ? "text-blue-600"
                : "text-white/75"
            }`}
          />
          Admin
        </Link>
      )}
      <div className="relative z-10 mt-auto pt-4">
        {majorLabel ? (
          <div className="rounded-xl border border-white/30 bg-white/15 p-3 text-xs backdrop-blur">
            <div className="text-white/70">Pursuing</div>
            <div className="mt-0.5 font-medium text-white">{majorLabel}</div>
          </div>
        ) : (
          <Link
            href="/profile"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/30 bg-white/10 p-3 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your intended major
          </Link>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/15 hover:text-white"
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
    <div className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 py-2 md:hidden">
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
