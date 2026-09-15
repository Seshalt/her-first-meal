import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getMealWeek, swapMeal, toggleFavoriteRecipe } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { CoverFlowCarousel, type CoverFlowItem } from "@/components/ui/3-d-coverflow-carousel";
import { altFor } from "@/lib/landing";
import { RECIPE_IMAGE_ALT, STAGE_LABEL, type Recipe } from "@/lib/content/catalog";
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
  const recipeSlides = useMemo<CoverFlowItem[]>(
    () =>
      (data?.catalog ?? []).map((recipe) => ({
        id: recipe.id,
        tag: recipe.diets.slice(0, 2).join(" · ") || "Her First Meal",
        title: recipe.title,
        subtitle: recipe.stage[0] ? STAGE_LABEL[recipe.stage[0]] : "Built-in recipe",
        description: recipe.summary,
        image: recipe.image,
        alt: RECIPE_IMAGE_ALT[recipe.image] ?? recipe.title,
        meta: `${recipe.minutes} min · ${recipe.servings} servings`,
        ctaText: "Open recipe",
      })),
    [data],
  );
  const selectedLibraryRecipe = useMemo(
    () => (openLibrary ? data?.catalog.find((recipe) => recipe.id === openLibrary) ?? null : null),
    [data, openLibrary],
  );

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
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)]">{t("meals.library")}</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t("meals.libraryBody")}</p>
          </div>
          <p className="rounded-full border border-border bg-background/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {data.catalog.length} built-in recipes
          </p>
        </div>

        <CoverFlowCarousel
          className="mt-10"
          items={recipeSlides}
          sectionLabel="Explore the recipe library"
          onCtaClick={(item) => {
            setOpenLibrary(item.id);
            window.requestAnimationFrame(() => {
              document.getElementById("recipe-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        />

        {selectedLibraryRecipe ? (
          <article id="recipe-detail" className="mt-8 scroll-mt-28 overflow-hidden rounded-[32px] border border-border bg-wash-clay shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
              <div className="relative min-h-[360px] lg:min-h-[620px]">
                <img
                  src={selectedLibraryRecipe.image}
                  alt={RECIPE_IMAGE_ALT[selectedLibraryRecipe.image] ?? selectedLibraryRecipe.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent lg:bg-gradient-to-r" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:hidden">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Recipe selected</p>
                  <h3 className="mt-2 font-display text-4xl leading-none">{selectedLibraryRecipe.title}</h3>
                </div>
              </div>
              <div className="p-6 md:p-10 lg:p-12">
                <p className="text-xs uppercase tracking-[0.24em] text-clay">Recipe selected</p>
                <h3 className="mt-3 hidden font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[.92] lg:block">
                  {selectedLibraryRecipe.title}
                </h3>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{selectedLibraryRecipe.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedLibraryRecipe.diets.map((diet) => (
                    <span key={diet} className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs capitalize text-ink-soft">
                      {diet}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() =>
                      void toggleFavoriteRecipe({ data: { recipeId: selectedLibraryRecipe.id } }).then((r) =>
                        toast.success(r.favorite ? t("meals.saved") : t("meals.removed")),
                      )
                    }
                  >
                    {t("meals.save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpenLibrary(null)}>
                    {t("meals.close")}
                  </Button>
                </div>
                <RecipeMethod recipe={selectedLibraryRecipe} />
              </div>
            </div>
          </article>
        ) : null}
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
