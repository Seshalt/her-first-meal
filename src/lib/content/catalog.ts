export type DietFlag =
  | "vegan"
  | "vegetarian"
  | "pescatarian"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "soy-free"
  | "halal"
  | "kosher";

export type Stage = "trying" | "first" | "second" | "third" | "postpartum";

export const STAGE_LABEL: Record<Stage, string> = {
  trying: "Trying to conceive",
  first: "First trimester",
  second: "Second trimester",
  third: "Third trimester",
  postpartum: "Postpartum",
};

export const STORES = [
  "Publix",
  "Walmart",
  "Aldi",
  "Kroger",
  "Costco",
  "Sam's Club",
  "Whole Foods",
  "Trader Joe's",
  "Sprouts",
  "Local store",
  "Farmers market",
] as const;

export const PANTRY_STAPLES: { name: string; quantity: number; unit: string }[] = [
  { name: "Olive oil", quantity: 1, unit: "bottle" },
  { name: "Sea salt", quantity: 1, unit: "jar" },
  { name: "Black pepper", quantity: 1, unit: "jar" },
  { name: "Garlic", quantity: 1, unit: "head" },
  { name: "Yellow onions", quantity: 3, unit: "count" },
  { name: "Rolled oats", quantity: 1, unit: "canister" },
  { name: "Brown rice", quantity: 1, unit: "bag" },
  { name: "Red lentils", quantity: 1, unit: "bag" },
  { name: "Black beans", quantity: 2, unit: "cans" },
  { name: "Canned tomatoes", quantity: 2, unit: "cans" },
  { name: "Chicken or vegetable broth", quantity: 2, unit: "cartons" },
  { name: "Honey", quantity: 1, unit: "jar" },
];

export const SEASONAL_PRODUCE: Record<number, { name: string; qty: string; dept: string }[]> = {
  0: [
    { name: "Navel oranges", qty: "6", dept: "Produce" },
    { name: "Kale", qty: "1 bunch", dept: "Produce" },
    { name: "Sweet potatoes", qty: "3", dept: "Produce" },
  ],
  1: [
    { name: "Cara cara oranges", qty: "6", dept: "Produce" },
    { name: "Collard greens", qty: "1 bunch", dept: "Produce" },
    { name: "Beets", qty: "1 bunch", dept: "Produce" },
  ],
  2: [
    { name: "Asparagus", qty: "1 bunch", dept: "Produce" },
    { name: "Strawberries", qty: "1 pint", dept: "Produce" },
    { name: "Spring onions", qty: "1 bunch", dept: "Produce" },
  ],
  3: [
    { name: "Peas", qty: "2 cups", dept: "Produce" },
    { name: "Spinach", qty: "1 bag", dept: "Produce" },
    { name: "Lemons", qty: "4", dept: "Produce" },
  ],
  4: [
    { name: "Strawberries", qty: "1 pint", dept: "Produce" },
    { name: "Zucchini", qty: "3", dept: "Produce" },
    { name: "Mint", qty: "1 bunch", dept: "Produce" },
  ],
  5: [
    { name: "Peaches", qty: "4", dept: "Produce" },
    { name: "Tomatoes", qty: "4", dept: "Produce" },
    { name: "Cucumbers", qty: "2", dept: "Produce" },
  ],
  6: [
    { name: "Watermelon", qty: "1 small", dept: "Produce" },
    { name: "Corn", qty: "4 ears", dept: "Produce" },
    { name: "Basil", qty: "1 bunch", dept: "Produce" },
  ],
  7: [
    { name: "Peaches", qty: "4", dept: "Produce" },
    { name: "Okra", qty: "1 lb", dept: "Produce" },
    { name: "Tomatoes", qty: "4", dept: "Produce" },
  ],
  8: [
    { name: "Apples", qty: "6", dept: "Produce" },
    { name: "Winter squash", qty: "1", dept: "Produce" },
    { name: "Figs or grapes", qty: "1 pint", dept: "Produce" },
  ],
  9: [
    { name: "Apples", qty: "6", dept: "Produce" },
    { name: "Pumpkin or squash", qty: "1", dept: "Produce" },
    { name: "Kale", qty: "1 bunch", dept: "Produce" },
  ],
  10: [
    { name: "Pomegranate", qty: "2", dept: "Produce" },
    { name: "Sweet potatoes", qty: "3", dept: "Produce" },
    { name: "Cranberries or citrus", qty: "1 bag", dept: "Produce" },
  ],
  11: [
    { name: "Citrus", qty: "6", dept: "Produce" },
    { name: "Collard greens", qty: "1 bunch", dept: "Produce" },
    { name: "Pears", qty: "4", dept: "Produce" },
  ],
};

