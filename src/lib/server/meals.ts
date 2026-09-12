import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  PANTRY_STAPLES,
  RECIPES,
  SEASONAL_PRODUCE,
  recipesFor,
  recipePhoto,
  type Recipe,
  type Stage,
} from "@/lib/content/catalog";
import { asJson } from "./json";
import { ensureProfile } from "./profile";
import { houseAiReady, houseChat } from "./openai";
import { uid } from "@/lib/utils";
import type { Profile } from "./types";
import { peekAiQuota, quotaMessage, takeAiTurn } from "./ai-quota";

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

type MealSlot = { day: string; recipeId: string; recipe?: Recipe };

function recipeFromSlot(m: MealSlot, recipeMap: Record<string, Recipe>): Recipe | null {
  if (m.recipe && Array.isArray(m.recipe.ingredients)) return m.recipe;
  return recipeMap[m.recipeId] ?? null;
}

function placeLine(profile: Profile) {
  return [profile.city, profile.location, profile.zipCode].filter(Boolean).join(" · ") || "";
}

async function ensureMealWeek(sql: Sql, userId: string) {
  const profile = await ensureProfile(userId);
  const diet = await sql<{ diets: unknown; dislikes: string | null; allergies: unknown }>`
    select diets, dislikes, allergies from dietary_profiles where user_id = ${userId}
  `;
  const grocery = await sql<{ stores: unknown }>`select stores from grocery_preferences where user_id = ${userId}`;
  const weekStart = startOfWeekISO();
  const existing = await sql<{ meals: unknown }>`
    select meals from meal_plans where user_id = ${userId} and week_start = ${weekStart}
  `;
  const diets = asJson<string[]>(diet[0]?.diets, []);
  const pool = recipesFor(profile.stage as Stage | null, diets, diet[0]?.dislikes ?? "");
  const source = pool.length ? pool : RECIPES;
  let meals = asJson<MealSlot[]>(existing[0]?.meals, []);
  if (!meals.length) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    meals = days.map((day, i) => ({ day, recipeId: source[i % source.length].id }));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${userId}, ${weekStart}, ${JSON.stringify(meals)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
  }
  const recipeMap: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
  const detailed = meals.map((m) => {
    const recipe = recipeFromSlot(m, recipeMap) ?? RECIPES[0];
    return { ...m, recipe };
  });
  const stores = asJson<string[]>(grocery[0]?.stores, []);
  return {
    weekStart,
    meals: detailed,
    stores,
    diets,
    allergies: asJson<string[]>(diet[0]?.allergies, []),
    catalog: RECIPES,
    profile,
    aiReady: houseAiReady(),
    place: placeLine(profile),
    ai: await peekAiQuota(userId),
  };
}

function kitchenNotes(profile: Profile, extras: string[]) {
  return [
    `Stage: ${profile.stage ?? "unspecified"}`,
    `Location: ${placeLine(profile) || "not shared"}`,
    ...extras,
  ].join("\n");
}

export const getMealWeek = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const week = await ensureMealWeek(sql, context.userId);
    return {
      weekStart: week.weekStart,
      meals: week.meals,
      stores: week.stores,
      diets: week.diets,
      allergies: week.allergies,
      catalog: week.catalog,
      aiReady: week.aiReady,
      place: week.place,
      ai: week.ai,
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
    const meals = asJson<MealSlot[]>(existing[0]?.meals, []);
    const next = meals.map((m) => (m.day === data.day ? { day: m.day, recipeId: data.recipeId } : m));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(next)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
    return { ok: true };
  });

function fallbackPlate(profile: Profile, usedIds: string[], want?: string): Recipe {
  const unused = RECIPES.filter((r) => !usedIds.includes(r.id));
  const pool = unused.length ? unused : RECIPES;
  const stagePool = profile.stage
    ? pool.filter((r) => r.stage.includes(profile.stage as Stage))
    : pool;
  const source = stagePool.length ? stagePool : pool;
  const pick = source[Math.floor(Math.random() * source.length)] ?? RECIPES[0];
  return {
    ...pick,
    summary: want
      ? `A house recipe close to “${want.slice(0, 80)}.”`
      : pick.summary,
  };
}

