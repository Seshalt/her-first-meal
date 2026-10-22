import test from "node:test";
import assert from "node:assert/strict";
import { ingredientTextAllowed, recipeFitsKitchen, RECIPE_APPLIANCES } from "./food-restrictions.ts";
import { RECIPES, recipePool } from "./catalog.ts";

test("allergen screening recognizes ingredient aliases and refuses unknown allergies", () => {
  assert.equal(ingredientTextAllowed("miso broth", ["soy"]), false);
  assert.equal(ingredientTextAllowed("dates with tahini", ["sesame"]), false);
  assert.equal(ingredientTextAllowed("yogurt and berries", ["dairy"]), false);
  assert.equal(ingredientTextAllowed("rice and lentils", ["peanut"]), true);
  assert.equal(ingredientTextAllowed("rice and lentils", ["an unrecognized allergy"]), false);
});

test("recipe pool never relaxes diets, dislikes or allergies to fill the week", () => {
  assert.deepEqual(recipePool(null, [], "", ["unrecognized allergy"]), []);
  const vegan = recipePool(null, ["vegan"], "lentils", ["sesame"]);
  assert.ok(vegan.every((recipe) => recipe.diets.includes("vegan")));
  assert.ok(vegan.every((recipe) => ingredientTextAllowed(JSON.stringify(recipe), ["sesame"])));
  assert.ok(vegan.every((recipe) => !recipe.ingredients.some((item) => item.name.toLowerCase().includes("lentils"))));
});

test("appliance planning requires every cooking task, even for a small catalog", () => {
  assert.ok(RECIPES.every((recipe) => recipe.id in RECIPE_APPLIANCES));
  assert.equal(recipeFitsKitchen("golden-lentil", ["stovetop"]), false);
  assert.equal(recipeFitsKitchen("golden-lentil", ["stovetop", "oven"]), true);
  assert.equal(recipeFitsKitchen("tahini-dates", ["basic-kitchen"]), true);
  assert.equal(recipeFitsKitchen("sheet-chicken", ["basic-kitchen"]), false);
  assert.equal(recipeFitsKitchen("unknown-recipe", ["oven"]), false);
});
