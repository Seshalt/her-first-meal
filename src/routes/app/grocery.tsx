import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { cn } from "@/lib/utils";

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

  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Building your list…</p>;

  return (
    <div>
      <RoomHero
        kicker="The market"
        title="Grocery intelligence"
        body={`Organized by department for ${data.stores.length ? data.stores.join(", ") : "your preferred stores"}. We never claim exact shelf inventory.`}
        src="/images/grocery-partner.jpg"
        alt="A partner choosing produce from a handwritten list"
        tone="gold"
      />
      <RoomBody>
        {grouped.map(([dept, items]) => (
          <section key={dept} className="mb-16">
            <p className="text-xs uppercase tracking-[0.32em] text-gold">{dept}</p>
            <div className="editorial-rule mt-4" />
            <ul className="mt-2">
              {items.map((item) => (
                <li key={item.name} className="border-b border-border">
                  <label
                    className={cn(
                      "flex min-h-16 cursor-pointer items-center gap-4 py-4",
                      item.checked && "opacity-45",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setData({
                          ...data,
                          items: data.items.map((i) => (i.name === item.name ? { ...i, checked } : i)),
                        });
                        void toggleGroceryItem({ data: { name: item.name, checked } });
                      }}
                    />
                    <span className="flex-1 font-display text-2xl">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.qty}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </RoomBody>
    </div>
  );
}
