import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { cookAnotherPlate, getMealWeek, swapMeal, toggleFavoriteRecipe } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { altFor } from "@/lib/landing";
import type { Recipe } from "@/lib/content/catalog";

export const Route = createFileRoute("/app/meals")({ component: Meals });

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function todayWeekday() {
  const d = new Date().getDay();
  return WEEKDAYS[d === 0 ? 6 : d - 1];
}

function Meals() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMealWeek>> | null>(null);
  const [swapDay, setSwapDay] = useState<string | null>(null);
  const [want, setWant] = useState("");
  const [openDay, setOpenDay] = useState<string | null>(todayWeekday());
  const [reading, setReading] = useState<string | null>(null);
  const [busyDay, setBusyDay] = useState<string | null>(null);

  function reload() {
    return getMealWeek().then(setData);
  }

  useEffect(() => {
    void reload();
  }, []);

  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Planning the week…</p>;

  async function startRecipe(day: string) {
    setBusyDay(day);
    try {
      const result = await cookAnotherPlate({ data: { day, want: want.trim() || undefined } });
      await reload();
      setOpenDay(day);
      setWant("");
      if (result.quotaNote) toast.message(result.quotaNote);
      toast.success(`${result.recipe.title} is on ${day}. Tap it to see how to make it.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start that recipe.");
    } finally {
      setBusyDay(null);
    }
  }

  const asking = want.trim().length > 0;

  return (
    <div>
      <RoomHero
        kicker="Nourishment"
        title="This week's table"
        body={
          data.place
            ? `Built from your stage, diets, loves, and the market near ${data.place}. Tap any plate to see how to make it.`
            : "Built from your stage, diets, and loves. Tap any plate to see how to make it."
        }
        src="/images/meal-bowl.jpg"
        alt={altFor("/images/meal-bowl.jpg")}
        tone="clay"
      />
      <RoomBody className="pb-4">
        <form
          className="kitchen-ask"
          onSubmit={(e) => {
            e.preventDefault();
            const day = data.meals.find((m) => m.day === todayWeekday())?.day ?? data.meals[0]?.day ?? "Mon";
            void startRecipe(day);
          }}
        >
          <Input
            value={want}
            onChange={(e) => setWant(e.target.value)}
            placeholder="What does her body want? Ginger broth, a Ghanaian stew, something she can eat in bed…"
          />
          <Button type="submit" variant="clay" disabled={Boolean(busyDay)}>
            {busyDay ? (asking ? "Creating…" : "Starting…") : asking ? "Create recipe" : "Start recipe"}
          </Button>
        </form>
        {!data.aiReady ? (
          <p className="mt-4 text-sm text-ink-soft">
            Original recipes need a ChatGPT key in Vercel. Until then, start any plate from the house catalog — it does not run out.
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            {data.ai.recipesLeft} original {data.ai.recipesLeft === 1 ? "recipe" : "recipes"} left today. The catalog stays
            open, and never uses the key.
          </p>
        )}
      </RoomBody>
      <div>
        {data.meals.map((m, i) => {
          const open = openDay === m.day;
          return (
            <article key={m.day} className="grid min-h-[70vh] lg:grid-cols-2 lg:min-h-[78vh]">
              <button
                type="button"
                className={
                  i % 2 === 1
                    ? "relative min-h-[48vh] lg:order-2 lg:min-h-[78vh]"
                    : "relative min-h-[48vh] lg:min-h-[78vh]"
                }
                onClick={() => setOpenDay(open ? null : m.day)}
                aria-expanded={open}
                aria-label={`How to make ${m.recipe.title}`}
              >
                <img
                  src={m.recipe.image}
                  alt={altFor(m.recipe.image, m.recipe.title)}
                  className="media absolute inset-0 h-full w-full object-cover"
                />
              </button>
              <div className="flex flex-col justify-center bg-wash-clay px-5 py-16 md:px-16">
                <p className="text-xs uppercase tracking-[0.28em] text-clay">{m.day}</p>
                <button type="button" className="mt-5 text-left" onClick={() => setOpenDay(open ? null : m.day)}>
                  <h2 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02]">{m.recipe.title}</h2>
                </button>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{m.recipe.summary}</p>
                <p className="mt-4 max-w-md text-base italic text-earth">{m.recipe.why}</p>
                <p className="mt-6 text-sm text-muted-foreground">
                  {m.recipe.minutes} min · {m.recipe.servings} servings
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="sm" variant="outline" onClick={() => setSwapDay(swapDay === m.day ? null : m.day)}>
                    Swap recipe
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void toggleFavoriteRecipe({ data: { recipeId: m.recipe.id } }).then((r) =>
                        toast.success(r.favorite ? "Saved to your favorites." : "Removed from favorites."),
                      )
                    }
                  >
                    Save
                  </Button>
                </div>
                {open ? (
                  <>
                    <RecipeSheet recipe={m.recipe} />
                    <button type="button" className="mt-4 text-sm text-ink-soft" onClick={() => setOpenDay(null)}>
                      Hide method
                    </button>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-clay">Tap the photo or the name to see how to make it.</p>
                )}
                {swapDay === m.day ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {data.catalog.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="swap-plate"
                        onClick={() => {
                          void swapMeal({ data: { day: m.day, recipeId: r.id } }).then(() => reload());
                          setSwapDay(null);
                          setOpenDay(m.day);
                        }}
                      >
                        <img src={r.image} alt={altFor(r.image, r.title)} className="swap-plate-photo" />
                        <span className="swap-plate-copy">
                          <span className="swap-plate-title">{r.title}</span>
                          <span className="swap-plate-meta">{r.minutes} min</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <RoomBody>
        <p className="text-xs uppercase tracking-[0.32em] text-clay">The kitchen</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)]">A house catalog — tap any recipe to cook it</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Each card opens the ingredients and method. Put one on today, or create a recipe above. Recipes never diagnose, and they respect the allergies you already shared.
        </p>
        <div className="kitchen-grid mt-10">
          {data.catalog.map((r) => {
            const open = reading === r.id;
            return (
              <article key={r.id} className="kitchen-card">
                <button
                  type="button"
                  className="kitchen-card-photo"
                  onClick={() => setReading(open ? null : r.id)}
                  aria-expanded={open}
                  aria-label={`How to make ${r.title}`}
                >
                  <img src={r.image} alt={altFor(r.image, r.title)} />
                </button>
                <div className="kitchen-card-body">
                  <p className="text-xs uppercase tracking-[0.22em] text-earth">{r.minutes} min</p>
                  <button type="button" className="mt-2 text-left" onClick={() => setReading(open ? null : r.id)}>
                    <h3 className="font-display text-2xl leading-tight">{r.title}</h3>
                  </button>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.summary}</p>
                  {open ? <RecipeSheet recipe={r} /> : null}
                  <button
                    type="button"
                    className="mt-4 text-sm text-clay underline-offset-4 hover:underline"
                    onClick={() => {
                      const today = data.meals.find((m) => m.day === todayWeekday())?.day ?? data.meals[0]?.day ?? "Mon";
                      void swapMeal({ data: { day: today, recipeId: r.id } }).then(() => {
                        toast.success(`${r.title} is on ${today}.`);
                        setOpenDay(today);
                        return reload();
                      });
                    }}
                  >
                    Put on today
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </RoomBody>
    </div>
  );
}

function RecipeSheet({ recipe }: { recipe: Recipe }) {
  return (
    <div className="recipe-sheet mt-8">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Ingredients</p>
      <ul className="mt-3 space-y-1.5">
        {(recipe.ingredients ?? []).map((ing) => (
          <li key={ing.name} className="text-sm text-ink">
            {ing.name}
            <span className="text-ink-soft"> · {ing.qty}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs uppercase tracking-[0.28em] text-gold">Method</p>
      <ol className="mt-3 space-y-2">
        {(recipe.steps ?? []).map((step, i) => (
          <li key={i} className="text-sm leading-relaxed text-ink-soft">
            {i + 1}. {step}
          </li>
        ))}
      </ol>
      {!recipe.steps?.length ? (
        <p className="mt-3 text-sm text-ink-soft">This plate is still gathering its method. Swap to a catalog recipe, or create one with a few words above.</p>
      ) : null}
    </div>
  );
}
