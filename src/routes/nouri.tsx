import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Button } from "@/components/ui/button";
import { lines } from "@/lib/site";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/nouri")({ component: NouriMarketing });

function NouriMarketing() {
  const { site, content } = usePublicSite();
  return (
    <div>
      <PublicNav />
      <PageCanvas tone="plum">
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-plum">{site.nouriPageKicker}</p>
            <h1 className="mt-3 font-display text-5xl">{site.nouriPageTitle}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{site.nouriPageBody}</p>
            <Button asChild className="mt-8" variant="plum">
              <Link to="/pricing">{site.nouriPageCta}</Link>
            </Button>
          </div>
          <img src={content.images.nouriHero} alt="" className="media h-80 w-full rounded-[32px] object-cover" />
        </div>
      </section>
      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {lines(site.nouriPills).map((item) => (
            <p key={item} className="glass-panel px-5 py-6 text-sm">
              {item}
            </p>
          ))}
        </div>
      </section>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
