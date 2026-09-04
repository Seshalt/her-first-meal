import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { getMealWeek, swapMeal, toggleFavoriteRecipe, cookAnotherPlate } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/meals")({ component: Meals });

function Meals() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMealWeek>> | null>(null);
  const [swapDay, setSwapDay] = useState<string | null>(null);

  useEffect(() => {
    void getMealWeek().then(setData);
  }, []);

  if (!data) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Planning the week…</p>;

  return (
    <div>
      <RoomHero
        kicker="Nourishment"
        title="This week's table"
        body="Built from your stage, diets, and loves. Swap any plate. Ask Nouri if you want a rewrite."
        src="/images/meal-bowl.jpg"
        alt="A nourishing bowl set on linen"
        tone="clay"
      />
      <div>
        {data.meals.map((m, i) => (
          <article key={m.day} className="grid min-h-[70vh] lg:grid-cols-2 lg:min-h-[78vh]">
            <div className={i % 2 === 1 ? "relative min-h-[48vh] lg:order-2 lg:min-h-[78vh]" : "relative min-h-[48vh] lg:min-h-[78vh]"}>
              <img src={m.recipe.image} alt="" className="media absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center bg-wash-clay px-5 py-16 md:px-16">
              <p className="text-xs uppercase tracking-[0.28em] text-clay">{m.day}</p>
              <h2 className="mt-5 font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02]">{m.recipe.title}</h2>
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void cookAnotherPlate({ data: { day: m.day } })
                      .then(() => getMealWeek().then(setData))
                      .then(() => toast.success("A new plate is on the table."))
                      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not cook another plate."))
                  }
                >
                  Cook another plate
                </Button>
              </div>
              {swapDay === m.day ? (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {data.catalog.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="rounded-xl bg-secondary px-3 py-3 text-left text-sm"
                      onClick={() => {
                        void swapMeal({ data: { day: m.day, recipeId: r.id } }).then(() => getMealWeek().then(setData));
                        setSwapDay(null);
                      }}
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <RoomBody className="pt-0">
        <p className="text-sm text-muted-foreground">Ask Nouri if a plate needs rewriting for this week.</p>
      </RoomBody>
    </div>
  );
}
