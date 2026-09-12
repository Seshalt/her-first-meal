import { getSql } from "@/lib/db";

export type AiKind = "recipes" | "nouri" | "grocery";

const DEFAULTS: Record<AiKind, number> = {
  recipes: 3,
  nouri: 12,
  grocery: 2,
};

export async function peekAiQuota(userId: string) {
  const sql = await getSql();
  const settings = await sql<{
    ai_recipe_per_day: number | null;
    ai_nouri_per_day: number | null;
    ai_grocery_per_day: number | null;
    ai_house_per_day: number | null;
  }>`
    select ai_recipe_per_day, ai_nouri_per_day, ai_grocery_per_day, ai_house_per_day
    from business_settings where id = 1
  `;
  const recipeLimit = Number(settings[0]?.ai_recipe_per_day ?? DEFAULTS.recipes);
  const nouriLimit = Number(settings[0]?.ai_nouri_per_day ?? DEFAULTS.nouri);
  const groceryLimit = Number(settings[0]?.ai_grocery_per_day ?? DEFAULTS.grocery);
  const houseLimit = Number(settings[0]?.ai_house_per_day ?? 400);
  const used = await sql<{ recipes: number; nouri: number; grocery: number }>`
    select recipes, nouri, grocery from ai_usage where user_id = ${userId} and day = current_date
  `;
  const house = await sql<{ total: number }>`
    select coalesce(sum(recipes + nouri + grocery), 0)::int as total
    from ai_usage where day = current_date
  `;
  const row = used[0] ?? { recipes: 0, nouri: 0, grocery: 0 };
  return {
    recipesLimit: recipeLimit,
    nouriLimit,
    groceryLimit,
    houseLimit,
    recipesUsed: Number(row.recipes),
    nouriUsed: Number(row.nouri),
    groceryUsed: Number(row.grocery),
    recipesLeft: Math.max(0, recipeLimit - Number(row.recipes)),
    nouriLeft: Math.max(0, nouriLimit - Number(row.nouri)),
    groceryLeft: Math.max(0, groceryLimit - Number(row.grocery)),
    houseUsed: Number(house[0]?.total ?? 0),
  };
}

/** Spend one AI turn. Returns false when the member or the house is at rest for the day. */
export async function takeAiTurn(userId: string, kind: AiKind): Promise<{ ok: boolean; left: number }> {
  const sql = await getSql();
  const peek = await peekAiQuota(userId);
  const leftKey = kind === "recipes" ? "recipesLeft" : kind === "nouri" ? "nouriLeft" : "groceryLeft";
  if (peek.houseUsed >= peek.houseLimit || peek[leftKey] <= 0) {
    return { ok: false, left: peek[leftKey] };
  }
  const col = kind === "recipes" ? "recipes" : kind === "nouri" ? "nouri" : "grocery";
  await sql`
    insert into ai_usage (user_id, day, recipes, nouri, grocery)
    values (
      ${userId},
      current_date,
      ${kind === "recipes" ? 1 : 0},
      ${kind === "nouri" ? 1 : 0},
      ${kind === "grocery" ? 1 : 0}
    )
    on conflict (user_id, day) do update set
      recipes = ai_usage.recipes + ${kind === "recipes" ? 1 : 0},
      nouri = ai_usage.nouri + ${kind === "nouri" ? 1 : 0},
      grocery = ai_usage.grocery + ${kind === "grocery" ? 1 : 0}
  `;
  return { ok: true, left: peek[leftKey] - 1 };
}

export function quotaMessage(kind: AiKind) {
  if (kind === "recipes") {
    return "Today's original kitchen is at rest. The house catalog is still open — start any recipe there. Originals return in the morning.";
  }
  if (kind === "nouri") {
    return "Nouri has spoken enough for today so the house bill stays kind. Ask again tomorrow, or open the catalog.";
  }
  return "The market list is filled from the table for today. Original extras return in the morning.";
}
