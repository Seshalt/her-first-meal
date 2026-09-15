import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NoIndex } from "@/components/security/noindex";
import { signOut } from "@/lib/auth/client";
import { clearOwnerToken } from "@/lib/session-ready";
import { setWalkMode } from "@/lib/preview-mode";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/preview", label: "Website" },
  { to: "/admin/landing", label: "Website advanced" },
  { to: "/admin/ai", label: "Letters" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/nouri", label: "Season notes" },
  { to: "/admin/business", label: "Business" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/launch", label: "Launch list" },
] as const;

function openMemberFlow() {
  setWalkMode("member");
  window.location.assign("/pricing?preview=1");
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-[#101918] text-[#efe6d6]">
      <NoIndex />
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 md:block">
          <div className="px-4 py-5">
            <Wordmark to="/admin" className="text-[#efe6d6]" />
            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/50">Owner atelier</p>
          </div>
          <nav className="space-y-1 px-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm",
                  (n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to))
                    ? "bg-white/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 px-3">
            <button
              type="button"
              className="w-full rounded-xl border border-[#d3a34d]/35 bg-[#d3a34d]/8 px-3 py-2.5 text-left text-sm text-[#efc56d] hover:bg-[#d3a34d]/14"
              onClick={openMemberFlow}
            >
              Preview member flow
            </button>
          </div>
          <div className="mt-8 px-4">
            <ThemeToggle />
            <button
              type="button"
              className="mt-4 text-xs text-white/50 hover:text-white"
              onClick={() => {
                clearOwnerToken();
                void signOut("/");
              }}
            >
              Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex gap-2 overflow-x-auto border-b border-white/10 px-3 py-3 md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="shrink-0 rounded-full bg-white/8 px-3 py-2 text-xs">
                {n.label}
              </Link>
            ))}
            <button
              type="button"
              className="shrink-0 rounded-full border border-[#d3a34d]/30 px-3 py-2 text-xs text-[#efc56d]"
              onClick={openMemberFlow}
            >
              Member flow
            </button>
          </header>
          <main className="px-4 py-8 md:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
