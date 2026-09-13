import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getMealWeek, swapMeal, toggleFavoriteRecipe } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { altFor } from "@/lib/landing";
import { RECIPE_IMAGE_ALT, type Recipe } from "@/lib/content/catalog";
import { useT } from "@/lib/i18n/provider";

export const Route = createFileRoute("/app/meals")({ component: Meals });

function todayDay() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()] ?? "Mon";
}

function Meals() {
  const t = useT();
  const [data, setData] = useState<Awaited<ReturnType<typeof getMealWeek>> | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(todayDay());
  const [swapDay, setSwapDay] = useState<string | null>(null);
  const [openLibrary, setOpenLibrary] = useState<string | null>(null);

  useEffect(() => {
    void getMealWeek().then(setData);
  }, []);

  const todayMeal = useMemo(() => data?.meals.find((m) => m.day === todayDay()) ?? data?.meals[0], [data]);

  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">{t("meals.planning")}</p>;

  return (
    <div>
      <RoomHero
        kicker={t("meals.kicker")}
        title={t("meals.title")}
        body={t("meals.body")}
        src={todayMeal?.recipe.image ?? "/images/meal-bowl.jpg"}
        alt={RECIPE_IMAGE_ALT[todayMeal?.recipe.image ?? ""] ?? altFor("/images/meal-bowl.jpg")}
        tone="clay"
      />

      <div>
        {data.meals.map((m, i) => {
          const open = openDay === m.day;
          return (
            <article key={m.day} className="border-b border-border">
              <div className="grid lg:grid-cols-2">
                <button
                  type="button"
                  className={i % 2 === 1 ? "relative min-h-[42vh] lg:order-2 lg:min-h-[72vh]" : "relative min-h-[42vh] lg:min-h-[72vh]"}
                  onClick={() => setOpenDay(open ? null : m.day)}
                  aria-expanded={open}
                >
                  <img
                    src={m.recipe.image}
                    alt={RECIPE_IMAGE_ALT[m.recipe.image] ?? m.recipe.title}
                    className="media absolute inset-0 h-full w-full object-cover"
                  />
                </button>
                <div className="flex flex-col justify-center bg-wash-clay px-5 py-14 md:px-16">
                  <p className="text-xs uppercase tracking-[0.28em] text-clay">{m.day}</p>
                  <button type="button" className="text-left" onClick={() => setOpenDay(open ? null : m.day)}>
                    <h2 className="mt-5 font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02]">{m.recipe.title}</h2>
                  </button>
                  <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{m.recipe.summary}</p>
                  <p className="mt-4 max-w-md text-base italic text-earth">{m.recipe.why}</p>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {t("meals.minutes", { n: m.recipe.minutes })} · {t("meals.servings", { n: m.recipe.servings })}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button size="sm" variant="gold" onClick={() => setOpenDay(open ? null : m.day)}>
                      {open ? t("meals.close") : t("meals.how")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSwapDay(swapDay === m.day ? null : m.day)}>
                      {t("meals.swap")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void toggleFavoriteRecipe({ data: { recipeId: m.recipe.id } }).then((r) =>
                          toast.success(r.favorite ? t("meals.saved") : t("meals.removed")),
                        )
                      }
                    >
                      {t("meals.save")}
                    </Button>
                  </div>
                  {open ? <RecipeMethod recipe={m.recipe} /> : null}
                  {swapDay === m.day ? (
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {data.catalog.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="kitchen-card overflow-hidden rounded-2xl bg-secondary text-left"
                          onClick={() => {
                            void swapMeal({ data: { day: m.day, recipeId: r.id } }).then(() => getMealWeek().then(setData));
                            setSwapDay(null);
                            setOpenDay(m.day);
                          }}
                        >
                          <img src={r.image} alt={RECIPE_IMAGE_ALT[r.image] ?? r.title} className="h-28 w-full object-cover" />
                          <span className="block px-3 py-3 text-sm">{r.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <RoomBody>
        <p className="text-xs uppercase tracking-[0.28em] text-clay">{t("meals.start")}</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.4rem)]">{t("meals.library")}</h2>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">{t("meals.libraryBody")}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.catalog.map((r) => {
            const open = openLibrary === r.id;
            return (
              <article key={r.id} className="kitchen-card overflow-hidden rounded-[28px] bg-wash-clay">
                <button type="button" className="w-full text-left" onClick={() => setOpenLibrary(open ? null : r.id)}>
                  <img src={r.image} alt={RECIPE_IMAGE_ALT[r.image] ?? r.title} className="h-44 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="font-display text-2xl leading-snug">{r.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{r.summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-clay">{t("meals.how")}</p>
                  </div>
                </button>
                {open ? (
                  <div className="px-5 pb-6">
                    <RecipeMethod recipe={r} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </RoomBody>
    </div>
  );
}

function RecipeMethod({ recipe }: { recipe: Recipe }) {
  const t = useT();
  return (
    <div className="mt-8 max-w-md">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{t("meals.ingredients")}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {recipe.ingredients.map((ing) => (
          <li key={ing.name} className="flex justify-between gap-4 border-b border-border/60 py-1.5">
            <span>{ing.name}</span>
            <span className="text-muted-foreground">{ing.qty}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-gold">{t("meals.method")}</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-6 text-sm italic text-earth">
        {t("meals.why")} — {recipe.why}
      </p>
    </div>
  );
}
