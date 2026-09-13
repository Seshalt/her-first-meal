import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { altFor } from "@/lib/landing";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";
import { stateByCode } from "@/lib/content/places";

export const Route = createFileRoute("/app/grocery")({ component: Grocery });

function Grocery() {
  const t = useT();
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

  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">{t("grocery.building")}</p>;

  const place = stateByCode(data.stateCode)?.name ?? data.location ?? "your market";
  const body = data.stores.length
    ? t("grocery.bodyStores", { stores: data.stores.join(", ") })
    : t("grocery.body", { place });

  return (
    <div>
      <RoomHero
        kicker={t("grocery.kicker")}
        title={t("grocery.title")}
        body={body}
        src="/images/grocery-partner.jpg"
        alt={altFor("/images/grocery-partner.jpg")}
        tone="gold"
      />
      <RoomBody>
        {!data.items.length ? <p className="text-lg text-ink-soft">{t("grocery.empty")}</p> : null}
        {grouped.map(([dept, items]) => (
          <section key={dept} className="mb-16">
            <p className="text-xs uppercase tracking-[0.32em] text-gold">
              {dept === "Produce" && items.some((i) => i.source === "seasonal") ? t("grocery.seasonal") : dept}
            </p>
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
