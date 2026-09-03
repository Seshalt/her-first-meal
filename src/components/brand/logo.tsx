import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";

export const HOUSE_MARK = "/images/logos/mark-hfm.png";

export function HouseMark({ className }: { className?: string }) {
  return <img src={HOUSE_MARK} alt="" className={cn("bg-transparent object-contain", className)} />;
}

export function BrandEmblem({ className }: { className?: string }) {
  return <HouseMark className={className} />;
}

export function BrandTitle({
  size = "nav",
  showTagline = true,
  className,
}: {
  size?: "nav" | "hero";
  showTagline?: boolean;
  className?: string;
}) {
  const { site } = usePublicSite();
  const name = site.brandName.trim() || "Her First Meal";
  const tagline = site.brandTagline.trim() || "We remember the mother.";
  const parts = name.split(/\s+/);
  const first = parts[0] ?? "Her";
  const middle = parts.length >= 3 ? parts.slice(1, -1).join(" ") : parts[1] ?? "First";
  const last = parts.length >= 3 ? parts[parts.length - 1] : parts.length === 2 ? "" : "Meal";

  return (
    <span className={cn("leading-none", className)}>
      <span
        className={cn(
          "font-logo tracking-tight",
          size === "hero" ? "text-[clamp(2.8rem,8vw,6.4rem)]" : "text-[1.35rem] md:text-[1.55rem]",
        )}
      >
        <span>{first} </span>
        <span className="italic text-gold">{middle}</span>
        {last ? <span> {last}</span> : null}
      </span>
      {showTagline ? (
        <span
          className={cn(
            "mt-1.5 block uppercase text-current/55",
            size === "hero" ? "text-[0.7rem] tracking-[0.38em] md:text-xs" : "text-[0.58rem] tracking-[0.22em]",
          )}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  );
}

export function Wordmark({
  to = "/",
  className,
  stacked = false,
  mark = false,
}: {
  to?: "/" | "/app" | "/admin";
  className?: string;
  stacked?: boolean;
  mark?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex min-w-0 items-center gap-2.5 text-foreground no-underline", className)}>
      {mark ? <HouseMark className={cn("shrink-0", stacked ? "size-14" : "size-11 md:size-12")} /> : null}
      <BrandTitle size="nav" showTagline={false} className="block min-w-0" />
    </Link>
  );
}
