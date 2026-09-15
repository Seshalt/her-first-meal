import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Apple,
  Calendar,
  HeartHandshake,
  Home,
  Library,
  Mail,
  Menu,
  ShoppingBag,
  Sparkles,
  StretchHorizontal,
  UserRound,
  UtensilsCrossed,
  Warehouse,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { NouriFab } from "@/components/nouri/nouri-panel";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { NoIndex } from "@/components/security/noindex";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMyRole } from "@/lib/server/admin";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

type RoomTo =
  | "/app"
  | "/app/journey"
  | "/app/meals"
  | "/app/grocery"
  | "/app/pantry"
  | "/app/binding"
  | "/app/move"
  | "/app/appointments"
  | "/app/nouri"
  | "/app/resources"
  | "/app/store"
  | "/app/partner"
  | "/app/profile";

type RoomItem = { to: RoomTo; label: string; icon: typeof Home };

const GROUPS: { label: string; items: RoomItem[] }[] = [
  {
    label: "Your day",
    items: [
      { to: "/app", label: "Today", icon: Home },
      { to: "/app/journey", label: "Journey", icon: StretchHorizontal },
      { to: "/app/resources", label: "Daily readings", icon: Sparkles },
    ],
  },
  {
    label: "Nourish",
    items: [
      { to: "/app/meals", label: "Meals", icon: UtensilsCrossed },
      { to: "/app/grocery", label: "Grocery", icon: Apple },
      { to: "/app/pantry", label: "Pantry", icon: Warehouse },
    ],
  },
  {
    label: "Care",
    items: [
      { to: "/app/binding", label: "Belly binding", icon: HeartHandshake },
      { to: "/app/move", label: "Movement", icon: StretchHorizontal },
      { to: "/app/appointments", label: "Appointments", icon: Calendar },
      { to: "/app/nouri", label: "Support", icon: Mail },
    ],
  },
  {
    label: "Your house",
    items: [
      { to: "/app/partner", label: "Partner", icon: HeartHandshake },
      { to: "/app/store", label: "Private meeting", icon: ShoppingBag },
      { to: "/app/profile", label: "Settings", icon: UserRound },
    ],
  },
];

const PRIMARY: RoomItem[] = [
  { to: "/app", label: "Today", icon: Home },
  { to: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { to: "/app/grocery", label: "Grocery", icon: Apple },
  { to: "/app/journey", label: "Journey", icon: StretchHorizontal },
  { to: "/app/resources", label: "Readings", icon: Library },
];

const MOBILE_PRIMARY: RoomItem[] = [
  { to: "/app", label: "Today", icon: Home },
  { to: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { to: "/app/grocery", label: "Grocery", icon: Apple },
  { to: "/app/resources", label: "Read", icon: Library },
  { to: "/app/profile", label: "You", icon: UserRound },
];

export function AppShell({ children, hideNouri = false }: { children: ReactNode; hideNouri?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    void getMyRole()
      .then((r) => setIsAdmin(r.role === "admin"))
      .catch(() => setIsAdmin(false));
  }, [user?.id]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(to: string) {
    return to === "/app" ? pathname === "/app" : pathname.startsWith(to);
  }

  return (
    <div className="member-shell">
      <NoIndex />
      <header className="member-topbar">
        <div className="mx-auto flex h-[4.65rem] max-w-[86rem] items-center justify-between gap-3 px-4 md:px-7">
          <Wordmark to="/app" className="min-w-0 text-[var(--member-text)]" />

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Member">
            {PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn("member-nav-link", isActive(item.to) && "is-active")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <LocaleSwitch tone="ink" className="hidden lg:inline-flex" />
            <Link to="/app/profile" className="member-profile-link hidden items-center px-3 text-sm sm:inline-flex">
              {user?.displayName?.split(" ")[0] ?? t("room.profile")}
            </Link>
            <button
              type="button"
              className="member-menu-button grid size-11 place-items-center"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="member-map">
          <div className="mx-auto flex h-[4.65rem] w-full max-w-[86rem] items-center justify-between px-4 md:px-7">
            <Wordmark to="/app" className="text-[var(--member-text)]" />
            <button
              type="button"
              className="member-menu-button grid size-11 place-items-center"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="mx-auto w-full max-w-[86rem] flex-1 overflow-y-auto px-5 pb-20 pt-6 md:px-8" aria-label="All member rooms">
            <div className="grid gap-x-16 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
              {GROUPS.map((group) => (
                <section key={group.label} className="member-menu-group">
                  <p className="member-menu-title text-[11px] font-semibold uppercase tracking-[0.24em]">{group.label}</p>
                  <div className="mt-5">
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn("member-menu-link", isActive(item.to) && "is-active")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </nav>

          <div className="mx-auto flex w-full max-w-[86rem] items-center justify-between gap-4 border-t border-[var(--member-line)] px-5 py-5 md:px-8">
            <div className="min-w-0">
              {isAdmin ? (
                <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm font-semibold text-[var(--member-teal)]">
                  Owner atelier
                </Link>
              ) : null}
              <p className="truncate text-xs text-[var(--member-muted)]">{user?.primaryEmail}</p>
            </div>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut("/").catch(() => setSigningOut(false));
              }}
              className="min-h-11 rounded-full border border-[var(--member-line)] px-4 text-sm text-[var(--member-text)] transition hover:bg-[var(--member-surface-2)] active:scale-95 disabled:opacity-50"
            >
              {signingOut ? t("signingOut") : t("signOut")}
            </button>
          </div>
        </div>
      ) : null}

      <main className="min-w-0" aria-hidden={open || undefined}>
        {children}
      </main>

      <nav className="member-mobile-dock md:hidden" aria-label="Primary mobile">
        {MOBILE_PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link key={item.to} to={item.to} className={cn("member-mobile-item", active && "is-active")}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {hideNouri ? null : <NouriFab />}
    </div>
  );
}
