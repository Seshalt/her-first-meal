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
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(to: string) {
    return to === "/app" ? pathname === "/app" : pathname.startsWith(to);
  }

  const onHero = !scrolled && !open;
  const ink = onHero ? "text-paper" : "text-foreground";

  return (
    <div className="min-h-dvh bg-background">
      <NoIndex />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-[background-color,border-color,color] duration-300",
          onHero
            ? "border-b border-transparent bg-gradient-to-b from-ink/55 to-transparent"
            : "border-b border-border/70 bg-background/95 text-foreground backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-[4.75rem] md:px-6">
          <Wordmark to="/app" className={cn("min-w-0", ink)} />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Member">
            {PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  onHero ? "text-paper/80 hover:text-paper" : "text-muted-foreground hover:text-foreground",
                  isActive(item.to) && (onHero ? "text-paper" : "text-foreground"),
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/app/profile"
              className={cn(
                "hidden h-11 items-center px-2 text-sm underline-offset-4 hover:underline sm:inline-flex",
                ink,
              )}
            >
              Profile
            </Link>
            <button
              type="button"
              className={cn("grid size-12 place-items-center rounded-full", ink)}
              aria-label={open ? "Close house" : "Open house"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background">
          <div className="flex h-16 items-center justify-between px-4 md:h-[4.75rem] md:px-6">
            <Wordmark to="/app" />
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
                          "block py-2 font-display text-4xl leading-[1.05] md:text-5xl",
                          isActive(item.to) ? "text-sea italic" : "text-foreground",
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
                <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm text-primary">
                  Owner atelier
                </Link>
              ) : null}
              <p className="truncate text-xs text-muted-foreground">{user?.displayName ?? user?.primaryEmail}</p>
            </div>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut("/").catch(() => setSigningOut(false));
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}

      <main className="min-w-0" aria-hidden={open || undefined}>{children}</main>

      <nav
        className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/90 px-1 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
        aria-label="Primary mobile"
      >
        {MOBILE_PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 text-[10px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
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
