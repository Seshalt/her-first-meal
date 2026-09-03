import { Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";

export function NotFoundPage() {
  return (
    <div>
      <PublicNav />
      <section className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-clay">404</p>
        <h1 className="mt-4 font-display text-5xl">This room is not in the house.</h1>
        <p className="mt-4 text-ink-soft">The page you asked for is gone, or it never had a door.</p>
        <Link to="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-sea px-6 text-paper">
          Return home
        </Link>
      </section>
      <PublicFooter />
    </div>
  );
}
