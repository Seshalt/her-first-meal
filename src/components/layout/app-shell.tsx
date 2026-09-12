import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Apple,
  Calendar,
  HeartHandshake,
  Home,
  Library,
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
import { NoIndex } from "@/components/security/noindex";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMyRole } from "@/lib/server/admin";
import { cn } from "@/lib/utils";

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

const GROUPS: { label: string; tone: string; items: { to: RoomTo; label: string; icon: typeof Home }[] }[] = [
  {
    label: "Today",
    tone: "text-sea",
    items: [
      { to: "/app", label: "Today", icon: Home },
      { to: "/app/journey", label: "Journey", icon: StretchHorizontal },
    ],
  },
  {
    label: "Nourish",
    tone: "text-clay",
    items: [
      { to: "/app/meals", label: "Meals", icon: UtensilsCrossed },
      { to: "/app/grocery", label: "Grocery", icon: Apple },
      { to: "/app/pantry", label: "Pantry", icon: Warehouse },
    ],
  },
  {
    label: "Care",
    tone: "text-blush",
    items: [
      { to: "/app/binding", label: "Binding", icon: HeartHandshake },
      { to: "/app/move", label: "Move", icon: StretchHorizontal },
      { to: "/app/nouri", label: "Nouri", icon: Sparkles },
      { to: "/app/appointments", label: "Appointments", icon: Calendar },
    ],
  },
  {
    label: "House",
    tone: "text-plum",
    items: [
      { to: "/app/resources", label: "Resources", icon: Library },
      { to: "/app/store", label: "Meeting", icon: ShoppingBag },
      { to: "/app/partner", label: "Partner", icon: HeartHandshake },
      { to: "/app/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const PRIMARY: { to: RoomTo; label: string }[] = [
  { to: "/app", label: "Today" },
  { to: "/app/meals", label: "Meals" },
  { to: "/app/binding", label: "Binding" },
  { to: "/app/nouri", label: "Nouri" },
];

const FLAT = GROUPS.flatMap((g) => g.items);
const MOBILE_PRIMARY = [FLAT[0], FLAT[2], FLAT[5], FLAT[7], FLAT[12]];

export function AppShell({ children, hideNouri = false }: { children: ReactNode; hideNouri?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();
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

  const dockIndex = Math.max(
    0,
    MOBILE_PRIMARY.findIndex((item) => isActive(item.to)),
  );

  return (
    <div className="house-root min-h-dvh">
      <NoIndex />
      <header className="house-roof">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-[4.75rem] md:px-6">
          <Wordmark to="/app" mark className="min-w-0" />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Member">
            {PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative py-2 text-sm tracking-wide transition-colors",
                  isActive(item.to) ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {item.label}
                <span className={cn("house-nav-dot", isActive(item.to) && "is-on")} />
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/app/profile"
              className="hidden h-11 items-center px-2 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline sm:inline-flex"
            >
              Profile
            </Link>
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full text-ink"
              aria-label={open ? "Close house" : "Open house"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="house-map">
          <div className="flex h-16 items-center justify-between px-4 md:h-[4.75rem] md:px-6">
            <Wordmark to="/app" mark />
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full"
              aria-label="Close house"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-5xl flex-1 overflow-y-auto px-5 pb-24 pt-6 md:px-10" aria-label="House">
            <div className="grid w-full gap-12 md:grid-cols-2">
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <p className={`text-xs uppercase tracking-[0.32em] ${group.tone}`}>{group.label}</p>
                  <div className="editorial-rule mt-4" />
                  <div className="mt-6 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block py-2 font-display text-4xl leading-[1.05] transition-colors md:text-5xl",
                          isActive(item.to) ? "text-sea italic" : "text-ink hover:text-sea",
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 pb-8 md:px-10">
            <div>
              {isAdmin ? (
                <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm text-sea">
                  Owner atelier
                </Link>
              ) : null}
              <p className="truncate text-xs text-ink-soft">{user?.displayName ?? user?.primaryEmail}</p>
            </div>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut("/").catch(() => setSigningOut(false));
              }}
              className="text-sm text-ink-soft hover:text-ink"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}

      <main className="min-w-0" aria-hidden={open || undefined}>
        {children}
      </main>

      <nav className="house-dock md:hidden" aria-label="Primary mobile">
        <span
          className="house-dock-pill"
          style={{ transform: `translateX(${dockIndex * 100}%)` }}
          aria-hidden
        />
        {MOBILE_PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn("house-dock-item", active && "is-on")}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {hideNouri ? null : <NouriFab />}
    </div>
  );
}