export const DIETS: { id: DietFlag; label: string }[] = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "nut-free", label: "Nut-free" },
  { id: "soy-free", label: "Soy-free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
];

export const JOIN_DIETS_STORAGE = "hfm.join.diets";

export function recipePhoto(id: string) {
  return `/images/recipes/${id}.jpg`;
}

export const RECIPE_IMAGE_ALT: Record<string, string> = {
  "/images/recipes/golden-lentil.jpg": "Bowl of golden lentil soup garnished with cilantro",
  "/images/recipes/ginger-broth.jpg": "Bowl of ginger broth with lemon and bread",
  "/images/recipes/tahini-dates.jpg": "Dates filled and arranged on a plate",
  "/images/recipes/salmon-dill.jpg": "Grilled salmon fillet served with seasoned rice",
  "/images/recipes/oat-restore.jpg": "Overnight oats in a glass jar with blackberries",
  "/images/recipes/coconut-fish.jpg": "Fish curry in coconut sauce served with rice",
  "/images/recipes/herb-frittata.jpg": "Eggs cooked with fresh vegetables on a plate",
  "/images/recipes/black-bean.jpg": "Tomato and bean skillet with greens",
  "/images/recipes/jollof-greens.jpg": "Tomato rice in a pot, jollof-style",
  "/images/recipes/chicken-orzo.jpg": "Chicken noodle soup in a white bowl with herbs",
  "/images/recipes/soft-egg-toast.jpg": "Avocado toast topped with a fried egg",
  "/images/recipes/miso-sweet-potato.jpg": "Roasted potato wedges on a tray",
  "/images/recipes/quinoa-black-bean.jpg": "Quinoa salad bowl with vegetables",
  "/images/recipes/apple-quinoa.jpg": "Warm porridge topped with cinnamon apples",
  "/images/recipes/rice-porridge.jpg": "Rice porridge in a ceramic bowl with scallions",
  "/images/recipes/chickpea-spinach.jpg": "Yellow chickpea stew in a black bowl",
  "/images/recipes/banana-oat-cakes.jpg": "Stack of skillet pancakes with butter",
  "/images/recipes/turkey-chili.jpg": "Hearty bean and meat stew in a bowl",
  "/images/recipes/beet-citrus.jpg": "Beet salad with citrus and greens",
  "/images/recipes/sheet-chicken-squash.jpg": "Roast chicken in a pan with vegetables",
  "/images/recipes/cornmeal-porridge.jpg": "A warm bowl of morning porridge",
};

export type Recipe = {
  id: string;
  title: string;
  summary: string;
  stage: Stage[];
  diets: DietFlag[];
  minutes: number;
  servings: number;
  image: string;
  department: string;
  ingredients: { name: string; qty: string; dept: string }[];
  steps: string[];
  why: string;
};

