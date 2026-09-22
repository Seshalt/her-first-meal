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

export const KITCHEN_APPLIANCES = [
  { id: "oven", label: "Oven", icon: "◫" },
  { id: "stovetop", label: "Stovetop", icon: "♨" },
  { id: "microwave", label: "Microwave", icon: "▣" },
  { id: "air-fryer", label: "Air fryer", icon: "◎" },
  { id: "pressure-cooker", label: "Pressure cooker / Instant Pot", icon: "◉" },
  { id: "slow-cooker", label: "Slow cooker", icon: "◌" },
  { id: "toaster", label: "Toaster / toaster oven", icon: "▤" },
  { id: "blender", label: "Blender", icon: "◇" },
  { id: "food-processor", label: "Food processor", icon: "✣" },
  { id: "rice-cooker", label: "Rice cooker", icon: "◍" },
  { id: "grill", label: "Grill", icon: "≋" },
  { id: "kettle", label: "Kettle", icon: "◒" },
  { id: "basic-kitchen", label: "None / basic kitchen", icon: "○" },
] as const;

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

export const DIET_IDS = new Set<string>(DIETS.map((d) => d.id));
export const JOIN_DIETS_STORAGE = "hfm.join.diets";
export const JOIN_LOCALE_STORAGE = "hfm.locale";

export function readJoinDiets(): DietFlag[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(JOIN_DIETS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is DietFlag => typeof id === "string" && DIET_IDS.has(id));
  } catch {
    return [];
  }
}

export function recipePhoto(id: string) {
  return `/images/recipes/${id}.jpg`;
}

