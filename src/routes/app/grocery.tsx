import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { altFor } from "@/lib/landing";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";
import { stateByCode } from "@/lib/content/places";

export const Route = createFileRoute("/app/grocery")({ component: Grocery });

function Grocery() {
  const t = useT();
  const [data, setData] = useState<Awaited<ReturnType<typeof getGroceryList>> | null>(null);
  const [locating, setLocating] = useState(false);

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

  function openMapSearch(query: string) {
    const fallback = `${query} near ${place}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`, "_blank", "noopener,noreferrer");
  }

  function findNearby() {
    if (!("geolocation" in navigator)) {
      openMapSearch("grocery stores");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`grocery stores near ${coords.latitude},${coords.longitude}`)}`,
          "_blank",
          "noopener,noreferrer",
        );
      },
      () => {
        setLocating(false);
        openMapSearch("grocery stores");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }

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
        <section className="mb-14 overflow-hidden rounded-[30px] border border-border/70 bg-card/80 p-5 shadow-[0_24px_70px_-32px_rgba(30,42,38,.45)] md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-gold"><MapPin className="size-4" /> Nearby markets</p>
              <h2 className="mt-2 font-display text-3xl">Shop the list near you.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Her First Meal never sells or stores your live GPS position. When you tap below, your browser can share a one-time location directly with your maps app. If you decline, we search around {place} instead.
              </p>
            </div>
            <Button type="button" variant="gold" onClick={findNearby} disabled={locating}>
              <Navigation className="mr-2 size-4" /> {locating ? "Finding stores…" : "Find stores near me"}
            </Button>
          </div>
          {data.stores.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {data.stores.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => openMapSearch(store)}
                  className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {store} nearby
                </button>
              ))}
            </div>
          ) : null}
        </section>

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
