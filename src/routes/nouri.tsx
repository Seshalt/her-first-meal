import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ListChecks, MessageCircle, ShoppingBasket, Video, UtensilsCrossed } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Button } from "@/components/ui/button";
import { usePublicSite } from "@/lib/use-public-site";
import { getLanding } from "@/lib/server/public";

export const Route = createFileRoute("/nouri")({
  loader: async () => {
    try {
      return await getLanding();
    } catch {
      return null;
    }
  },
  component: SupportMarketing,
});

const SUPPORT = [
  { icon: UtensilsCrossed, title: "Built-in meal library", body: "Recipes are selected from a pre-written kitchen library using the stage and dietary preferences you choose." },
  { icon: ShoppingBasket, title: "Market-ready groceries", body: "Your grocery list grows from your selected meals and pantry, with quick links to find stores near you." },
  { icon: ListChecks, title: "Stage guidance", body: "Pregnancy and postpartum guidance is organized by your saved stage and week." },
  { icon: HeartHandshake, title: "Human support", body: "Send Maat a private note from inside your membership when you want a person behind the response." },
  { icon: Video, title: "Live Zoom sessions", body: "Book an optional private session and join from your appointments room when the meeting link is ready." },
  { icon: MessageCircle, title: "Personalized to you", body: "Your saved choices shape meals, groceries, movement, and guidance throughout the house." },
];

function SupportMarketing() {
  const { content } = usePublicSite();
  return (
    <div>
      <PublicNav />
      <PageCanvas tone="plum">
        <section>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-16">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-plum">Personal support</p>
              <h1 className="mt-3 font-display text-5xl">Personalized support for the season you’re in.</h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Her First Meal brings together a deep recipe and wellness library, your dietary choices, your pregnancy or postpartum stage, and the stores you prefer. When you want a human, Maat is still here.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="plum"><Link to="/pricing">Start your journey</Link></Button>
                <Button asChild variant="outline"><Link to="/contact">Write Maat</Link></Button>
              </div>
            </div>
            <img src={content.images.nouriHero} alt={content.alts.nouriHero} className="media h-80 w-full rounded-[32px] object-cover" />
          </div>
        </section>
        <section className="pb-16">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORT.map(({ icon: Icon, title, body }) => (
              <article key={title} className="glass-panel p-6 transition hover:-translate-y-1">
                <Icon className="size-5 text-plum" />
                <h2 className="mt-4 font-display text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
