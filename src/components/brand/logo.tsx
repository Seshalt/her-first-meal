import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";

export const HOUSE_MARK = "/images/logos/mark-hands-belly.jpg";

/** Gold hand, blue hand, bowl, rising steam and herbs. */
export function HouseMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={cn("house-mark", className)}
      aria-hidden="true"
      role="img"
    >
      <title>Her First Meal</title>
      <path
        className="house-mark-belly"
        d="M78 38c8-16 36-16 44 0 10 20 18 38 18 58 0 28-18 48-40 48s-40-20-40-48c0-20 8-38 18-58Z"
        fill="#F3E6D4"
      />
      <path
        d="M118 42c10 18 16 36 16 54 0 22-10 38-24 44 16-8 28-28 28-50 0-18-6-34-20-48Z"
        fill="#E4C7A8"
        opacity="0.7"
      />
      <ellipse cx="100" cy="168" rx="54" ry="10" fill="#D4A24A" opacity="0.18" />
      <path
        d="M28 128c8-28 34-34 48-18 8 10 10 22 6 34-6 16-22 28-40 24-14-4-20-22-14-40Z"
        fill="#D4A24A"
      />
      <path
        d="M124 110c14-16 40-10 48 16 6 18 0 36-14 40-18 4-34-8-40-24-4-12-2-24 6-32Z"
        fill="#1F5F8A"
      />
      <ellipse cx="100" cy="128" rx="28" ry="10" fill="#FBF6EE" stroke="#D4A24A" strokeWidth="2" />
      <path d="M74 128c2 18 12 30 26 30s24-12 26-30" fill="#F7F1E8" stroke="#D4A24A" strokeWidth="2" />
      <ellipse cx="100" cy="128" rx="22" ry="7" fill="#C9842A" />
      <ellipse cx="100" cy="127" rx="16" ry="4.5" fill="#E8B85A" />
      <g className="house-mark-steam">
        <path className="steam steam-a" d="M90 118c-4-14 6-18 2-30" fill="none" stroke="#D4A24A" strokeWidth="1.6" strokeLinecap="round" />
        <path className="steam steam-b" d="M100 116c2-16-6-22 0-34" fill="none" stroke="#E8C56A" strokeWidth="1.5" strokeLinecap="round" />
        <path className="steam steam-c" d="M110 118c4-14-4-20 2-32" fill="none" stroke="#D4A24A" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="house-mark-herbs">
        <path className="herb herb-a" d="M86 96c6-2 8-8 6-14-6 2-10 8-6 14Z" fill="#2A756C" />
        <path className="herb herb-b" d="M108 90c-6-3-7-10-4-16 7 3 9 10 4 16Z" fill="#1F5F8A" />
        <path className="herb herb-c" d="M98 82c4-6 2-12-2-16 8 1 12 8 8 16-2 2-4 2-6 0Z" fill="#3F8F4A" />
        <circle className="herb herb-d" cx="94" cy="108" r="1.4" fill="#2A756C" />
        <circle className="herb herb-e" cx="107" cy="104" r="1.2" fill="#1F5F8A" />
      </g>
    </svg>
  );
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
}: {
  to?: "/" | "/app" | "/admin";
  className?: string;
  stacked?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex min-w-0 items-center gap-2.5 text-foreground no-underline", className)}>
      <HouseMark className={cn("shrink-0", stacked ? "size-14" : "size-11 md:size-12")} />
      <BrandTitle size="nav" showTagline className="block min-w-0" />
    </Link>
  );
}
