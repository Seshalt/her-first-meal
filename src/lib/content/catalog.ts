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
    image: "/images/meal-bowl.jpg",
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
    image: "/images/hydration.jpg",
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
    image: "/images/meal-bowl.jpg",
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
    image: "/images/family-table.jpg",
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
    image: "/images/hydration.jpg",
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
    image: "/images/meal-bowl.jpg",
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
    image: "/images/family-table.jpg",
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
    image: "/images/meal-bowl.jpg",
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