function imageForGenerated(title: string, ingredients: { name?: string }[]): string {
  const blob = `${title} ${ingredients.map((i) => i.name ?? "").join(" ")}`.toLowerCase();
  const hits: [string, string][] = [
    ["salmon", "salmon-dill"],
    ["fish", "coconut-fish"],
    ["oat", "oat-restore"],
    ["pancake", "banana-oat-cakes"],
    ["banana", "banana-oat-cakes"],
    ["avocado", "soft-egg-toast"],
    ["toast", "soft-egg-toast"],
    ["egg", "herb-frittata"],
    ["lentil", "golden-lentil"],
    ["chickpea", "chickpea-spinach"],
    ["chili", "turkey-chili"],
    ["bean", "black-bean"],
    ["orzo", "chicken-orzo"],
    ["chicken", "sheet-chicken-squash"],
    ["jollof", "jollof-greens"],
    ["rice porridge", "rice-porridge"],
    ["congee", "rice-porridge"],
    ["quinoa", "quinoa-black-bean"],
    ["apple", "apple-quinoa"],
    ["sweet potato", "miso-sweet-potato"],
    ["beet", "beet-citrus"],
    ["date", "tahini-dates"],
    ["ginger", "ginger-broth"],
    ["broth", "ginger-broth"],
    ["porridge", "cornmeal-porridge"],
  ];
  for (const [key, id] of hits) {
    if (blob.includes(key)) return recipePhoto(id);
  }
  return recipePhoto("golden-lentil");
}

