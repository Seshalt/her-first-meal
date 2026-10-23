import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { usePublicSite } from "@/lib/use-public-site";
import { getLanding } from "@/lib/server/public";

export const Route = createFileRoute("/belly-binding")({
  loader: async () => {
    try {
      return await getLanding();
    } catch {
      return null;
    }
  },
  component: BindingPage,
});

function BindingPage() {
  const localizeContent = useContentText();
  const { site, content, bindingSteps } = usePublicSite();
  const steps =
    bindingSteps?.length > 0
      ? bindingSteps
      : [
          { title: site.bindStep1Title, body: site.bindStep1Body, image: content.images.bindStep1, alt: content.alts.bindStep1 },
          { title: site.bindStep2Title, body: site.bindStep2Body, image: content.images.bindStep2, alt: content.alts.bindStep2 },
          { title: site.bindStep3Title, body: site.bindStep3Body, image: content.images.bindStep3, alt: content.alts.bindStep3 },
          { title: site.bindStep4Title, body: site.bindStep4Body, image: content.images.bindStep4, alt: content.alts.bindStep4 },
        ];
  const faqs = [
    { q: site.faq1q, a: site.faq1a },
    { q: site.faq2q, a: site.faq2a },
    { q: site.faq3q, a: site.faq3a },
    { q: site.faq4q, a: site.faq4a },
  ];
  return (
    <div>
      <PublicNav />
      <PageCanvas tone="blush">
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-16">
          <div>
            <Badge tone="blush">{localizeContent(site.bindPageKicker)}</Badge>
            <h1 className="mt-4 font-display text-5xl">{localizeContent(site.bindPageTitle)}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{localizeContent(site.bindPageBody)}</p>
            <Button asChild className="mt-8" variant="blush">
              <Link to="/pricing">{localizeContent(site.bindPageCta)}</Link>
            </Button>
          </div>
          <img src={content.images.bindHero} alt={localizeContent(content.alts.bindHero)} className="media h-80 w-full rounded-[32px] object-cover" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2">
        {localizeContent(steps.map((s, i) => (
          <article key={s.title + String(i)} className="glass-panel overflow-hidden">
            <img src={s.image} alt={localizeContent(s.alt)} className="media h-44 w-full object-cover" loading="lazy" decoding="async" />
            <div className="p-6">
              <h2 className="font-display text-2xl">{localizeContent(s.title)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{localizeContent(s.body)}</p>
            </div>
          </article>
        )))}
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-3xl">{localizeContent(site.bindQuestions)}</h2>
        <dl className="mt-6 space-y-5">
          {localizeContent(faqs.map((f) => (
            <div key={f.q} className="glass-panel p-5">
              <dt className="font-medium">{localizeContent(f.q)}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{localizeContent(f.a)}</dd>
            </div>
          )))}
        </dl>
      </section>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
