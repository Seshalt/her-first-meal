import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";

export const HOUSE_MARK = "/images/logos/mark-hands-belly.jpg";

export function BrandEmblem({ className }: { className?: string }) {
  const { content } = usePublicSite();
  const src = content.images.logo?.trim() || HOUSE_MARK;
  return <img src={src} alt="" className={cn("object-contain", className)} />;
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
}: {
  to?: "/" | "/app" | "/admin";
  className?: string;
  stacked?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex min-w-0 items-center text-foreground no-underline", className)}>
      <BrandTitle size="nav" showTagline className="block" />
    </Link>
  );
}
