import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { usePublicSite } from "@/lib/use-public-site";
import { publicHttpUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PublicNav({ overlay = false }: { overlay?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { site } = usePublicSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    { to: "/about" as const, label: site.navAbout },
    { to: "/belly-binding" as const, label: site.navBinding },
    { to: "/nouri" as const, label: site.navNouri },
    { to: "/pricing" as const, label: site.navMembership },
    { to: "/contact" as const, label: site.contactNav },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const t = Math.min(1, Math.max(0, window.scrollY / max));
      const stops = [
        [42, 117, 108],
        [212, 162, 74],
        [193, 107, 120],
        [93, 74, 114],
        [42, 117, 108],
      ];
      const pos = t * (stops.length - 1);
      const i = Math.min(stops.length - 2, Math.floor(pos));
      const f = pos - i;
      const mix = (a: number[], b: number[]) =>
        a.map((n, idx) => Math.round(n + (b[idx]! - n) * f)) as number[];
      const c1 = mix(stops[i]!, stops[i + 1]!);
      const c2 = mix(stops[Math.min(stops.length - 2, i + 1)]!, stops[Math.min(stops.length - 1, i + 2)]!);
      const header = document.querySelector<HTMLElement>("[data-site-nav]");
      if (!header) return;
      header.style.setProperty("--nav-a", `rgba(${c1.join(",")},0.42)`);
      header.style.setProperty("--nav-b", `rgba(${c2.join(",")},0.28)`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onHero = overlay && !scrolled && !open;
  const ink = onHero ? "text-paper" : "text-foreground";

  return (
    <header
      data-site-nav
      className={cn(
        overlay ? "fixed inset-x-0 top-0 z-[80]" : "sticky top-0 z-[80]",
        "transition-[background,box-shadow,border-color,color] duration-700 ease-out",
        onHero
          ? "nav-liquid-glass nav-liquid-glass-thin border-b border-white/15 text-paper"
          : "nav-liquid-glass border-b border-white/35 text-foreground",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 md:h-[5.25rem] md:px-6">
        <Wordmark className={cn("min-w-0", ink)} />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm tracking-wide transition-colors",
                onHero ? "text-paper/80 hover:text-paper" : "text-muted-foreground hover:text-foreground",
                pathname === l.to && (onHero ? "text-paper" : "text-foreground"),
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <SignedOut>
            <Link
              to="/login"
              search={{}}
              className={cn(
                "inline-flex h-11 items-center px-2 text-sm underline-offset-4 hover:underline sm:px-3",
                ink,
              )}
            >
              {site.navSignIn}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              to="/app"
              className={cn(
                "inline-flex h-11 items-center px-2 text-sm underline-offset-4 hover:underline sm:px-3",
                ink,
              )}
            >
              {site.navHome}
            </Link>
          </SignedIn>
          <Link
            to="/pricing"
            className={cn(
              "hidden h-11 items-center rounded-full px-5 text-sm font-medium sm:inline-flex",
              onHero ? "bg-paper text-ink hover:bg-cream" : "bg-primary text-primary-foreground hover:bg-sea-deep",
            )}
          >
            {site.navCta}
          </Link>
          <button
            type="button"
            className={cn(
              "relative z-[90] grid size-12 place-items-center rounded-full lg:hidden",
              ink,
            )}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background text-foreground">
          <div className="flex h-16 items-center justify-between px-4">
            <Wordmark />
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="size-6" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-10 pt-6" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-4 font-display text-3xl"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-primary px-5 py-4 text-center text-base font-medium text-primary-foreground"
            >
              {site.navCta}
            </Link>
            <SignedOut>
              <Link to="/login" search={{}} onClick={() => setOpen(false)} className="mt-2 rounded-2xl px-3 py-4 text-lg">
                {site.navSignIn}
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/app" onClick={() => setOpen(false)} className="mt-2 rounded-2xl px-3 py-4 text-lg">
                {site.navHome}
              </Link>
            </SignedIn>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function PublicFooter() {
  const { site, content } = usePublicSite();
  const instagram = publicHttpUrl(site.instagramUrl);
  const tiktok = publicHttpUrl(site.tiktokUrl);
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_280px_at_10%_0%,rgba(212,162,74,0.12),transparent_60%),radial-gradient(640px_240px_at_90%_100%,rgba(42,117,108,0.16),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Wordmark stacked className="text-paper" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/70">
            {content.headlineAccent} {site.footerBlurb}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{site.footerVisit}</p>
          <ul className="mt-4 space-y-3 text-sm text-paper/80">
            <li>
              <Link to="/about">{site.footerStory}</Link>
            </li>
            <li>
              <Link to="/belly-binding">{site.footerStudio}</Link>
            </li>
            <li>
              <Link to="/nouri">{site.footerNouri}</Link>
            </li>
            <li>
              <Link to="/pricing">{site.footerMembership}</Link>
            </li>
            <li>
              <Link to="/contact">{site.footerContact}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{site.footerConnect}</p>
          <ul className="mt-4 space-y-3 text-sm text-paper/80">
            {instagram ? (
              <li>
                <a href={instagram} target="_blank" rel="noreferrer">
                  {site.instagramLabel}
                </a>
              </li>
            ) : null}
            {tiktok ? (
              <li>
                <a href={tiktok} target="_blank" rel="noreferrer">
                  {site.tiktokLabel}
                </a>
              </li>
            ) : null}
            <li>
              <Link to="/contact">{site.footerContact}</Link>
            </li>
            <li>
              <Link to="/login" search={{}}>
                {site.footerSignIn}
              </Link>
            </li>
            <li>
              <Link to="/privacy">{site.footerPrivacy}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-4 py-6 text-center text-xs text-paper/50">
        <p>{site.footerCopyright}</p>
        <p className="mt-2">{site.footerLegal}</p>
      </div>
    </footer>
  );
}
