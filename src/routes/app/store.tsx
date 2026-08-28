import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { buyProduct, listStore } from "@/lib/server/binding";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/app/store")({ component: Store });

function Store() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listStore>> | null>(null);
  useEffect(() => {
    void listStore().then(setData);
  }, []);
  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Opening the shop…</p>;
  const meetings = data.products.filter((p) => p.kind === "consultation" || p.slug === "consultation");
  return (
    <div>
      <RoomHero
        kicker="The only extra"
        title="A meeting with Maat"
        body="Membership already holds the table, the studio, Nouri, and the pantry. The only thing billed beyond that is time with Maat."
        src="/images/binding-hands.jpg"
        alt="Hands wrapping a cotton belly bind"
        tone="gold"
      />
      <div>
        {meetings.length === 0 ? (
          <RoomBody>
            <p className="font-display text-3xl text-ink-soft">No meeting times are priced yet.</p>
          </RoomBody>
        ) : (
          meetings.map((p, i) => (
            <article key={p.id} className="grid min-h-[62vh] lg:grid-cols-2">
              <div className={i % 2 === 1 ? "relative min-h-[42vh] lg:order-2" : "relative min-h-[42vh]"}>
                <img
                  src={p.image || "/images/binding-hands.jpg"}
                  alt=""
                  className="media absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center bg-wash-blush px-5 py-16 md:px-16">
                <p className="text-xs uppercase tracking-[0.32em] text-blush">Private session</p>
                <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.8rem)]">{p.name}</h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">{p.description}</p>
                <p className="mt-6 font-display text-4xl tabular-nums">{formatCurrency(p.price_cents)}</p>
                <p className="mt-2 text-sm text-ink-soft">Per session. Not included in membership.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    variant="blush"
                    onClick={() =>
                      void buyProduct({ data: { productId: p.id } }).then((r) => {
                        if (r.ok) toast.success("Held. Choose a time on the calendar.");
                        else toast.error(r.error);
                        void listStore().then(setData);
                      })
                    }
                  >
                    Pay for a session
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/app/appointments">Pick a time</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      <RoomBody>
        <h2 className="font-display text-4xl">History</h2>
        <div className="editorial-rule editorial-rule-blush mt-6" />
        <ul>
          {data.history.length === 0 ? (
            <li className="py-8 text-lg text-ink-soft">No meetings purchased yet.</li>
          ) : (
            data.history.map((h) => (
              <li key={h.id} className="border-b border-border py-6 text-lg">
                {formatCurrency(h.amount_cents)} · {h.status} · {new Date(h.created_at).toLocaleDateString()}
              </li>
            ))
          )}
        </ul>
      </RoomBody>
    </div>
  );
}
