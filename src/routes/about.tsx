import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Button } from "@/components/ui/button";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  const { site, content } = usePublicSite();
  return (
    <div>
      <PublicNav />
      <PageCanvas tone="linen">
        <article className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-clay">{site.aboutKicker}</p>
          <h1 className="mt-3 font-display text-5xl">{site.aboutTitle}</h1>
          <img
            src={content.images.about}
            alt=""
            className="media mt-10 h-72 w-full rounded-[28px] object-cover"
          />
          <div className="glass-panel mt-10 space-y-5 p-6 text-lg leading-relaxed text-ink-soft md:p-8">
            <p>{site.aboutP1}</p>
            <p>{site.aboutP2}</p>
            <p className="font-display text-3xl italic text-foreground">{site.aboutQuote}</p>
            <p>{site.aboutP3}</p>
            <p>{site.aboutP4}</p>
          </div>
          <Button asChild className="mt-10" variant="clay">
            <Link to="/pricing">{site.aboutCta}</Link>
          </Button>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
