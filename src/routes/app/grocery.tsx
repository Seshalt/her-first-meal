import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getGroceryList, toggleGroceryItem } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";
import { stateByCode } from "@/lib/content/places";
import { KITCHEN_APPLIANCES } from "@/lib/content/catalog";

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

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#f7f4ed] px-5 pt-32 text-[#1f2a24]">
        <p className="font-display text-4xl">{t("grocery.building")}</p>
      </div>
    );
  }

  const place = stateByCode(data.stateCode)?.name ?? data.location ?? "your area";
  const selectedAppliances = KITCHEN_APPLIANCES.filter((item) => data.appliances.includes(item.id));
  const total = data.items.length;
  const checked = data.items.filter((item) => item.checked).length;

  function openMapSearch(query: string) {
    const fallback = `${query} near ${place}`;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`,
      "_blank",
      "noopener,noreferrer",
    );
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
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `grocery stores near ${coords.latitude},${coords.longitude}`,
          )}`,
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
    <div className="min-h-dvh bg-[#f7f4ed] text-[#1e2923]">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 md:px-6 md:pt-28">
        <header className="grid gap-7 border-b border-[#1e2923]/10 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9782e]">Market · this week</p>
            <h1 className="mt-3 font-display text-[clamp(3.2rem,7vw,6.7rem)] leading-[0.88] tracking-[-0.04em]">
              Shop once.
              <span className="block italic text-[#35685b]">Cook what fits.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d6962] md:text-lg">
              Your meal plan becomes one grocery list, grouped by section. Your preferred stores and kitchen tools stay beside it so the plan feels like your actual week.
            </p>
          </div>
          <div className="rounded-full border border-[#1e2923]/10 bg-white px-5 py-3 text-sm shadow-sm">
            <span className="font-semibold">{checked}</span>
            <span className="text-[#6e7872]"> of {total} checked</span>
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <article className="relative overflow-hidden rounded-[34px] bg-[#21483f] p-6 text-[#f9f3e7] shadow-[0_28px_80px_-44px_rgba(17,45,38,.72)] md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-4 top-12 size-36 rounded-full border border-[#d5a24a]/25" />
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e1b562]">
              <MapPin className="size-4" /> 01 · Pick your shop
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[0.95] md:text-5xl">
              Find the stores that make sense for this list.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/72">
              Start with {place}. You can use your current location for a one-time nearby search, or open one of your saved stores directly.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="gold"
                onClick={findNearby}
                disabled={locating}
                className="min-h-12 rounded-full px-6"
              >
                <Navigation className="mr-2 size-4" />
                {locating ? "Finding stores…" : "Find stores near me"}
              </Button>
              <Link
                to="/app/profile"
                className="inline-flex min-h-12 items-center rounded-full border border-white/18 bg-white/8 px-5 text-sm font-medium text-white/88 transition hover:bg-white/12"
              >
                Change preferred stores
              </Link>
            </div>

            <div className="mt-8 flex items-start gap-2 border-t border-white/12 pt-5 text-xs leading-5 text-white/58">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#e1b562]" />
              Precise GPS is used only for the nearby search and is not saved to your Her First Meal profile.
            </div>
          </article>

          <article className="rounded-[34px] border border-[#1e2923]/10 bg-white p-6 shadow-[0_22px_70px_-50px_rgba(17,31,25,.5)] md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9782e]">02 · Your kitchen</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl leading-tight">Cook with what you own.</h2>
                <p className="mt-2 text-sm leading-6 text-[#67716b]">
                  These are the tools you selected during setup.
                </p>
              </div>
              <Link to="/app/profile" className="text-xs font-semibold text-[#35685b] underline-offset-4 hover:underline">
                Edit
              </Link>
            </div>

            {selectedAppliances.length ? (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {selectedAppliances.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-[#1e2923]/9 bg-[#f7f4ed] p-4">
                    <span className="grid size-10 place-items-center rounded-2xl bg-white text-xl shadow-sm">{item.icon}</span>
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-[#1e2923]/18 bg-[#f7f4ed] p-5">
                <p className="text-sm leading-6 text-[#67716b]">
                  Add your oven, air fryer, pressure cooker, slow cooker, microwave, toaster, blender, or stovetop in Settings.
                </p>
                <Link to="/app/profile" className="mt-3 inline-flex text-sm font-semibold text-[#35685b]">
                  Set up my kitchen →
                </Link>
              </div>
            )}
          </article>
        </section>

        {data.stores.length ? (
          <section className="mt-5 rounded-[28px] border border-[#1e2923]/10 bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9782e]">Your saved stores</p>
                <h2 className="mt-2 font-display text-3xl">One tap to your usual shop.</h2>
              </div>
              <span className="text-xs text-[#7a837e]">{data.stores.length} selected</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.stores.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => openMapSearch(store)}
                  className="group rounded-[22px] border border-[#1e2923]/10 bg-[#f7f4ed] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#d2a352]/70 hover:bg-[#fcf9f2]"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block text-sm font-semibold">{store}</span>
                      <span className="mt-1 block text-xs text-[#78817c]">Search near {place}</span>
                    </span>
                    <span className="grid size-9 place-items-center rounded-full bg-white text-[#a9782e] shadow-sm transition group-hover:scale-105">
                      ↗
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9782e]">03 · Your list</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Everything for the week.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#6a746e]">
              Built from this week’s meals and reduced by what is already in your pantry.
            </p>
          </div>

          {!data.items.length ? (
            <div className="mt-7 rounded-[28px] border border-dashed border-[#1e2923]/18 bg-white p-8 text-lg text-[#66716b]">
              {t("grocery.empty")}
            </div>
          ) : null}

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {grouped.map(([dept, items]) => (
              <article key={dept} className="overflow-hidden rounded-[28px] border border-[#1e2923]/10 bg-white shadow-[0_18px_55px_-46px_rgba(17,31,25,.45)]">
                <div className="flex items-center justify-between border-b border-[#1e2923]/8 bg-[#fbf8f2] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f742f]">
                    {dept === "Produce" && items.some((i) => i.source === "seasonal") ? t("grocery.seasonal") : dept}
                  </p>
                  <span className="text-xs text-[#929994]">{items.filter((item) => item.checked).length}/{items.length}</span>
                </div>

                <ul>
                  {items.map((item) => (
                    <li key={item.name} className="border-b border-[#1e2923]/7 last:border-b-0">
                      <label
                        className={cn(
                          "flex min-h-20 cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-[#fbf8f2]",
                          item.checked && "opacity-45",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold transition",
                            item.checked
                              ? "border-[#35685b] bg-[#35685b] text-white"
                              : "border-[#1e2923]/20 bg-white text-transparent",
                          )}
                        >
                          ✓
                          <input
                            className="sr-only"
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => {
                              const nextChecked = e.target.checked;
                              setData({
                                ...data,
                                items: data.items.map((i) =>
                                  i.name === item.name ? { ...i, checked: nextChecked } : i,
                                ),
                              });
                              void toggleGroceryItem({ data: { name: item.name, checked: nextChecked } });
                            }}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-2xl leading-tight">{item.name}</span>
                          <span className="mt-1 block truncate text-xs text-[#8a928d]">{item.source}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[#f4efe5] px-3 py-1.5 text-xs font-medium text-[#6c756f]">
                          {item.qty}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
