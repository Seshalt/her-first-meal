import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { TickRow } from "@/components/house/tick";
import { PlaceAsk } from "@/components/house/place";
import { addGroceryItem, composeLocalGrocery, getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { altFor } from "@/lib/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/grocery")({ component: Grocery });

function Grocery() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getGroceryList>> | null>(null);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [busy, setBusy] = useState(false);

  function reload() {
    return getGroceryList().then(setData);
  }

  useEffect(() => {
    void reload();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, NonNullable<typeof data>["items"]>();
    for (const item of data?.items ?? []) {
      const list = map.get(item.dept) ?? [];
      list.push(item);
      map.set(item.dept, list);
    }
    return [...map.entries()];
  }, [data]);

  if (!data) {
    return (
      <div className="house-morning px-5 pt-28">
        <p className="font-display text-3xl text-ink-soft">Building your list…</p>
      </div>
    );
  }

  const remaining = data.items.filter((i) => !i.checked).length;
  const placeLabel = data.place || [data.city, data.zipCode, data.location].filter(Boolean).join(" · ");

  return (
    <div>
      <RoomHero
        kicker="The market"
        title="Grocery intelligence"
        body={
          data.stores.length
            ? `Organized for ${data.stores.join(", ")}. Built from this week's table${placeLabel ? ` near ${placeLabel}` : ""}.`
            : "Built from this week's plates, pantry, and wherever you shop. We never claim exact shelf inventory."
        }
        src="/images/grocery-partner.jpg"
        alt={altFor("/images/grocery-partner.jpg")}
        tone="gold"
      />
      <RoomBody>
        <PlaceAsk
          label={placeLabel}
          permission={data.permission}
          onSaved={() => void reload()}
        />

        {data.meals.length ? (
          <p className="mt-10 text-sm leading-relaxed text-ink-soft">
            From the table: {data.meals.map((m) => `${m.day} ${m.title}`).join(" · ")}
            {data.skippedPantry ? ` · ${data.skippedPantry} pantry jars already skipped` : ""}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <p className="font-display text-2xl text-ink-soft">
            <span className="tabular-nums text-ink">{remaining}</span> still to gather
          </p>
          <Button
            type="button"
            variant="gold"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void composeLocalGrocery()
                .then((r) => {
                  toast.success(
                    r.added
                      ? r.original
                        ? `${r.added} local items from her market.`
                        : `${r.added} seasonal items for this month.`
                      : "The list already had what this market needed.",
                  );
                  return reload();
                })
                .catch((err) => toast.error(err instanceof Error ? err.message : "Could not fill the list."))
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Walking the aisles…" : "Fill from her market"}
          </Button>
        </div>

        {grouped.length === 0 ? (
          <div className="mt-12">
            <p className="font-display text-3xl leading-snug">The basket is waiting on a plate.</p>
            <p className="mt-4 max-w-lg text-lg text-ink-soft">
              Open this week's table, cook a plate, then come back — the list writes itself from the ingredients.
            </p>
            <Button asChild className="mt-6" variant="clay">
              <Link to="/app/meals">Open the table</Link>
            </Button>
          </div>
        ) : (
          grouped.map(([dept, items]) => (
            <section key={dept} className="mt-12">
              <p className="text-xs uppercase tracking-[0.32em] text-gold">{dept}</p>
              <div className="editorial-rule mt-4" />
              <ul className="mt-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <TickRow
                      name={item.name}
                      qty={item.qty}
                      checked={item.checked}
                      onChecked={(checked) => {
                        setData({
                          ...data,
                          items: data.items.map((i) => (i.name === item.name ? { ...i, checked } : i)),
                        });
                        void toggleGroceryItem({ data: { name: item.name, checked } });
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <form
          className="market-add mt-14"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            void addGroceryItem({ data: { name, qty } })
              .then(() => {
                setName("");
                setQty("");
                return reload();
              })
              .then(() => toast.success("Added to the list."));
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Something else she needs" required />
          <Input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" />
          <Button type="submit" variant="outline">
            Add to the list
          </Button>
        </form>

        {!data.aiReady ? (
          <p className="mt-10 text-sm text-ink-soft">
            Original local lists get richer once ChatGPT is connected in Vercel. Seasonal produce still fills in until then.
          </p>
        ) : null}
      </RoomBody>
    </div>
  );
}
