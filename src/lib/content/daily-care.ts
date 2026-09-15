import type { Stage } from "@/lib/content/catalog";

export type DailyCareReading = {
  id: string;
  stages: Array<Stage | "any">;
  eyebrow: string;
  title: string;
  body: string;
  tip: string;
  note: string;
  minutes: number;
};

export const DAILY_CARE_READINGS: DailyCareReading[] = [
  {
    id: "appetite-is-information",
    stages: ["first", "second", "third", "postpartum"],
    eyebrow: "Body note",
    title: "Appetite is information, not a grade.",
    body: "Pregnancy and recovery can change hunger, fullness, taste, and what feels tolerable from one day to the next. A useful meal plan leaves room for that change instead of treating every day like the same assignment.",
    tip: "Keep one low-effort food you reliably tolerate within reach, then build around it when appetite is unpredictable.",
    note: "If eating or drinking is consistently difficult, or you are worried about symptoms, contact your healthcare team.",
    minutes: 2,
  },
  {
    id: "hydration-is-a-rhythm",
    stages: ["any"],
    eyebrow: "Daily rhythm",
    title: "Hydration works better as a rhythm than a rescue mission.",
    body: "Waiting until the end of the day can make hydration feel like another task to catch up on. Small, regular sips tied to routines are often easier to remember than a single big target.",
    tip: "Pair a drink with something that already happens: breakfast, taking a walk, opening your laptop, or feeding the baby.",
    note: "Your individual fluid needs can vary. Follow guidance from your clinician when you have one.",
    minutes: 2,
  },
  {
    id: "energy-changes",
    stages: ["first", "second", "third", "postpartum"],
    eyebrow: "Energy",
    title: "A lower-energy day does not mean you are falling behind.",
    body: "Your body can spend a lot of energy on work nobody else can see. Rest, slower movement, and simpler meals are still care — especially when sleep, nausea, soreness, or feeding demands change the day.",
    tip: "Choose the easiest useful version of one task today instead of forcing the ideal version of five tasks.",
    note: "New, severe, or concerning fatigue deserves a conversation with your healthcare team.",
    minutes: 2,
  },
  {
    id: "protein-through-day",
    stages: ["any"],
    eyebrow: "Nourishment",
    title: "Protein can be spread through the day.",
    body: "There is no prize for fitting everything into one large meal. Meals and snacks can each carry part of the work, which can be especially useful when appetite or time is limited.",
    tip: "Add one protein source to the next thing you already planned to eat — beans, lentils, eggs, yogurt, tofu, fish, poultry, nuts, or another option that fits you.",
    note: "Dietary needs differ by person, pregnancy, recovery, and medical history.",
    minutes: 3,
  },
  {
    id: "movement-can-be-small",
    stages: ["trying", "first", "second", "third", "postpartum"],
    eyebrow: "Movement",
    title: "Movement can be small and still count.",
    body: "A few minutes of comfortable movement can be useful without turning the day into a workout challenge. The goal is not punishment, calorie burn, or earning food.",
    tip: "Try one short movement break that feels comfortable: a slow walk, gentle mobility, or simply changing positions and breathing fully.",
    note: "Use the activity guidance your healthcare team has given you, especially after delivery or with pregnancy complications.",
    minutes: 2,
  },
  {
    id: "iron-and-vitamin-c",
    stages: ["first", "second", "third", "postpartum"],
    eyebrow: "Food pairing",
    title: "Some foods work better as a team.",
    body: "Iron-containing foods and vitamin-C-rich foods are a practical pairing to know about. That can look different across cultures and diets, so it does not need to mean one specific meal.",
    tip: "When it fits your diet, pair an iron-containing food with fruit, peppers, tomatoes, citrus, or another vitamin-C-rich food.",
    note: "Food is not a substitute for prescribed supplements or treatment. Ask your clinician about your iron needs.",
    minutes: 3,
  },
  {
    id: "third-trimester-space",
    stages: ["third"],
    eyebrow: "Third trimester",
    title: "Less room can change how a meal feels.",
    body: "As pregnancy advances, some people find that large meals feel less comfortable. That is one reason a flexible meal plan can be more useful than a rigid schedule.",
    tip: "If large meals feel uncomfortable, try making the next meal smaller and keep an easy snack available for later.",
    note: "Persistent pain, vomiting, or symptoms that worry you should be discussed with your healthcare team.",
    minutes: 2,
  },
  {
    id: "first-trimester-flexibility",
    stages: ["first"],
    eyebrow: "First trimester",
    title: "The best meal is sometimes the one that stays down.",
    body: "Early pregnancy can make familiar foods suddenly unappealing. A useful food plan can prioritize what is tolerable while still offering variety when your appetite gives you more room.",
    tip: "Keep a short list of foods that currently feel reliable so grocery planning does not start from zero on a harder day.",
    note: "If you cannot keep fluids down or are concerned about dehydration, contact your healthcare team promptly.",
    minutes: 2,
  },
  {
    id: "second-trimester-check-in",
    stages: ["second"],
    eyebrow: "Second trimester",
    title: "Feeling better does not mean every day has to be productive.",
    body: "Energy may shift during the second trimester, but there is no requirement to turn that change into a packed schedule. Your body is still doing continuous work.",
    tip: "Use any extra energy for the thing that matters most today, then leave some margin instead of filling every open space.",
    note: "Your experience may be very different from someone else’s, and that can still be normal.",
    minutes: 2,
  },
  {
    id: "postpartum-recovery-not-linear",
    stages: ["postpartum"],
    eyebrow: "Fourth trimester",
    title: "Recovery is not a straight line.",
    body: "A day that feels easier can be followed by a day that feels heavier. Sleep, feeding, healing, support, and hormones can all change what your body has available.",
    tip: "Before adding a new task today, ask what can be removed, shared, delayed, or made easier.",
    note: "Postpartum symptoms that feel severe, sudden, unsafe, or emotionally overwhelming deserve prompt professional support.",
    minutes: 3,
  },
  {
    id: "trying-gentle-routine",
    stages: ["trying"],
    eyebrow: "Trying",
    title: "A steady routine can be enough.",
    body: "Trying to conceive can invite a lot of rules. A calmer foundation — regular meals, rest, movement you enjoy, and the care your clinician recommends — can be more sustainable than constantly optimizing every choice.",
    tip: "Pick one routine that makes tomorrow easier, such as prepping breakfast or restocking one reliable snack.",
    note: "Fertility questions and supplement decisions are best discussed with a qualified healthcare professional.",
    minutes: 3,
  },
  {
    id: "support-is-practical",
    stages: ["any"],
    eyebrow: "Support",
    title: "Support is more useful when it is specific.",
    body: "People often want to help but do not know what would actually reduce your load. A concrete ask gives them somewhere useful to stand.",
    tip: "Ask for one specific thing today: pick up groceries, wash bottles, bring a meal, take a walk with you, or handle one household task.",
    note: "You do not have to wait until you are overwhelmed to ask for support.",
    minutes: 2,
  },
];

export function dailyCareFor(stage: Stage | null, date = new Date()): DailyCareReading {
  const eligible = DAILY_CARE_READINGS.filter((reading) => reading.stages.includes("any") || (stage ? reading.stages.includes(stage) : false));
  const pool = eligible.length ? eligible : DAILY_CARE_READINGS;
  const dayKey = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return pool[Math.abs(dayKey) % pool.length];
}
