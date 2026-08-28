import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { RECIPES, recipesFor, type Stage } from "@/lib/content/catalog";
import { asJson } from "./json";
import { ensureProfile } from "./profile";

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

export const getMealWeek = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    const diet = await sql<{ diets: unknown; dislikes: string | null; allergies: unknown }>`
      select diets, dislikes, allergies from dietary_profiles where user_id = ${context.userId}
    `;
    const grocery = await sql<{ stores: unknown }>`select stores from grocery_preferences where user_id = ${context.userId}`;
    const weekStart = startOfWeekISO();
    const existing = await sql<{ meals: unknown }>`
      select meals from meal_plans where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const diets = asJson<string[]>(diet[0]?.diets, []);
    const pool = recipesFor(profile.stage as Stage | null, diets, diet[0]?.dislikes ?? "");
    const source = pool.length ? pool : RECIPES;
    let meals = asJson<{ day: string; recipeId: string }[]>(existing[0]?.meals, []);
    if (!meals.length) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      meals = days.map((day, i) => ({ day, recipeId: source[i % source.length].id }));
      await sql`
        insert into meal_plans (user_id, week_start, meals)
        values (${context.userId}, ${weekStart}, ${JSON.stringify(meals)}::jsonb)
        on conflict (user_id, week_start) do update set meals = excluded.meals
      `;
    }
    const recipeMap = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
    const detailed = meals.map((m) => ({ ...m, recipe: recipeMap[m.recipeId] ?? RECIPES[0] }));
    const stores = asJson<string[]>(grocery[0]?.stores, []);
    return {
      weekStart,
      meals: detailed,
      stores,
      diets,
      allergies: asJson<string[]>(diet[0]?.allergies, []),
      catalog: RECIPES,
    };
  });

export const swapMeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { day: string; recipeId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const weekStart = startOfWeekISO();
    const existing = await sql<{ meals: unknown }>`
      select meals from meal_plans where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const meals = asJson<{ day: string; recipeId: string }[]>(existing[0]?.meals, []);
    const next = meals.map((m) => (m.day === data.day ? { ...m, recipeId: data.recipeId } : m));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(next)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
    return { ok: true };
  });

export const getGroceryList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const weekStart = startOfWeekISO();
    const plan = await sql<{ meals: unknown }>`
      select meals from meal_plans where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const meals = asJson<{ day: string; recipeId: string }[]>(plan[0]?.meals, []);
    const recipeMap = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
    const items: { name: string; qty: string; dept: string; checked: boolean }[] = [];
    for (const m of meals) {
      const recipe = recipeMap[m.recipeId];
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const found = items.find((i) => i.name === ing.name);
        if (found) continue;
        items.push({ name: ing.name, qty: ing.qty, dept: ing.dept, checked: false });
      }
    }
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const prev = asJson<typeof items>(saved[0]?.items, []);
    const merged = items.map((item) => ({
      ...item,
      checked: prev.find((p) => p.name === item.name)?.checked ?? false,
    }));
    if (!saved[0]) {
      await sql`
        insert into grocery_lists (user_id, week_start, items)
        values (${context.userId}, ${weekStart}, ${JSON.stringify(merged)}::jsonb)
        on conflict (user_id, week_start) do nothing
      `;
    }
    const stores = await sql<{ stores: unknown }>`select stores from grocery_preferences where user_id = ${context.userId}`;
    return { weekStart, items: merged, stores: asJson<string[]>(stores[0]?.stores, []) };
  });

export const toggleGroceryItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; checked: boolean }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const weekStart = startOfWeekISO();
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const items = asJson<{ name: string; qty: string; dept: string; checked: boolean }[]>(saved[0]?.items, []);
    const next = items.map((i) => (i.name === data.name ? { ...i, checked: data.checked } : i));
    await sql`
      insert into grocery_lists (user_id, week_start, items)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(next)}::jsonb)
      on conflict (user_id, week_start) do update set items = excluded.items
    `;
    return { ok: true };
  });

export const listPantry = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: number;
      name: string;
      quantity: string;
      unit: string;
      estimated: boolean;
      low: boolean;
    }>`select id, name, quantity::text as quantity, unit, estimated, low from pantry_items where user_id = ${context.userId} order by name`;
  });

export const upsertPantry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: number; name: string; quantity: number; unit: string; low?: boolean }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`
        update pantry_items set name = ${data.name}, quantity = ${data.quantity}, unit = ${data.unit},
          low = ${Boolean(data.low)}, estimated = false, updated_at = now()
        where id = ${data.id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into pantry_items (user_id, name, quantity, unit, estimated, low)
        values (${context.userId}, ${data.name}, ${data.quantity}, ${data.unit}, false, ${Boolean(data.low)})
      `;
    }
    return { ok: true };
  });

export const removePantry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from pantry_items where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const toggleFavoriteRecipe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { recipeId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ recipe_id: string }>`
      select recipe_id from saved_recipes where user_id = ${context.userId} and recipe_id = ${data.recipeId}
    `;
    if (existing[0]) {
      await sql`delete from saved_recipes where user_id = ${context.userId} and recipe_id = ${data.recipeId}`;
      return { favorite: false };
    }
    await sql`insert into saved_recipes (user_id, recipe_id) values (${context.userId}, ${data.recipeId})`;
    return { favorite: true };
  });
