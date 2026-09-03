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
      <g fill="#D4A24A" stroke="#B8862E" strokeWidth="0.7" strokeLinejoin="round">
        <path d="M20 178c1-20 12-36 30-46 7-4 16-3 20 4 3 6-2 11-9 13-9 3-15 9-17 17-2 7 2 13 9 15 5 1 5 7-1 8-16 3-32-2-32-11Z" />
        <path d="M64 150c10-3 20 0 24 8 3 7-3 13-12 14-9 2-18-3-20-10-1-5 2-10 8-12Z" />
        <path d="M38 134c-4-11 3-20 11-18 5 1 7 8 5 14-2 8-8 14-13 13-4-1-4-4-3-9Z" />
        <path d="M46 122c-3-16 6-26 14-23 6 2 8 11 6 19-3 10-10 18-16 16-5-1-5-5-4-12Z" />
        <path d="M56 114c-2-18 8-28 16-25 6 2 8 12 6 21-3 11-11 20-17 17-5-2-6-6-5-13Z" />
        <path d="M68 116c-1-15 8-24 15-21 5 2 7 11 5 18-3 10-10 17-15 15-5-1-6-5-5-12Z" />
      </g>
      <g fill="#1F5F8A" stroke="#164868" strokeWidth="0.7" strokeLinejoin="round">
        <path d="M180 178c-1-20-12-36-30-46-7-4-16-3-20 4-3 6 2 11 9 13 9 3 15 9 17 17 2 7-2 13-9 15-5 1-5 7 1 8 16 3 32-2 32-11Z" />
        <path d="M136 150c-10-3-20 0-24 8-3 7 3 13 12 14 9 2 18-3 20-10 1-5-2-10-8-12Z" />
        <path d="M162 134c4-11-3-20-11-18-5 1-7 8-5 14 2 8 8 14 13 13 4-1 4-4 3-9Z" />
        <path d="M154 122c3-16-6-26-14-23-6 2-8 11-6 19 3 10 10 18 16 16 5-1 5-5 4-12Z" />
        <path d="M144 114c2-18-8-28-16-25-6 2-8 12-6 21 3 11 11 20 17 17 5-2 6-6 5-13Z" />
        <path d="M132 116c1-15-8-24-15-21-5 2-7 11-5 18 3 10 10 17 15 15 5-1 6-5 5-12Z" />
      </g>
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
