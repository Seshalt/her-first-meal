import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22.5" fill="currentColor" opacity="0.12" />
      <path
        d="M24 10c6 6 10 10.5 10 16.2 0 5.4-4.4 9.8-10 9.8s-10-4.4-10-9.8C14 20.5 18 16 24 10Z"
        fill="currentColor"
      />
      <circle cx="24" cy="25.5" r="3.2" fill="var(--background)" />
    </svg>
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
  const { content, site } = usePublicSite();
  const logo = content.images.logo?.trim();
  const name = site.brandName.trim() || "Her First Meal";
  const tagline = site.brandTagline.trim();

  return (
    <Link
      to={to}
      className={cn("flex items-center gap-2.5 text-foreground no-underline", className)}
    >
      {logo ? (
        <img src={logo} alt="" className="h-9 w-auto max-w-[10rem] object-contain" />
      ) : (
        <Mark className="size-9" />
      )}
      {name ? (
        <span className={cn("leading-none", stacked && "flex flex-col")}>
          <span className="font-logo text-xl tracking-tight">{name}</span>
          {stacked && tagline ? (
            <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-current/55">
              {tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