export const RECIPES: Recipe[] = [
  {
    id: "golden-lentil",
    title: "Golden Lentil Restore Bowl",
    summary: "Turmeric lentils, roasted carrots, and pomegranate over wild rice.",
    stage: ["second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 35,
    servings: 4,
    image: recipePhoto("golden-lentil"),
    department: "Produce",
    ingredients: [
      { name: "Red lentils", qty: "1.5 cups", dept: "Dry goods" },
      { name: "Turmeric", qty: "1 tsp", dept: "Spices" },
      { name: "Carrots", qty: "4", dept: "Produce" },
      { name: "Pomegranate", qty: "1", dept: "Produce" },
      { name: "Wild rice", qty: "1 cup", dept: "Dry goods" },
    ],
    steps: [
      "Simmer lentils with turmeric, garlic, and a pinch of salt until creamy.",
      "Roast carrots until caramelized at the edges.",
      "Spoon over wild rice and finish with pomegranate and herbs.",
    ],
    why: "Iron, fiber, and warm spices support energy without asking digestion to work overtime.",
  },
  {
    id: "ginger-broth",
    title: "First Trimester Ginger Broth",
    summary: "A quiet sip for queasy mornings — ginger, miso, and greens.",
    stage: ["trying", "first"],
    diets: ["vegetarian", "pescatarian", "nut-free", "halal"],
    minutes: 20,
    servings: 2,
    image: recipePhoto("ginger-broth"),
    department: "Produce",
    ingredients: [
      { name: "Fresh ginger", qty: "2 in", dept: "Produce" },
      { name: "White miso", qty: "1 tbsp", dept: "Refrigerated" },
      { name: "Baby spinach", qty: "2 cups", dept: "Produce" },
      { name: "Scallions", qty: "2", dept: "Produce" },
    ],
    steps: [
      "Simmer ginger slices in water for 12 minutes.",
      "Turn off heat and whisk in miso so it stays living.",
      "Wilt spinach in the bowl and scatter scallions.",
    ],
    why: "Warm liquid and ginger are often easier than a plate when nausea is loud.",
  },
  {
    id: "tahini-dates",
    title: "Date & Tahini Evening Bites",
    summary: "Soft dates opened and filled with sesame, sea salt, and orange zest.",
    stage: ["third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 10,
    servings: 8,
    image: recipePhoto("tahini-dates"),
    department: "Produce",
    ingredients: [
      { name: "Medjool dates", qty: "8", dept: "Produce" },
      { name: "Tahini", qty: "3 tbsp", dept: "Dry goods" },
      { name: "Orange", qty: "1", dept: "Produce" },
      { name: "Flaky salt", qty: "pinch", dept: "Spices" },
    ],
    steps: [
      "Split dates and remove pits.",
      "Fill with tahini, orange zest, and a flake of salt.",
    ],
    why: "A mineral-rich sweet that does not pretend to be a substitute for a meal.",
  },
  {
    id: "salmon-dill",
    title: "Slow Oven Salmon with Dill Yogurt",
    summary: "Low-temperature salmon, cucumber, and lemon yogurt.",
    stage: ["second", "third"],
    diets: ["pescatarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 30,
    servings: 3,
    image: recipePhoto("salmon-dill"),
    department: "Seafood",
    ingredients: [
      { name: "Salmon fillet", qty: "1 lb", dept: "Seafood" },
      { name: "Plain yogurt", qty: "1/2 cup", dept: "Dairy" },
      { name: "Dill", qty: "1 bunch", dept: "Produce" },
      { name: "Cucumber", qty: "1", dept: "Produce" },
      { name: "Lemon", qty: "1", dept: "Produce" },
    ],
    steps: [
      "Bake salmon at 275°F until just opaque.",
      "Stir yogurt with dill, lemon, and grated cucumber.",
      "Serve with rice or warm flatbread.",
    ],
    why: "DHA and protein without a high-heat kitchen when energy is low.",
  },
  {
    id: "oat-restore",
    title: "Cardamom Overnight Oats",
    summary: "Oats, chia, and stewed apples waiting in the fridge.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal", "kosher"],
    minutes: 8,
    servings: 2,
    image: recipePhoto("oat-restore"),
    department: "Dry goods",
    ingredients: [
      { name: "Rolled oats", qty: "1 cup", dept: "Dry goods" },
      { name: "Chia seeds", qty: "2 tbsp", dept: "Dry goods" },
      { name: "Milk or oat milk", qty: "1.5 cups", dept: "Dairy" },
      { name: "Apple", qty: "1", dept: "Produce" },
      { name: "Cardamom", qty: "1/2 tsp", dept: "Spices" },
    ],
    steps: [
      "Stir oats, chia, milk, and cardamom.",
      "Top with stewed apple in the morning.",
    ],
    why: "Breakfast that does not require standing at a stove before the house wakes.",
  },
  {
    id: "coconut-fish",
    title: "Coconut Lime Fish Stew",
    summary: "A one-pot stew with white fish, coconut milk, and greens.",
    stage: ["second", "third", "postpartum"],
    diets: ["pescatarian", "gluten-free", "dairy-free", "nut-free"],
    minutes: 28,
    servings: 4,
    image: recipePhoto("coconut-fish"),
    department: "Seafood",
    ingredients: [
      { name: "White fish", qty: "1 lb", dept: "Seafood" },
      { name: "Coconut milk", qty: "1 can", dept: "Dry goods" },
      { name: "Lime", qty: "2", dept: "Produce" },
      { name: "Collard greens", qty: "1 bunch", dept: "Produce" },
      { name: "Garlic", qty: "4 cloves", dept: "Produce" },
    ],
    steps: [
      "Simmer coconut milk with garlic and lime zest.",
      "Poach fish gently, then fold in shredded greens.",
    ],
    why: "Mineral-rich greens and easy protein in one pot for a tired evening.",
  },
  {
    id: "herb-frittata",
    title: "Garden Herb Frittata",
    summary: "Eggs, leftover vegetables, and a handful of whatever herbs you have.",
    stage: ["trying", "first", "second", "postpartum"],
    diets: ["vegetarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 25,
    servings: 4,
    image: recipePhoto("herb-frittata"),
    department: "Dairy",
    ingredients: [
      { name: "Eggs", qty: "8", dept: "Dairy" },
      { name: "Zucchini", qty: "1", dept: "Produce" },
      { name: "Feta or dairy-free crumble", qty: "1/2 cup", dept: "Dairy" },
      { name: "Parsley", qty: "1 handful", dept: "Produce" },
    ],
    steps: [
      "Sauté vegetables until soft.",
      "Pour beaten eggs, bake until just set, finish with herbs.",
    ],
    why: "A fridge-clearing meal that still feels like someone cooked for you.",
  },
  {
    id: "black-bean",
    title: "Cumin Black Bean Skillet",
    summary: "Beans, tomatoes, and roasted sweet potato with lime.",
    stage: ["trying", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 30,
    servings: 4,
    image: recipePhoto("black-bean"),
    department: "Produce",
    ingredients: [
      { name: "Black beans", qty: "2 cans", dept: "Dry goods" },
      { name: "Sweet potato", qty: "2", dept: "Produce" },
      { name: "Tomatoes", qty: "2", dept: "Produce" },
      { name: "Cumin", qty: "1 tsp", dept: "Spices" },
      { name: "Lime", qty: "1", dept: "Produce" },
    ],
    steps: [
      "Roast sweet potato cubes.",
      "Warm beans with cumin and tomatoes, fold in potato, finish with lime.",
    ],
    why: "Inexpensive iron and fiber that scales to a household.",
  },
  {
    id: "jollof-greens",
    title: "Sunday Tomato Rice with Greens",
    summary: "A quiet jollof-style pot: tomatoes, peppers, and a heap of collards.",
    stage: ["trying", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 45,
    servings: 4,
    image: recipePhoto("jollof-greens"),
    department: "Produce",
    ingredients: [
      { name: "Long-grain rice", qty: "2 cups", dept: "Dry goods" },
      { name: "Tomato paste", qty: "3 tbsp", dept: "Dry goods" },
      { name: "Red bell pepper", qty: "2", dept: "Produce" },
      { name: "Collard greens", qty: "1 bunch", dept: "Produce" },
      { name: "Thyme", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Blend tomatoes and peppers, simmer with thyme until the oil rises.",
      "Stir in rinsed rice and enough broth to cook through.",
      "Fold shredded collards in for the last ten minutes.",
    ],
    why: "A family pot that feeds iron and comfort without asking for a second stove.",
  },
  {
    id: "chicken-orzo",
    title: "Lemon Chicken Orzo Pot",
    summary: "One pot, shredded chicken, orzo, and a squeeze of lemon.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["nut-free", "halal"],
    minutes: 35,
    servings: 4,
    image: recipePhoto("chicken-orzo"),
    department: "Meat",
    ingredients: [
      { name: "Chicken thighs", qty: "1.5 lb", dept: "Meat" },
      { name: "Orzo", qty: "1 cup", dept: "Dry goods" },
      { name: "Lemon", qty: "2", dept: "Produce" },
      { name: "Baby spinach", qty: "4 cups", dept: "Produce" },
      { name: "Chicken broth", qty: "4 cups", dept: "Dry goods" },
    ],
    steps: [
      "Brown chicken, then simmer in broth until tender and shred.",
      "Add orzo and cook until just soft.",
      "Stir in spinach and lemon off the heat.",
    ],
    why: "Protein and a warm bowl when chewing feels like too much work.",
  },
  {
    id: "soft-egg-toast",
    title: "Soft Egg Avocado Toast",
    summary: "Jammy eggs, smashed avocado, chili flake if she wants it.",
    stage: ["trying", "first", "second", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal", "kosher"],
    minutes: 12,
    servings: 2,
    image: recipePhoto("soft-egg-toast"),
    department: "Produce",
    ingredients: [
      { name: "Eggs", qty: "4", dept: "Dairy" },
      { name: "Ripe avocado", qty: "1", dept: "Produce" },
      { name: "Sourdough", qty: "4 slices", dept: "Bakery" },
      { name: "Lemon", qty: "1", dept: "Produce" },
    ],
    steps: [
      "Boil eggs 7 minutes, ice bath, peel.",
      "Smash avocado with lemon and salt.",
      "Toast the bread, spread, halve the eggs on top.",
    ],
    why: "Breakfast in twelve minutes that still looks like someone thought of her.",
  },
  {
    id: "miso-sweet-potato",
    title: "Miso Butter Sweet Potatoes",
    summary: "Roasted wedges glazed with miso, scallion, and sesame.",
    stage: ["second", "third", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal"],
    minutes: 40,
    servings: 3,
    image: recipePhoto("miso-sweet-potato"),
    department: "Produce",
    ingredients: [
      { name: "Sweet potatoes", qty: "3", dept: "Produce" },
      { name: "White miso", qty: "2 tbsp", dept: "Refrigerated" },
      { name: "Butter or olive oil", qty: "2 tbsp", dept: "Dairy" },
      { name: "Scallions", qty: "3", dept: "Produce" },
      { name: "Sesame seeds", qty: "1 tbsp", dept: "Spices" },
    ],
    steps: [
      "Roast sweet potato wedges until caramelized.",
      "Whisk miso with butter and a splash of water.",
      "Toss while hot and finish with scallion and sesame.",
    ],
    why: "Mineral-rich and gentle when the stomach wants something sweet and savory.",
  },
  {
    id: "quinoa-black-bean",
    title: "Cilantro Lime Quinoa Bowl",
    summary: "Quinoa, black beans, corn, and a pile of herbs.",
    stage: ["trying", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 25,
    servings: 4,
    image: recipePhoto("quinoa-black-bean"),
    department: "Produce",
    ingredients: [
      { name: "Quinoa", qty: "1.5 cups", dept: "Dry goods" },
      { name: "Black beans", qty: "1 can", dept: "Dry goods" },
      { name: "Corn", qty: "1 cup", dept: "Frozen" },
      { name: "Cilantro", qty: "1 bunch", dept: "Produce" },
      { name: "Lime", qty: "2", dept: "Produce" },
    ],
    steps: [
      "Cook quinoa until the germ spirals.",
      "Warm beans and corn.",
      "Toss with lime, cilantro, and a pinch of salt.",
    ],
    why: "A cold or warm bowl that packs well for appointments.",
  },
  {
    id: "apple-quinoa",
    title: "Warm Apple Cardamom Quinoa",
    summary: "Breakfast porridge with stewed apple and a thread of honey.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 20,
    servings: 2,
    image: recipePhoto("apple-quinoa"),
    department: "Produce",
    ingredients: [
      { name: "Quinoa", qty: "1 cup", dept: "Dry goods" },
      { name: "Apple", qty: "2", dept: "Produce" },
      { name: "Cardamom", qty: "1/2 tsp", dept: "Spices" },
      { name: "Honey or maple", qty: "2 tbsp", dept: "Dry goods" },
      { name: "Cinnamon", qty: "1/2 tsp", dept: "Spices" },
    ],
    steps: [
      "Simmer quinoa in extra water until creamy.",
      "Stew apples with cinnamon and cardamom.",
      "Spoon together and drizzle honey.",
    ],
    why: "Warm, wet breakfast for the mornings a cold bowl will not do.",
  },
  {
    id: "rice-porridge",
    title: "Ginger Rice Porridge",
    summary: "Congee-style rice with ginger, scallion, and a jammy egg if you eat them.",
    stage: ["trying", "first", "postpartum"],
    diets: ["gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 50,
    servings: 4,
    image: recipePhoto("rice-porridge"),
    department: "Dry goods",
    ingredients: [
      { name: "Jasmine rice", qty: "1 cup", dept: "Dry goods" },
      { name: "Fresh ginger", qty: "3 in", dept: "Produce" },
      { name: "Chicken or vegetable broth", qty: "8 cups", dept: "Dry goods" },
      { name: "Scallions", qty: "4", dept: "Produce" },
      { name: "Eggs", qty: "2", dept: "Dairy" },
    ],
    steps: [
      "Simmer rice in broth with smashed ginger until it falls apart.",
      "Season gently.",
      "Top with scallion and a soft egg if that sounds possible.",
    ],
    why: "The bowl for queasy days and the first weeks after birth.",
  },
  {
    id: "chickpea-spinach",
    title: "Turmeric Chickpea Spinach Stew",
    summary: "A weeknight stew with chickpeas, tomatoes, and a hill of spinach.",
    stage: ["trying", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 30,
    servings: 4,
    image: recipePhoto("chickpea-spinach"),
    department: "Produce",
    ingredients: [
      { name: "Chickpeas", qty: "2 cans", dept: "Dry goods" },
      { name: "Baby spinach", qty: "5 cups", dept: "Produce" },
      { name: "Canned tomatoes", qty: "1 can", dept: "Dry goods" },
      { name: "Turmeric", qty: "1 tsp", dept: "Spices" },
      { name: "Cumin", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Sauté onion and spices until fragrant.",
      "Add tomatoes and chickpeas, simmer 15 minutes.",
      "Wilt spinach in at the end.",
    ],
    why: "Iron and fiber without a long shop or a long cook.",
  },
  {
    id: "banana-oat-cakes",
    title: "Banana Oat Skillet Cakes",
    summary: "Mashed banana, oats, and an egg — no mixer, no performance.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal", "kosher"],
    minutes: 15,
    servings: 2,
    image: recipePhoto("banana-oat-cakes"),
    department: "Dry goods",
    ingredients: [
      { name: "Ripe bananas", qty: "2", dept: "Produce" },
      { name: "Rolled oats", qty: "1 cup", dept: "Dry goods" },
      { name: "Eggs", qty: "2", dept: "Dairy" },
      { name: "Cinnamon", qty: "1/2 tsp", dept: "Spices" },
      { name: "Butter or oil", qty: "1 tbsp", dept: "Dairy" },
    ],
    steps: [
      "Mash banana with egg, oats, and cinnamon.",
      "Spoon onto a warm skillet.",
      "Flip when the edges set.",
    ],
    why: "A sweet breakfast that uses what is already turning brown on the counter.",
  },
  {
    id: "turkey-chili",
    title: "White Bean Turkey Chili",
    summary: "A milder chili for the week, beans and turkey in one pot.",
    stage: ["second", "third", "postpartum"],
    diets: ["gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 40,
    servings: 6,
    image: recipePhoto("turkey-chili"),
    department: "Meat",
    ingredients: [
      { name: "Ground turkey", qty: "1 lb", dept: "Meat" },
      { name: "White beans", qty: "2 cans", dept: "Dry goods" },
      { name: "Green chiles", qty: "1 can", dept: "Dry goods" },
      { name: "Onion", qty: "1", dept: "Produce" },
      { name: "Cumin", qty: "2 tsp", dept: "Spices" },
    ],
    steps: [
      "Brown turkey with onion.",
      "Add beans, chiles, cumin, and water to loosen.",
      "Simmer twenty minutes. Finish with lime if you have it.",
    ],
    why: "Leftovers that still taste like a meal on the third night.",
  },
  {
    id: "beet-citrus",
    title: "Roasted Beet and Citrus Plate",
    summary: "Beets, orange, and a spoon of yogurt or tahini.",
    stage: ["trying", "first", "second", "third"],
    diets: ["vegetarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 50,
    servings: 3,
    image: recipePhoto("beet-citrus"),
    department: "Produce",
    ingredients: [
      { name: "Beets", qty: "4", dept: "Produce" },
      { name: "Oranges", qty: "2", dept: "Produce" },
      { name: "Plain yogurt", qty: "1/2 cup", dept: "Dairy" },
      { name: "Mint", qty: "1 handful", dept: "Produce" },
    ],
    steps: [
      "Roast beets until a knife slides through, then peel.",
      "Slice oranges.",
      "Plate with yogurt and torn mint.",
    ],
    why: "Folate-forward color on days the plate has been brown all week.",
  },
  {
    id: "sheet-chicken-squash",
    title: "Sheet Pan Chicken and Squash",
    summary: "Everything on one tray. Olive oil, salt, and the oven does the rest.",
    stage: ["trying", "second", "third", "postpartum"],
    diets: ["gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 40,
    servings: 4,
    image: recipePhoto("sheet-chicken-squash"),
    department: "Meat",
    ingredients: [
      { name: "Chicken pieces", qty: "2 lb", dept: "Meat" },
      { name: "Butternut squash", qty: "1", dept: "Produce" },
      { name: "Red onion", qty: "1", dept: "Produce" },
      { name: "Olive oil", qty: "3 tbsp", dept: "Dry goods" },
      { name: "Rosemary", qty: "2 sprigs", dept: "Produce" },
    ],
    steps: [
      "Toss squash and onion with oil on a sheet pan.",
      "Nestle chicken among the vegetables.",
      "Roast at 425°F until the chicken is cooked through.",
    ],
    why: "Dinner that does not ask her to stand and stir.",
  },
  {
    id: "cornmeal-porridge",
    title: "Cinnamon Cornmeal Porridge",
    summary: "A Caribbean-leaning morning pot with milk, nutmeg, and banana.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegetarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 18,
    servings: 2,
    image: recipePhoto("cornmeal-porridge"),
    department: "Dry goods",
    ingredients: [
      { name: "Fine cornmeal", qty: "1/2 cup", dept: "Dry goods" },
      { name: "Milk or oat milk", qty: "2 cups", dept: "Dairy" },
      { name: "Nutmeg", qty: "1/4 tsp", dept: "Spices" },
      { name: "Banana", qty: "1", dept: "Produce" },
      { name: "Brown sugar or honey", qty: "1 tbsp", dept: "Dry goods" },
    ],
    steps: [
      "Whisk cornmeal into cold milk so it does not lump.",
      "Cook slowly, stirring, until it thickens.",
      "Finish with nutmeg, banana, and a little sweetness.",
    ],
    why: "A childhood breakfast that still counts as care in this season.",
  },
];

export type Workout = {
  id: string;
  title: string;
  category: "walking" | "stretching" | "mobility" | "yoga" | "breathing" | "pelvic" | "strength" | "recovery";
  stage: Stage[];
  energy: "low" | "medium" | "steady";
  minutes: number;
  experience: "new" | "familiar" | "any";
  summary: string;
  steps: string[];
  caution: string;
};

export const WORKOUTS: Workout[] = [
  {
    id: "window-walk",
    title: "Ten-Minute Window Walk",
    category: "walking",
    stage: ["trying", "first", "second", "third", "postpartum"],
    energy: "low",
    minutes: 10,
    experience: "any",
    summary: "A slow indoor or porch walk with unclenched shoulders.",
    steps: ["Stand, soften the knees.", "Walk easily for ten minutes.", "Finish with three longer exhales."],
    caution: "Stop for dizziness, bleeding, or pain. This is not a replacement for your clinician.",
  },
  {
    id: "cat-cow",
    title: "Cat-Cow for a Heavy Back",
    category: "mobility",
    stage: ["first", "second", "third"],
    energy: "low",
    minutes: 8,
    experience: "any",
    summary: "Spinal waves on hands and knees to make space for breath.",
    steps: ["Come to hands and knees.", "Inhale, let the belly drop.", "Exhale, round the spine gently.", "Repeat slowly."],
    caution: "Keep wrists comfortable. Avoid if kneeling is contraindicated.",
  },
  {
    id: "side-lying-breath",
    title: "Side-Lying Breath",
    category: "breathing",
    stage: ["third", "postpartum"],
    energy: "low",
    minutes: 6,
    experience: "any",
    summary: "A rest pose that still counts as movement of the nervous system.",
    steps: ["Lie on your left side with a pillow between knees.", "Inhale for four, exhale for six.", "Stay until the jaw unhooks."],
    caution: "Change sides if you feel lightheaded. Ask your provider about lying postures.",
  },
  {
    id: "pelvic-hum",
    title: "Pelvic Floor Hum",
    category: "pelvic",
    stage: ["trying", "first", "second", "third", "postpartum"],
    energy: "low",
    minutes: 5,
    experience: "new",
    summary: "A humming exhale to meet the pelvic floor without gripping.",
    steps: ["Sit or lie comfortably.", "Inhale into the sides of the ribs.", "Hum on the exhale and notice the gentle lift.", "Release fully."],
    caution: "Never hold the breath or bear down. Seek a pelvic floor PT for pain or leaking.",
  },
  {
    id: "wall-strength",
    title: "Wall Sit with Breath",
    category: "strength",
    stage: ["trying", "first", "second"],
    energy: "medium",
    minutes: 12,
    experience: "familiar",
    summary: "Supported strength when you want to feel your legs again.",
    steps: ["Back to the wall, sit to a comfortable height.", "Three breaths, then stand.", "Repeat five times."],
    caution: "Skip if pelvic pressure increases. This is optional, never required.",
  },
  {
    id: "fourth-stretch",
    title: "Fourth Trimester Floor Stretch",
    category: "recovery",
    stage: ["postpartum"],
    energy: "low",
    minutes: 12,
    experience: "any",
    summary: "Hip openers and chest softening after feeding or wrapping.",
    steps: ["Supported child's pose if comfortable.", "Figure-four on the back.", "Gentle chest opener over a pillow."],
    caution: "Wait for your provider's clearance after birth, especially after cesarean.",
  },
  {
    id: "yoga-sun",
    title: "Half Sun Salute",
    category: "yoga",
    stage: ["trying", "first", "second"],
    energy: "steady",
    minutes: 15,
    experience: "familiar",
    summary: "A shortened salute that never asks you to jump.",
    steps: ["Mountain pose.", "Reach up, fold with soft knees.", "Half lift, fold, rise."],
    caution: "Avoid overheating. Skip inversions and deep twists unless cleared.",
  },
];

export const AFFIRMATIONS = [
  "Today we are caring for two hearts.",
  "Your body is not a waiting room.",
  "Nourishment can be quiet and still count.",
  "You do not have to earn rest.",
  "This season is allowed to be slow.",
  "What does her body need, first.",
  "You are not behind. You are in a body.",
  "Support is not a luxury. It is the design.",
];

export const BINDING_FAQS = [
  {
    q: "When can I begin belly binding?",
    a: "Timing is personal and should be confirmed with your healthcare provider. Many people begin after initial healing, often in the first weeks postpartum. Her First Meal never replaces that clinical guidance.",
  },
  {
    q: "Does wrapping diagnose or treat anything?",
    a: "No. Binding here is educational support for comfort, posture awareness, and cultural practice. Observations from Nouri and photo comparison are educational, not medical clearance.",
  },
  {
    q: "How tight should it feel?",
    a: "Supportive, not punishing. You should breathe fully, walk, and feed without dizziness. Loosen immediately if you feel numbness, sharp pain, or restricted breath.",
  },
  {
    q: "Can I bind after a cesarean?",
    a: "Only with your surgical team's guidance. We offer education on placement that avoids incision pressure — never a protocol that overrules your clinician.",
  },
];

export const BINDING_STEPS = [
  {
    title: "Prepare the cloth",
    body: "Choose a breathable cotton or muslin wrap. Warm the fabric with your hands. Sit or stand where you can see a mirror without straining.",
    image: "/images/binding-still.jpg",
  },
  {
    title: "Anchor at the hips",
    body: "Begin low, at the widest part of the pelvis, not at the ribs. The first pass is an orientation, not a cinch.",
    image: "/images/binding-hands.jpg",
  },
  {
    title: "Spiral with breath",
    body: "Each pass follows an exhale. Leave space for the diaphragm. The wrap should look even from the front and both sides.",
    image: "/images/binding-hands.jpg",
  },
  {
    title: "Finish and rest",
    body: "Secure without knots that dig. Sit. Drink water. Notice how walking feels. Photograph if you want a studio comparison.",
    image: "/images/postpartum-rest.jpg",
  },
];

export type WeekContent = {
  week: number;
  mother: string;
  baby: string;
  nourish: string;
  move: string;
  ask: string;
};

export const WEEKS: WeekContent[] = Array.from({ length: 42 }, (_, i) => {
  const week = i + 1;
  const trimester = week <= 13 ? "first" : week <= 27 ? "second" : week <= 40 ? "third" : "late";
  return {
    week,
    mother:
      trimester === "first"
        ? "Your body is building a new endocrine weather system. Fatigue and tender breasts are information, not failure."
        : trimester === "second"
          ? "Ligaments soften. You may feel stronger and also newly off-balance. Rest is still productive work."
          : trimester === "third"
            ? "Breath sits higher. Sleep fragments. The work is carrying, not proving anything."
            : "You are in the stretch past dates. Waiting is a kind of labor. Eat, rest, and keep your people close.",
    baby:
      week < 8
        ? "Early structures are organizing. You do not need to visualize anything you do not want to."
        : week < 20
          ? "Movement may begin as flutters or remain quiet. Both can be normal — confirm with your provider."
          : week < 32
            ? "Practice growing into limited space. Your meals are building myelin and mineral stores."
            : "The baby is practicing breath and sleep cycles. Your body is still the entire climate.",
    nourish:
      week % 3 === 0
        ? "Favor iron-forward plants or fish your diet allows. Pair with vitamin C."
        : week % 3 === 1
          ? "Warm, wet food if appetite is thin: broths, stewed fruit, yogurt if you eat dairy."
          : "Keep a protein you actually like within reach. Perfection is not the nutrient.",
    move:
      week > 34
        ? "Side-lying breath and short walks. Save heroics."
        : "A ten-minute walk and a mobility sequence if energy allows.",
    ask: week % 4 === 0 ? "Ask about iron, blood pressure, and mood — not only the baby's measurements." : "Write one question for your next appointment while it is still small.",
  };
});

export const PARTNER_CARDS = [
  {
    title: "Protect her plate",
    body: "Eat with her, not after. If she is feeding or nauseous, bring water without being asked.",
  },
  {
    title: "The grocery run",
    body: "Take the list Her First Meal generates. Do not improvise away the brands she can tolerate.",
  },
  {
    title: "Appointments are work",
    body: "Put them on your calendar. Sit in the waiting room. Take notes so she does not have to remember everything.",
  },
  {
    title: "Belly binding support",
    body: "Hold the end of the cloth. Watch the studio videos together. Never tighten for her.",
  },
  {
    title: "Night watches",
    body: "A shift of dishwashing or baby-holding is a medical intervention of a kind. Do it without keeping score.",
  },
];

export const RESOURCE_LIBRARY = [
  {
    id: "fourth-trimester",
    title: "The fourth trimester is still pregnancy",
    category: "Postpartum",
    minutes: 8,
    body: "Healing, milk, identity, and the pelvic floor do not reset at discharge. This house stays open.",
  },
  {
    id: "iron",
    title: "Iron without the lecture",
    category: "Nutrition",
    minutes: 6,
    body: "Food sources, tea timing, and when to call your clinician about labs — not a supplement pitch.",
  },
  {
    id: "questions",
    title: "Questions worth bringing",
    category: "Appointments",
    minutes: 5,
    body: "A living list: blood pressure, mood, pelvic symptoms, feeding, rest. The baby is not the only patient.",
  },
  {
    id: "binding-history",
    title: "Binding across cultures",
    category: "Belly binding",
    minutes: 10,
    body: "Bengkung, Mexican faja traditions, West African wrapping, and modern studio practice — honored, not flattened.",
  },
];

export function recipesFor(stage: Stage | null, diets: string[], dislikes: string) {
  const dislike = (dislikes || "").toLowerCase();
  return RECIPES.filter((r) => {
    if (stage && !r.stage.includes(stage)) return false;
    if (diets.length && !diets.every((d) => r.diets.includes(d as DietFlag))) return false;
    if (dislike && r.title.toLowerCase().includes(dislike)) return false;
    return true;
  });
}
