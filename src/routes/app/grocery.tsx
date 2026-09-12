import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { TickRow } from "@/components/house/tick";
import { getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { altFor } from "@/lib/landing";

export const Route = createFileRoute("/app/grocery")({ component: Grocery });

function Grocery() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getGroceryList>> | null>(null);

  useEffect(() => {
    void getGroceryList().then(setData);
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

  return (
    <div>
      <RoomHero
        kicker="The market"
        title="Grocery intelligence"
        body={`Organized by department for ${data.stores.length ? data.stores.join(", ") : "your preferred stores"}. We never claim exact shelf inventory.`}
        src="/images/grocery-partner.jpg"
        alt={altFor("/images/grocery-partner.jpg")}
        tone="gold"
      />
      <RoomBody>
        <p className="font-display text-2xl text-ink-soft">
          <span className="tabular-nums text-ink">{remaining}</span> still to gather
        </p>
        {grouped.map(([dept, items]) => (
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
        ))}
      </RoomBody>
    </div>
  );
}
