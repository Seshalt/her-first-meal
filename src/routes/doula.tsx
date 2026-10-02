import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Button } from "@/components/ui/button";
import { getLanding } from "@/lib/server/public";
import { lines } from "@/lib/site";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/doula")({
  loader: async () => {
    try {
      return await getLanding();
    } catch {
      return null;
    }
  },
  component: DoulaPage,
});

function DoulaPage() {
  const { site, content } = usePublicSite();

  return (
    <div>
      <PublicNav />
      <PageCanvas tone="linen">
        <main>
          <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:px-6 md:pt-20">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-clay">{site.doulaKicker}</p>
              <h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[0.95]">{site.doulaTitle}</h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{site.doulaIntro}</p>
              <Button asChild variant="clay" size="lg" className="mt-8">
                <Link to="/contact">{site.doulaCta} <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
            <div className="relative">
              <img src={content.images.family} alt={content.alts.family} className="media aspect-[4/5] w-full rounded-[32px] object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-ink/85 p-5 text-paper backdrop-blur md:bottom-6 md:left-6 md:right-6">
                <p className="text-xs uppercase tracking-[0.22em] text-gold">{site.doulaPriceLabel}</p>
                <p className="mt-2 font-display text-5xl">{site.doulaPrice}</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/75">{site.doulaPriceNote}</p>
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 md:grid-cols-2 md:px-6">
            <article className="glass-panel p-7 md:p-10">
              <h2 className="font-display text-4xl">{site.doulaWhatTitle}</h2>
              <p className="mt-5 text-base leading-8 text-ink-soft">{site.doulaWhatBody}</p>
            </article>
            <article className="glass-panel p-7 md:p-10">
              <h2 className="font-display text-4xl">{site.doulaSupportTitle}</h2>
              <ul className="mt-6 space-y-4">
                {lines(site.doulaSupportPoints).map((point) => (
                  <li key={point} className="flex gap-3 text-base leading-7 text-ink-soft">
                    <Check className="mt-1 size-5 shrink-0 text-clay" />{point}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="bg-ink px-4 py-16 text-paper md:px-6 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <img src={content.images.about} alt={content.alts.about} className="aspect-[4/3] w-full rounded-[28px] object-cover" loading="lazy" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">Her First Meal</p>
                <h2 className="mt-4 font-display text-5xl">{site.doulaExperienceTitle}</h2>
                <p className="mt-5 text-lg leading-8 text-paper/75">{site.doulaExperienceBody}</p>
                <p className="mt-8 text-sm leading-7 text-paper/55">{site.doulaMedicalNote}</p>
                <Button asChild variant="gold" className="mt-8">
                  <Link to="/contact">{site.doulaCta} <ArrowRight className="ml-2 size-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