export const cookAnotherPlate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { day: string; want?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    const diet = await sql<{
      diets: unknown;
      allergies: unknown;
      avoids: string | null;
      loves: string | null;
    }>`select diets, allergies, avoids, loves from dietary_profiles where user_id = ${context.userId}`;
    const weekStart = startOfWeekISO();
    const existing = await sql<{ meals: unknown }>`
      select meals from meal_plans where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const meals = asJson<MealSlot[]>(existing[0]?.meals, []);
    const usedIds = meals.map((m) => m.recipeId);
    const want = data.want?.trim();
    let raw: string | null = null;
    let quotaNote: string | null = null;
    if (want && houseAiReady()) {
      const turn = await takeAiTurn(context.userId, "recipes");
      if (turn.ok) {
        raw = await houseChat({
          json: true,
          maxTokens: 900,
          system:
            "Write one original pregnancy or postpartum recipe as JSON with keys: title, summary, minutes, servings, why, ingredients (array of {name, qty, dept}), steps (string array). Soft, maternal, practical. Never diagnose. Respect allergies. No alcohol. No raw fish or unpasteurized dairy. Prefer ingredients she can find at ordinary grocery stores near the given location.",
          messages: [
            {
              role: "user",
              content: kitchenNotes(profile, [
                `Diets: ${asJson<string[]>(diet[0]?.diets, []).join(", ") || "none"}`,
                `Allergies: ${asJson<string[]>(diet[0]?.allergies, []).join(", ") || "none"}`,
                `Avoids: ${diet[0]?.avoids ?? "none"}`,
                `Loves: ${diet[0]?.loves ?? "none"}`,
                `She asked for: ${want.slice(0, 240)}`,
              ]),
            },
          ],
        });
      } else {
        quotaNote = quotaMessage("recipes");
      }
    }
    let recipe: Recipe;
    if (raw) {
      let parsed: Partial<Recipe> = {};
      try {
        parsed = JSON.parse(raw) as Partial<Recipe>;
      } catch {
        parsed = {};
      }
      const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
      recipe = {
        id: uid("plate"),
        title: parsed.title || "A quiet bowl",
        summary: parsed.summary || "A simple plate for this hour.",
        stage: profile.stage ? [profile.stage as Stage] : ["postpartum"],
        diets: asJson<Recipe["diets"]>(parsed.diets, []),
        minutes: Number(parsed.minutes ?? 30),
        servings: Number(parsed.servings ?? 2),
        image: imageForGenerated(parsed.title || want || "", ingredients),
        department: "kitchen",
        ingredients,
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        why: parsed.why || "Made for her table today.",
      };
    } else {
      recipe = fallbackPlate(profile, usedIds, want);
    }
    const next = meals.map((m) => (m.day === data.day ? { day: data.day, recipeId: recipe.id, recipe } : m));
    await sql`
      insert into meal_plans (user_id, week_start, meals)
      values (${context.userId}, ${weekStart}, ${JSON.stringify(next)}::jsonb)
      on conflict (user_id, week_start) do update set meals = excluded.meals
    `;
    return { ok: true, recipe, original: Boolean(raw), quotaNote };
  });

type GroceryItem = { name: string; qty: string; dept: string; checked: boolean; from?: string };

function listFromMeals(meals: MealSlot[], pantryNames: Set<string>): GroceryItem[] {
  const recipeMap = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
  const items: GroceryItem[] = [];
  for (const m of meals) {
    const recipe = recipeFromSlot(m, recipeMap);
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const key = ing.name.trim().toLowerCase();
      if (pantryNames.has(key)) continue;
      const found = items.find((i) => i.name.toLowerCase() === key);
      if (found) continue;
      items.push({ name: ing.name, qty: ing.qty, dept: ing.dept || "Other", checked: false, from: recipe.title });
    }
  }
  return items;
}

async function persistGrocery(sql: Sql, userId: string, weekStart: string, items: GroceryItem[]) {
  await sql`
    insert into grocery_lists (user_id, week_start, items)
    values (${userId}, ${weekStart}, ${JSON.stringify(items)}::jsonb)
    on conflict (user_id, week_start) do update set items = excluded.items
  `;
}

export const getGroceryList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const week = await ensureMealWeek(sql, context.userId);
    const pantry = await sql<{ name: string }>`select name from pantry_items where user_id = ${context.userId}`;
    const pantryNames = new Set(pantry.map((p) => p.name.trim().toLowerCase()));
    const built = listFromMeals(week.meals, pantryNames);
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${week.weekStart}
    `;
    const prev = asJson<GroceryItem[]>(saved[0]?.items, []);
    const extras = prev.filter(
      (p) => p.from === "added" || p.from === "market" || !built.some((b) => b.name.toLowerCase() === p.name.toLowerCase()),
    );
    const keptExtras = extras.filter((p) => p.from === "added" || p.from === "market");
    const merged: GroceryItem[] = [
      ...built.map((item) => ({
        ...item,
        checked: prev.find((p) => p.name.toLowerCase() === item.name.toLowerCase())?.checked ?? false,
      })),
      ...keptExtras.map((item) => ({
        ...item,
        checked: item.checked ?? false,
      })),
    ];
    await persistGrocery(sql, context.userId, week.weekStart, merged);
    return {
      weekStart: week.weekStart,
      items: merged,
      stores: week.stores,
      place: week.place,
      permission: week.profile.locationPermission,
      city: week.profile.city,
      zipCode: week.profile.zipCode,
      location: week.profile.location,
      skippedPantry: pantry.length,
      meals: week.meals.map((m) => ({ day: m.day, title: m.recipe.title })),
      aiReady: week.aiReady,
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
    const items = asJson<GroceryItem[]>(saved[0]?.items, []);
    const next = items.map((i) => (i.name === data.name ? { ...i, checked: data.checked } : i));
    await persistGrocery(sql, context.userId, weekStart, next);
    return { ok: true };
  });

