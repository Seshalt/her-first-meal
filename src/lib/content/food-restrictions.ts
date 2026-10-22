// Conservative ingredient screening, not a cross-contact or packaging guarantee.
const ALLERGENS: { names: RegExp; ingredients: RegExp }[] = [
  { names: /^(peanuts?|groundnuts?)$/, ingredients: /\b(peanuts?|groundnuts?)\b/i },
  { names: /^(tree nuts?|nuts?|almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?)$/, ingredients: /\b(almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamias?|brazil nuts?|nuts?)\b/i },
  { names: /^(sesame|tahini)$/, ingredients: /\b(sesame|tahini)\b/i },
  { names: /^(soy|soya|soybeans?)$/, ingredients: /\b(soy|soya|soybeans?|tofu|miso|edamame|tempeh|tamari)\b/i },
  { names: /^(milk|dairy|lactose)$/, ingredients: /\b(milk|yogurt|yoghurt|butter|cheese|cream|ghee|kefir|whey|casein|parmesan)\b/i },
  { names: /^(eggs?)$/, ingredients: /\b(eggs?|mayonnaise|frittata)\b/i },
  { names: /^(wheat|gluten)$/, ingredients: /\b(wheat|gluten|bread|flatbread|toast|orzo|flour|couscous|bulgur|semolina|soy sauce|oats?)\b/i },
  { names: /^(fish|salmon|cod|tuna)$/, ingredients: /\b(fish|salmon|cod|tuna|anchov\w*|sardines?)\b/i },
  { names: /^(shellfish|crustaceans?|mollus[ck]s?|shrimp|prawns?|crab|lobster)$/, ingredients: /\b(shellfish|shrimp|prawns?|crab|lobster|oysters?|clams?|mussels?|scallops?)\b/i },
];

export function ingredientTextAllowed(text: string, allergies: string[]) {
  return allergies.filter((a) => a.trim()).every((allergy) => {
    const rule = ALLERGENS.find((item) => item.names.test(allergy.trim().toLowerCase()));
    // Unrecognized free-text allergies need review; never silently ignore them.
    return Boolean(rule && !rule.ingredients.test(text));
  });
}

// Each group is one required task; any appliance in a group can perform it.
export const RECIPE_APPLIANCES: Record<string, string[][]> = {
  "golden-lentil": [["stovetop"], ["oven"]],
  "ginger-broth": [["stovetop"]],
  "tahini-dates": [],
  "salmon-dill": [["oven"]],
  "oat-restore": [["stovetop"]],
  "coconut-fish": [["stovetop"]],
  "herb-frittata": [["stovetop"], ["oven"]],
  "black-bean": [["oven"], ["stovetop"]],
  "jollof-greens": [["blender", "food-processor"], ["stovetop"]],
  "chicken-orzo": [["stovetop"]],
  "soft-egg-toast": [["stovetop"], ["toaster", "oven", "stovetop"]],
  "miso-sweet-potato": [["oven"]],
  "quinoa-salad": [["stovetop", "rice-cooker"]],
  "stewed-apple": [["stovetop"]],
  "rice-porridge": [["stovetop"]],
  "chickpea-spinach": [["stovetop"]],
  "banana-oat": [["stovetop"]],
  "turkey-chili": [["stovetop"]],
  "beet-citrus": [["oven"]],
  "sheet-chicken": [["oven"]],
  "cornmeal-porridge": [["stovetop"]],
};

export function recipeFitsKitchen(recipeId: string, appliances: string[]) {
  if (!appliances.length) return true;
  const required = RECIPE_APPLIANCES[recipeId];
  return Boolean(required && required.every((group) => group.some((id) => appliances.includes(id))));
}
