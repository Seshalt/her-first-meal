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
  const { site, content, bindingSteps } = usePublicSite();
  const steps =
    bindingSteps?.length > 0
      ? bindingSteps
      : [
          { title: site.bindStep1Title, body: site.bindStep1Body, image: content.images.bindStep1 },
          { title: site.bindStep2Title, body: site.bindStep2Body, image: content.images.bindStep2 },
          { title: site.bindStep3Title, body: site.bindStep3Body, image: content.images.bindStep3 },
          { title: site.bindStep4Title, body: site.bindStep4Body, image: content.images.bindStep4 },
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
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <Badge tone="blush">{site.bindPageKicker}</Badge>
            <h1 className="mt-4 font-display text-5xl">{site.bindPageTitle}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{site.bindPageBody}</p>
            <Button asChild className="mt-8" variant="blush">
              <Link to="/pricing">{site.bindPageCta}</Link>
            </Button>
          </div>
          <img src={content.images.bindHero} alt="" className="media h-80 w-full rounded-[32px] object-cover" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2">
        {steps.map((s, i) => (
          <article key={s.title + String(i)} className="glass-panel overflow-hidden">
            <img src={s.image} alt="" className="media h-44 w-full object-cover" loading="lazy" decoding="async" />
            <div className="p-6">
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-3xl">{site.bindQuestions}</h2>
        <dl className="mt-6 space-y-5">
          {faqs.map((f) => (
            <div key={f.q} className="glass-panel p-5">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
