import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  const { site, content } = usePublicSite();
  return (
    <div>
      <PublicNav />
      <article className="bg-wash-linen">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-clay">{site.aboutKicker}</p>
          <h1 className="mt-3 font-display text-5xl">{site.aboutTitle}</h1>
          <img
            src={content.images.about}
            alt=""
            className="media mt-10 h-72 w-full rounded-[28px] object-cover"
          />
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>{site.aboutP1}</p>
            <p>{site.aboutP2}</p>
            <p className="font-display text-3xl italic text-foreground">{site.aboutQuote}</p>
            <p>{site.aboutP3}</p>
            <p>{site.aboutP4}</p>
          </div>
          <Button asChild className="mt-10" variant="clay">
            <Link to="/pricing">{site.aboutCta}</Link>
          </Button>
        </div>
      </article>
      <PublicFooter />
    </div>
  );
}