export const RECIPE_IMAGE_ALT: Record<string, string> = {
  [recipePhoto("golden-lentil")]: "Bowl of golden lentil soup with herbs and a spoon",
  [recipePhoto("ginger-broth")]: "Glass mug of fresh ginger tea on a wooden table",
  [recipePhoto("tahini-dates")]: "Medjool dates split and filled with sesame tahini",
  [recipePhoto("salmon-dill")]: "Baked salmon fillet with fresh herbs and lemon",
  [recipePhoto("oat-restore")]: "Overnight oats in a glass jar topped with berries",
  [recipePhoto("coconut-fish")]: "Coconut fish curry in a bowl with lime",
  [recipePhoto("herb-frittata")]: "Herb frittata sliced on a board with salad",
  [recipePhoto("black-bean")]: "Black bean stew with tomato and lime",
  [recipePhoto("jollof-greens")]: "Tomato rice with greens and a rich red sauce",
  [recipePhoto("chicken-orzo")]: "Chicken soup with vegetables in a white bowl",
  [recipePhoto("soft-egg-toast")]: "Soft eggs on toast with herbs",
  [recipePhoto("miso-sweet-potato")]: "Roasted sweet potatoes split open on a tray",
  [recipePhoto("quinoa-salad")]: "Quinoa salad with black beans, corn, and lime",
  [recipePhoto("stewed-apple")]: "Bowl of stewed apple with yogurt and granola",
  [recipePhoto("rice-porridge")]: "Rice porridge with ginger in a ceramic bowl",
  [recipePhoto("chickpea-spinach")]: "Chickpeas and spinach in a tomato pan sauce",
  [recipePhoto("banana-oat")]: "Banana oat skillet cakes with berries",
  [recipePhoto("turkey-chili")]: "Bowl of turkey and bean chili",
  [recipePhoto("beet-citrus")]: "Roasted beets with citrus and greens",
  [recipePhoto("sheet-chicken")]: "Sheet-pan roasted chicken with squash",
  [recipePhoto("cornmeal-porridge")]: "Warm cornmeal porridge with banana and cinnamon",
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
    diets: ["vegan", "vegetarian", "pescatarian", "dairy-free", "nut-free", "halal"],
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
    diets: ["vegan", "vegetarian", "nut-free", "halal", "kosher"],
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
    title: "Tomato Rice with Slow Greens",
    summary: "A jollof-inspired pot of rice, peppers, and braised greens.",
    stage: ["second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 40,
    servings: 4,
    image: recipePhoto("jollof-greens"),
    department: "Produce",
    ingredients: [
      { name: "Long-grain rice", qty: "2 cups", dept: "Dry goods" },
      { name: "Tomato paste", qty: "3 tbsp", dept: "Dry goods" },
      { name: "Red bell pepper", qty: "2", dept: "Produce" },
      { name: "Collard or mustard greens", qty: "1 bunch", dept: "Produce" },
      { name: "Thyme", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Blend pepper with tomato paste, onion, and thyme.",
      "Fry the sauce, add rinsed rice and water, steam until tender.",
      "Braise greens in a second pan and serve over the rice.",
    ],
    why: "A one-pot grain that tastes like home for many tables, with greens for minerals.",
  },
  {
    id: "chicken-orzo",
    title: "Lemon Chicken Orzo Soup",
    summary: "A gentle pot of chicken, orzo, and lemon you can eat with a spoon.",
    stage: ["first", "second", "postpartum"],
    diets: ["nut-free", "halal"],
    minutes: 35,
    servings: 4,
    image: recipePhoto("chicken-orzo"),
    department: "Meat",
    ingredients: [
      { name: "Chicken thighs", qty: "1 lb", dept: "Meat" },
      { name: "Orzo or rice", qty: "1 cup", dept: "Dry goods" },
      { name: "Carrots", qty: "3", dept: "Produce" },
      { name: "Lemon", qty: "1", dept: "Produce" },
      { name: "Parsley", qty: "1 handful", dept: "Produce" },
    ],
    steps: [
      "Simmer chicken with carrot, onion, and salt until tender.",
      "Shred the meat, add orzo, cook until soft.",
      "Finish with lemon and parsley off the heat.",
    ],
    why: "Warm, wet food when chewing feels like too much work.",
  },
  {
    id: "soft-egg-toast",
    title: "Soft Egg Toast",
    summary: "Jammy eggs on toast with olive oil and herbs.",
    stage: ["trying", "first", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal", "kosher"],
    minutes: 12,
    servings: 2,
    image: recipePhoto("soft-egg-toast"),
    department: "Dairy",
    ingredients: [
      { name: "Eggs", qty: "4", dept: "Dairy" },
      { name: "Bread", qty: "4 slices", dept: "Bakery" },
      { name: "Olive oil", qty: "1 tbsp", dept: "Oils" },
      { name: "Herbs", qty: "1 handful", dept: "Produce" },
    ],
    steps: [
      "Boil eggs 7 minutes, then ice.",
      "Toast the bread, drizzle oil, slice eggs on top, finish with herbs and salt.",
    ],
    why: "Protein in twelve minutes when the morning is already spoken for.",
  },
  {
    id: "miso-sweet-potato",
    title: "Miso Roasted Sweet Potato",
    summary: "Split sweet potatoes with a miso-sesame glaze.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 40,
    servings: 2,
    image: recipePhoto("miso-sweet-potato"),
    department: "Produce",
    ingredients: [
      { name: "Sweet potatoes", qty: "2 large", dept: "Produce" },
      { name: "White miso", qty: "1 tbsp", dept: "Refrigerated" },
      { name: "Sesame oil or olive oil", qty: "1 tbsp", dept: "Oils" },
      { name: "Scallions", qty: "2", dept: "Produce" },
    ],
    steps: [
      "Roast sweet potatoes until collapsing.",
      "Stir miso with oil and a splash of water.",
      "Split, glaze, and finish with scallions.",
    ],
    why: "A whole meal from the oven — sweet, salty, and easy to digest.",
  },
  {
    id: "quinoa-salad",
    title: "Lime Quinoa Black Bean Salad",
    summary: "Room-temperature quinoa with beans, corn, and a sharp lime dressing.",
    stage: ["trying", "second", "third"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 25,
    servings: 4,
    image: recipePhoto("quinoa-salad"),
    department: "Produce",
    ingredients: [
      { name: "Quinoa", qty: "1 cup", dept: "Dry goods" },
      { name: "Black beans", qty: "1 can", dept: "Dry goods" },
      { name: "Corn", qty: "1 cup", dept: "Produce" },
      { name: "Lime", qty: "2", dept: "Produce" },
      { name: "Cilantro", qty: "1 handful", dept: "Produce" },
    ],
    steps: [
      "Cook quinoa and cool slightly.",
      "Fold in beans, corn, lime, oil, and cilantro.",
    ],
    why: "A lunch that sits well in the fridge and does not need reheating.",
  },
  {
    id: "stewed-apple",
    title: "Stewed Apple Yogurt Bowl",
    summary: "Soft apples with cinnamon over yogurt or coconut yogurt.",
    stage: ["trying", "first"],
    diets: ["vegetarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 18,
    servings: 2,
    image: recipePhoto("stewed-apple"),
    department: "Produce",
    ingredients: [
      { name: "Apples", qty: "3", dept: "Produce" },
      { name: "Cinnamon", qty: "1/2 tsp", dept: "Spices" },
      { name: "Yogurt or coconut yogurt", qty: "1.5 cups", dept: "Dairy" },
      { name: "Honey or maple", qty: "1 tbsp", dept: "Dry goods" },
    ],
    steps: [
      "Stew chopped apples with cinnamon and a splash of water until soft.",
      "Spoon over yogurt and drizzle honey if it sits well.",
    ],
    why: "Gentle fiber and calcium when a savory plate feels impossible.",
  },
  {
    id: "rice-porridge",
    title: "Ginger Rice Porridge",
    summary: "Congee-style rice simmered until it spoons, with ginger.",
    stage: ["first", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 45,
    servings: 3,
    image: recipePhoto("rice-porridge"),
    department: "Dry goods",
    ingredients: [
      { name: "Jasmine rice", qty: "3/4 cup", dept: "Dry goods" },
      { name: "Fresh ginger", qty: "1 in", dept: "Produce" },
      { name: "Scallions", qty: "2", dept: "Produce" },
      { name: "Soy sauce or coconut aminos", qty: "1 tbsp", dept: "Dry goods" },
    ],
    steps: [
      "Simmer rice in plenty of water with ginger until it breaks.",
      "Season lightly and finish with scallions.",
    ],
    why: "The plate that asks almost nothing of a nauseous or newly postpartum body.",
  },
  {
    id: "chickpea-spinach",
    title: "Chickpea Spinach Coconut Pan",
    summary: "Chickpeas in a tomato-coconut sauce with a heap of spinach.",
    stage: ["trying", "first", "second", "third", "postpartum"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 25,
    servings: 4,
    image: recipePhoto("chickpea-spinach"),
    department: "Produce",
    ingredients: [
      { name: "Chickpeas", qty: "2 cans", dept: "Dry goods" },
      { name: "Spinach", qty: "1 bag", dept: "Produce" },
      { name: "Coconut milk", qty: "1/2 can", dept: "Dry goods" },
      { name: "Tomatoes", qty: "1 can", dept: "Dry goods" },
      { name: "Cumin", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Warm spices in oil, add tomatoes and chickpeas.",
      "Stir in coconut milk, fold spinach until wilted.",
    ],
    why: "Plant iron and a sauce you can eat with rice, bread, or a spoon.",
  },
  {
    id: "banana-oat",
    title: "Banana Oat Skillet Cakes",
    summary: "Mashed banana, oats, and a hot pan — no mixer.",
    stage: ["trying", "first", "postpartum"],
    diets: ["vegetarian", "nut-free", "halal", "kosher"],
    minutes: 15,
    servings: 2,
    image: recipePhoto("banana-oat"),
    department: "Produce",
    ingredients: [
      { name: "Ripe bananas", qty: "2", dept: "Produce" },
      { name: "Rolled oats", qty: "1 cup", dept: "Dry goods" },
      { name: "Eggs", qty: "2", dept: "Dairy" },
      { name: "Cinnamon", qty: "1/2 tsp", dept: "Spices" },
    ],
    steps: [
      "Mash banana with egg, oats, and cinnamon.",
      "Spoon into a lightly oiled skillet and cook until golden.",
    ],
    why: "A sweet breakfast that uses what is already on the counter.",
  },
  {
    id: "turkey-chili",
    title: "Gentle Turkey Chili",
    summary: "A mild pot of turkey, beans, and tomato — spice stays optional.",
    stage: ["second", "third", "postpartum"],
    diets: ["gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 40,
    servings: 6,
    image: recipePhoto("turkey-chili"),
    department: "Meat",
    ingredients: [
      { name: "Ground turkey", qty: "1 lb", dept: "Meat" },
      { name: "Kidney or pinto beans", qty: "2 cans", dept: "Dry goods" },
      { name: "Crushed tomatoes", qty: "1 can", dept: "Dry goods" },
      { name: "Onion", qty: "1", dept: "Produce" },
      { name: "Chili powder", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Brown turkey with onion.",
      "Add tomatoes, beans, and a gentle amount of chili powder.",
      "Simmer 25 minutes. Finish with lime.",
    ],
    why: "A pot that feeds the week and reheats without asking you to cook again.",
  },
  {
    id: "beet-citrus",
    title: "Roasted Beet Citrus Plate",
    summary: "Warm beets, orange, and greens with olive oil.",
    stage: ["second", "third"],
    diets: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"],
    minutes: 50,
    servings: 3,
    image: recipePhoto("beet-citrus"),
    department: "Produce",
    ingredients: [
      { name: "Beets", qty: "4", dept: "Produce" },
      { name: "Oranges", qty: "2", dept: "Produce" },
      { name: "Leafy greens", qty: "4 cups", dept: "Produce" },
      { name: "Olive oil", qty: "2 tbsp", dept: "Oils" },
    ],
    steps: [
      "Roast beets until a knife slides through.",
      "Peel, slice, toss with orange segments, greens, oil, and salt.",
    ],
    why: "Folate and color on a plate that does not need a stove at serving time.",
  },
  {
    id: "sheet-chicken",
    title: "Sheet-Pan Chicken and Squash",
    summary: "Chicken, squash, and onion on one tray.",
    stage: ["second", "third", "postpartum"],
    diets: ["gluten-free", "dairy-free", "nut-free", "halal"],
    minutes: 45,
    servings: 4,
    image: recipePhoto("sheet-chicken"),
    department: "Meat",
    ingredients: [
      { name: "Chicken pieces", qty: "2 lb", dept: "Meat" },
      { name: "Butternut squash", qty: "1", dept: "Produce" },
      { name: "Onion", qty: "1", dept: "Produce" },
      { name: "Olive oil", qty: "2 tbsp", dept: "Oils" },
      { name: "Paprika", qty: "1 tsp", dept: "Spices" },
    ],
    steps: [
      "Toss everything with oil, salt, and paprika.",
      "Roast at 400°F until the chicken is cooked through and the squash is soft.",
    ],
    why: "One tray, leftover lunch, almost no dishes.",
  },
  {
    id: "cornmeal-porridge",
    title: "Cinnamon Cornmeal Porridge",
    summary: "Fine cornmeal simmered with milk, cinnamon, and banana.",
    stage: ["first", "postpartum"],
    diets: ["vegetarian", "gluten-free", "nut-free", "halal", "kosher"],
    minutes: 20,
    servings: 2,
    image: recipePhoto("cornmeal-porridge"),
    department: "Dry goods",
    ingredients: [
      { name: "Fine yellow cornmeal", qty: "3/4 cup", dept: "Dry goods" },
      { name: "Milk or oat milk", qty: "3 cups", dept: "Dairy" },
      { name: "Cinnamon", qty: "1/2 tsp", dept: "Spices" },
      { name: "Banana", qty: "1", dept: "Produce" },
      { name: "Vanilla", qty: "1/2 tsp", dept: "Spices" },
    ],
    steps: [
      "Whisk cornmeal into cold milk so it does not lump.",
      "Simmer, stirring, until thick and creamy.",
      "Finish with cinnamon, vanilla, and sliced banana.",
    ],
    why: "A warm bowl from Caribbean and Southern tables — easy to eat when energy is thin.",
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
    a: "No. Binding here is educational support for comfort, posture awareness, and cultural practice. Studio notes and photo comparison are educational, not medical clearance.",
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
  const dislikeBits = dislike.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  const flags = diets.filter((d): d is DietFlag => DIET_IDS.has(d));
  return RECIPES.filter((r) => {
    if (stage && !r.stage.includes(stage)) return false;
    if (flags.length && !flags.every((d) => r.diets.includes(d))) return false;
    if (dislikeBits.some((bit) => r.title.toLowerCase().includes(bit) || r.ingredients.some((ing) => ing.name.toLowerCase().includes(bit)))) {
      return false;
    }
    return true;
  });
}

export function recipePool(stage: Stage | null, diets: string[], dislikes: string) {
  const full = recipesFor(stage, diets, dislikes);
  if (full.length) return full;
  const one = diets.length ? recipesFor(stage, diets.slice(0, 1), dislikes) : [];
  if (one.length) return one;
  const byStage = recipesFor(stage, [], dislikes);
  return byStage.length ? byStage : RECIPES;
}
