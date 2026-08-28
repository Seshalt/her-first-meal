import { useRef, type MouseEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function MagneticLink({
  to,
  children,
  className,
}: {
  to: "/pricing" | "/checkout" | "/about" | "/";
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      to={to}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-sea-deep dark:hover:bg-aqua",
        className,
      )}
    >
      {children}
    </Link>
  );
}
