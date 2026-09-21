import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { RECIPES, recipePool, type Recipe, type Stage } from "@/lib/content/catalog";
import { PANTRY_STAPLES, seasonalProduce } from "@/lib/content/places";
import { asJson } from "./json";
import { ensureProfile } from "./profile";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

type MealSlot = { day: string; recipeId: string };

async function dietRow(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const diet = await sql<{ diets: unknown; dislikes: string | null; allergies: unknown }>`
    select diets, dislikes, allergies from dietary_profiles where user_id = ${userId}
  `;
  return {
    diets: asJson<string[]>(diet[0]?.diets, []),
    dislikes: diet[0]?.dislikes ?? "",
    allergies: asJson<string[]>(diet[0]?.allergies, []),
  };
}

export async function rebuildMealWeek(userId: string) {
  const sql = await getSql();
  const profile = await ensureProfile(userId);
  const diet = await dietRow(sql, userId);
  const pool = recipePool(profile.stage as Stage | null, diet.diets, diet.dislikes);
  const weekStart = startOfWeekISO();
  const meals: MealSlot[] = DAYS.map((day, i) => ({ day, recipeId: pool[i % pool.length].id }));
  await sql`
    insert into meal_plans (user_id, week_start, meals)
    values (${userId}, ${weekStart}, ${JSON.stringify(meals)}::jsonb)
    on conflict (user_id, week_start) do update set meals = excluded.meals
  `;
  await sql`delete from grocery_lists where user_id = ${userId} and week_start = ${weekStart}`;
  return meals;
}

async function ensureMealWeek(userId: string) {
  const sql = await getSql();
  const profile = await ensureProfile(userId);
  const diet = await dietRow(sql, userId);
  const pool = recipePool(profile.stage as Stage | null, diet.diets, diet.dislikes);
  const allowed = new Set(pool.map((r) => r.id));
  const weekStart = startOfWeekISO();
  const existing = await sql<{ meals: unknown }>`
    select meals from meal_plans where user_id = ${userId} and week_start = ${weekStart}
  `;
  let meals = asJson<MealSlot[]>(existing[0]?.meals, []);
  const stale = !meals.length || meals.some((m) => !allowed.has(m.recipeId));
  if (stale) {
    meals = DAYS.map((day, i) => ({ day, recipeId: pool[i % pool.length].id }));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${userId}, ${weekStart}, ${JSON.stringify(meals)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
  }
  return { meals, pool, diet, profile, weekStart };
}

export const getMealWeek = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { meals, pool, diet, profile, weekStart } = await ensureMealWeek(context.userId);
    const recipeMap: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
    const detailed = meals.map((m) => ({
      ...m,
      recipe: recipeMap[m.recipeId] ?? pool[0] ?? RECIPES[0],
    }));
    const grocery = await sql<{ stores: unknown }>`select stores from grocery_preferences where user_id = ${context.userId}`;
    return {
      weekStart,
      meals: detailed,
      stores: asJson<string[]>(grocery[0]?.stores, []),
      diets: diet.diets,
      allergies: diet.allergies,
      catalog: pool,
      library: pool,
      stage: profile.stage,
      stateCode: profile.stateCode,
    };
  });

export const swapMeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { day: string; recipeId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!RECIPES.some((r) => r.id === data.recipeId)) return { ok: false };
    const { meals, weekStart } = await ensureMealWeek(context.userId);
    const next = meals.map((m) => (m.day === data.day ? { day: data.day, recipeId: data.recipeId } : m));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(next)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
    await sql`delete from grocery_lists where user_id = ${context.userId} and week_start = ${weekStart}`;
    return { ok: true };
  });

export const rebuildThisWeek = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await rebuildMealWeek(context.userId);
    return { ok: true };
  });

export const getGroceryList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { meals, profile, weekStart } = await ensureMealWeek(context.userId);
    const recipeMap = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
    const pantry = await sql<{ name: string }>`select name from pantry_items where user_id = ${context.userId}`;
    const pantryNames = new Set(pantry.map((p) => p.name.toLowerCase()));
    const items: { name: string; qty: string; dept: string; checked: boolean; source: string }[] = [];
    function add(name: string, qty: string, dept: string, source: string) {
      const found = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
      if (found) return;
      if (pantryNames.has(name.toLowerCase())) return;
      items.push({ name, qty, dept, checked: false, source });
    }
    for (const m of meals) {
      const recipe = recipeMap[m.recipeId];
      if (!recipe) continue;
      for (const ing of recipe.ingredients) add(ing.name, ing.qty, ing.dept, recipe.title);
    }
    for (const produce of seasonalProduce(profile.stateCode)) {
      add(produce.name, produce.qty, produce.dept, "seasonal");
    }
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const prev = asJson<typeof items>(saved[0]?.items, []);
    const merged = items.map((item) => ({
      ...item,
      checked: prev.find((p) => p.name === item.name)?.checked ?? false,
    }));
    await sql`
      insert into grocery_lists (user_id, week_start, items)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(merged)}::jsonb)
      on conflict (user_id, week_start) do update set items = excluded.items
    `;
    const stores = await sql<{ stores: unknown; appliances: unknown }>`
      select stores, appliances from grocery_preferences where user_id = ${context.userId}
    `;
    return {
      weekStart,
      items: merged,
      stores: asJson<string[]>(stores[0]?.stores, []),
      appliances: asJson<string[]>(stores[0]?.appliances, []),
      stateCode: profile.stateCode,
      location: profile.location,
      stage: profile.stage,
    };
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

export const stockPantryStaples = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ name: string }>`select name from pantry_items where user_id = ${context.userId}`;
    const have = new Set(existing.map((r) => r.name.toLowerCase()));
    for (const item of PANTRY_STAPLES) {
      if (have.has(item.name.toLowerCase())) continue;
      await sql`
        insert into pantry_items (user_id, name, quantity, unit, estimated, low)
        values (${context.userId}, ${item.name}, 1, ${item.qty}, true, false)
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
