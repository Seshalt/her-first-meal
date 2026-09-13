import type { Stage } from "./catalog";

export type PhaseGuide = {
  kicker: string;
  title: string;
  nourish: string;
  move: string;
  grocery: string;
  rest: string;
  faqs: { q: string; a: string }[];
};

export const PHASE_GUIDE: Record<Stage, PhaseGuide> = {
  trying: {
    kicker: "Before the test",
    title: "This season is still a body, not a project.",
    nourish:
      "Iron, folate-forward plants, and meals you will actually finish. Skip the punishing cleanse. Warm breakfasts and a protein you like within reach are enough.",
    move: "Walks, hip openers, and breath. Intensity is optional. Regular is kinder than heroic.",
    grocery:
      "Keep the list short: oats, lentils, eggs or beans, citrus, dark greens, and the bread you digest well.",
    rest: "Sleep is part of the work. The house will not ask you to earn it.",
    faqs: [
      { q: "Do I need a special fertility plate?", a: "No. Eat in a way you can keep. Folate from food, a prenatal if your clinician recommended one, and less alcohol are the usual starting points — confirm with your provider." },
      { q: "Can I still drink coffee?", a: "Many clinicians allow a modest amount. We do not set a medical limit here. Ask the person who knows your labs." },
      { q: "The waiting is loud.", a: "That is allowed. Write Maat if you want a human note. This house will not turn the wait into a content plan." },
    ],
  },
  first: {
    kicker: "First trimester",
    title: "Survival food is still nourishment.",
    nourish:
      "Ginger, broths, toast, dates, yogurt if you eat dairy, and whatever stays down. Small, frequent, warm. Protein when it is possible — never as a test.",
    move: "Short walks and cat-cow if the back is heavy. Lie down when the room tilts. Stop for bleeding, fainting, or pain.",
    grocery:
      "Stock what you can smell: crackers, ginger, lemons, frozen fruit, broth, and one protein that does not turn the stomach.",
    rest: "Fatigue is information. Nap without apology. The table can be a bowl.",
    faqs: [
      { q: "I cannot cook.", a: "Then do not. Use the first-trimester plates: ginger broth, rice porridge, banana oat cakes, overnight oats. A partner can run the grocery list." },
      { q: "Nothing sounds good.", a: "That is common. Follow salt, cold, or dry if that is what stays. Write us if you need a substitution for a plate you already have." },
      { q: "When should I call my clinician?", a: "Bleeding, severe pain, inability to keep fluids, fainting, or a feeling that something is wrong. We do not diagnose from this house." },
    ],
  },
  second: {
    kicker: "Second trimester",
    title: "Appetite may return. The ligaments are already changing.",
    nourish:
      "Iron with vitamin C, calcium if you eat it, fish your diet allows, beans, and colorful plants. Cook once, eat twice. The week is built for a real kitchen.",
    move: "Walks, wall sits if they feel good, and yoga without overheating. Skip anything that increases pelvic pressure.",
    grocery: "Fill the list from this week's plates, then add what is in season where you live.",
    rest: "You may feel stronger and still need the afternoon. Both can be true.",
    faqs: [
      { q: "Can I eat fish?", a: "If pescatarian or omnivore, low-mercury fish like salmon appears in the catalog. Avoid raw fish. Your clinician has the last word on servings." },
      { q: "Heartburn started.", a: "Smaller plates, less lying down right after eating, and ginger or yogurt if they sit well. Swap a spicy plate from the library." },
      { q: "I want more energy.", a: "Look at iron-forward bowls (lentils, beans, greens) and hydration on Today. Movement is optional, never a punishment." },
    ],
  },
  third: {
    kicker: "Third trimester",
    title: "Breath sits higher. The work is carrying.",
    nourish:
      "Smaller, denser plates. Dates, yogurt, slow fish or beans, roasted trays. Keep water and a snack by the bed. Perfection is not a nutrient.",
    move: "Side-lying breath, porch walks, pelvic hum. Save heroics. Stop for dizziness or contractions that worry you.",
    grocery: "Think one-tray and one-pot. The list should fit a single store run.",
    rest: "Sleep will fragment. Rest still counts in pieces.",
    faqs: [
      { q: "I am too tired to stand at the stove.", a: "Use sheet-pan chicken, lentil bowls that reheat, overnight oats, and date bites. The library is filtered to this season." },
      { q: "Swelling and heartburn.", a: "Elevate when you can, salt to taste not to punish, and tell your provider about sudden swelling, headache, or vision changes." },
      { q: "What about dates?", a: "Date and tahini bites are in the catalog. They are food, not a labor protocol. Your midwife or doctor can speak to any late-pregnancy date advice." },
    ],
  },
  postpartum: {
    kicker: "Fourth trimester",
    title: "Healing is still pregnancy. The house stays open.",
    nourish:
      "Warm, wet, easy to eat with one hand: porridge, stews, eggs, lentils, bone-deep broths, and whatever culture you already cook. Iron and fluids. Someone else should heat the plate when they can.",
    move: "Only after your provider's clearance. Floor stretches, breath, short walks. Binding is education, never a cinch.",
    grocery:
      "Build the list for the person who will shop. Staples plus this week's plates. Do not improvise away what she can tolerate.",
    rest: "Sleep in shifts. Visitors can fold laundry or leave food. The baby is not the only patient.",
    faqs: [
      { q: "When can I bind?", a: "After your clinician says the body is ready — often after initial healing, and only with surgical guidance after a cesarean. The studio is educational." },
      { q: "I am not hungry.", a: "Warm liquids, dates, porridge, and a protein you already like. A small plate still counts. Ask your provider about bleeding, fever, or mood that scares you." },
      { q: "Who do I write?", a: "Maat reads every letter. Use Write us in the house or the public contact page. This is not an emergency line — call your clinician or 911 if you need medical care." },
    ],
  },
};

export function guideFor(stage: Stage | null): PhaseGuide {
  return PHASE_GUIDE[stage ?? "postpartum"];
}