export const addGroceryItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; qty?: string; dept?: string }) => ({
    name: input.name.trim().slice(0, 80),
    qty: (input.qty ?? "1").trim().slice(0, 24),
    dept: (input.dept ?? "Other").trim().slice(0, 32),
  }))
  .handler(async ({ context, data }) => {
    if (!data.name) throw new Error("Name the item first.");
    const sql = await getSql();
    const weekStart = startOfWeekISO();
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${weekStart}
    `;
    const items = asJson<GroceryItem[]>(saved[0]?.items, []);
    if (items.some((i) => i.name.toLowerCase() === data.name.toLowerCase())) return { ok: true };
    const next = [...items, { name: data.name, qty: data.qty || "1", dept: data.dept || "Other", checked: false, from: "added" }];
    await persistGrocery(sql, context.userId, weekStart, next);
    return { ok: true };
  });

export const composeLocalGrocery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const week = await ensureMealWeek(sql, context.userId);
    const pantry = await sql<{ name: string }>`select name from pantry_items where user_id = ${context.userId}`;
    const pantryNames = new Set(pantry.map((p) => p.name.trim().toLowerCase()));
    const saved = await sql<{ items: unknown }>`
      select items from grocery_lists where user_id = ${context.userId} and week_start = ${week.weekStart}
    `;
    const current = asJson<GroceryItem[]>(saved[0]?.items, listFromMeals(week.meals, pantryNames));
    const month = new Date().getMonth();
    const seasonal = SEASONAL_PRODUCE[month] ?? SEASONAL_PRODUCE[0];
    let extras: GroceryItem[] = seasonal.map((s) => ({ ...s, checked: false, from: "market" }));
    let original = false;
    const turn = houseAiReady() ? await takeAiTurn(context.userId, "grocery") : { ok: false, left: 0 };
    if (turn.ok) {
      const raw = await houseChat({
        json: true,
        maxTokens: 700,
        system:
          "Return JSON {items:[{name, qty, dept}]} with 6 to 10 grocery items a pregnant or postpartum mother should pick up this week. Prefer seasonal produce for the given city and ordinary aisles at the named stores. Skip anything already on the list or in the pantry. No alcohol. Never diagnose.",
        messages: [
          {
            role: "user",
            content: kitchenNotes(week.profile, [
              `Stores: ${week.stores.join(", ") || "unspecified"}`,
              `Already on the list: ${current.map((i) => i.name).join(", ") || "none"}`,
              `Pantry: ${pantry.map((p) => p.name).join(", ") || "none"}`,
              `This week's plates: ${week.meals.map((m) => m.recipe.title).join("; ")}`,
            ]),
          },
        ],
      });
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { items?: { name?: string; qty?: string; dept?: string }[] };
          if (Array.isArray(parsed.items) && parsed.items.length) {
            extras = parsed.items
              .filter((i) => i.name)
              .map((i) => ({
                name: String(i.name).slice(0, 80),
                qty: String(i.qty || "1").slice(0, 24),
                dept: String(i.dept || "Produce").slice(0, 32),
                checked: false,
                from: "market",
              }));
            original = true;
          }
        } catch {
          /* keep seasonal */
        }
      }
    }
    const names = new Set(current.map((i) => i.name.toLowerCase()));
    const next = [...current];
    for (const extra of extras) {
      if (names.has(extra.name.toLowerCase()) || pantryNames.has(extra.name.toLowerCase())) continue;
      names.add(extra.name.toLowerCase());
      next.push(extra);
    }
    await persistGrocery(sql, context.userId, week.weekStart, next);
    return { ok: true, added: next.length - current.length, original };
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

export const stockPantryStaples = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ name: string }>`select name from pantry_items where user_id = ${context.userId}`;
    const have = new Set(existing.map((e) => e.name.toLowerCase()));
    let added = 0;
    for (const staple of PANTRY_STAPLES) {
      if (have.has(staple.name.toLowerCase())) continue;
      await sql`
        insert into pantry_items (user_id, name, quantity, unit, estimated, low)
        values (${context.userId}, ${staple.name}, ${staple.quantity}, ${staple.unit}, true, false)
      `;
      added += 1;
    }
    return { ok: true, added };
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
