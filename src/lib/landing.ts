import { RECIPE_IMAGE_ALT } from "@/lib/content/catalog";

export const LANDING_IMAGE_SLOTS = [
  { id: "logo", label: "Logo (header mark)", fallback: "", alt: "" },
  {
    id: "hero",
    label: "Home · full-screen opening",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman with an afro, eyes closed, photographed in a dark studio",
  },
  {
    id: "meals",
    label: "Home · meals",
    fallback: "/images/meal-bowl.jpg",
    alt: "Ceramic bowl of vegetable soup with tofu, herbs, and a spoon",
  },
  {
    id: "binding",
    label: "Home · belly binding",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant belly draped in sheer floral cloth, the wrap held with care",
  },
  {
    id: "bindingStill",
    label: "Home · wrap still life",
    fallback: "/images/binding-still.jpg",
    alt: "Folded patterned cloths and scarves prepared for wrapping",
  },
  {
    id: "rest",
    label: "Home · postpartum rest",
    fallback: "/images/postpartum-rest.jpg",
    alt: "Mother lying in bed holding her newborn against her chest",
  },
  {
    id: "movement",
    label: "Home · movement",
    fallback: "/images/movement.jpg",
    alt: "Pregnant woman stretching on a yoga ball in her living room",
  },
  {
    id: "nouri",
    label: "Home · Nouri",
    fallback: "/images/nouri-drop.jpg",
    alt: "Cup of herbal tea with ginger and lemon on a wooden tray",
  },
  {
    id: "family",
    label: "Home · family table",
    fallback: "/images/family-table.jpg",
    alt: "Family sharing a meal together at the table",
  },
  {
    id: "grocery",
    label: "Home · grocery / partner",
    fallback: "/images/grocery-partner.jpg",
    alt: "Couple cooking a meal together in a home kitchen",
  },
  {
    id: "hydration",
    label: "Home · hydration",
    fallback: "/images/hydration.jpg",
    alt: "Glass of lemon water on a wooden board",
  },
  {
    id: "about",
    label: "About · Maat",
    fallback: "/images/about-portrait.jpg",
    alt: "African woman smiling in warm, moody light",
  },
  {
    id: "login",
    label: "Sign in · photograph",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman with an afro, eyes closed, photographed in a dark studio",
  },
  {
    id: "join",
    label: "Join · photograph",
    fallback: "/images/family-table.jpg",
    alt: "Family sharing a meal together at the table",
  },
  {
    id: "pricing",
    label: "Membership · background",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman with an afro, eyes closed, photographed in a dark studio",
  },
  {
    id: "checkout",
    label: "Checkout · side photograph",
    fallback: "/images/meal-bowl.jpg",
    alt: "Ceramic bowl of vegetable soup with tofu, herbs, and a spoon",
  },
  {
    id: "bindHero",
    label: "Belly binding page · hero",
    fallback: "/images/binding-still.jpg",
    alt: "Folded patterned cloths and scarves prepared for wrapping",
  },
  {
    id: "bindStep1",
    label: "Binding step 1",
    fallback: "/images/binding-still.jpg",
    alt: "Folded patterned cloths and scarves prepared for wrapping",
  },
  {
    id: "bindStep2",
    label: "Binding step 2",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant belly draped in sheer floral cloth, the wrap held with care",
  },
  {
    id: "bindStep3",
    label: "Binding step 3",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant belly draped in sheer floral cloth, the wrap held with care",
  },
  {
    id: "bindStep4",
    label: "Binding step 4",
    fallback: "/images/postpartum-rest.jpg",
    alt: "Mother lying in bed holding her newborn against her chest",
  },
  {
    id: "nouriHero",
    label: "Nouri page · photograph",
    fallback: "/images/nouri-drop.jpg",
    alt: "Cup of herbal tea with ginger and lemon on a wooden tray",
  },
] as const;

export type LandingImageSlot = (typeof LANDING_IMAGE_SLOTS)[number]["id"];

/** Alt text keyed to the photo file, so every page uses the same words. */
export const IMAGE_ALT: Record<string, string> = {
  ...Object.fromEntries(LANDING_IMAGE_SLOTS.filter((s) => s.fallback).map((s) => [s.fallback.split("?")[0], s.alt])),
  ...RECIPE_IMAGE_ALT,
};

export function altFor(src: string, fallback = ""): string {
  if (!src) return fallback;
  const path = src.split("?")[0];
  return IMAGE_ALT[path] || fallback;
}

export function slotAlt(id: LandingImageSlot): string {
  return LANDING_IMAGE_SLOTS.find((s) => s.id === id)?.alt ?? "";
}

export type LandingCopy = {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  cta: string;
  secondaryCta: string;
  offerLine: string;
  manifesto: string;
  mealsKicker: string;
  mealsTitle: string;
  mealsBody: string;
  bindingKicker: string;
  bindingTitle: string;
  bindingBody: string;
  nouriKicker: string;
  nouriTitle: string;
  nouriBody: string;
  closeTitle: string;
  closeBody: string;
};

export const DEFAULT_LANDING_COPY: LandingCopy = {
  eyebrow: "Her First Meal",
  headline: "The world celebrates the baby.",
  headlineAccent: "We remember the mother.",
  subhead:
    "A membership home for pregnancy and postpartum — meals for her body, a belly binding studio, movement, grocery intelligence, and Nouri. Not a course. Not a blog. A house you return to.",
  cta: "Start your journey today",
  secondaryCta: "See membership",
  offerLine:
    "One membership opens the house: personalized meals, grocery and pantry planning, belly binding education, movement for her stage, week-by-week guidance, a partner lane, and Nouri. A private session with Maat is the only extra.",
  manifesto:
    "Before we ask what the baby needs, we set the table for the woman who grew them — with meals, wrapping education, recovery movement, and a partner who finally has somewhere useful to stand.",
  mealsKicker: "Nourishment",
  mealsTitle: "Meals that bow to her real kitchen.",
  mealsBody:
    "Members receive personalized meal guidance for pregnancy and postpartum — built around her culture, appetite, household size, budget, pantry, and the store she actually walks into. Not a default Western plate. Not a dump of recipes on day one.",
  bindingKicker: "Flagship practice",
  bindingTitle: "Belly binding, held with care.",
  bindingBody:
    "The Belly Binding Studio holds wrap education: studio video, wrap comparison, a private journal, and a live Zoom review when you want Maat’s eyes on the cloth. Teaching — never a diagnosis.",
  nouriKicker: "Companion",
  nouriTitle: "Need help? Ask Nouri.",
  nouriBody:
    "Nouri is the AI companion inside Her First Meal. She remembers your week, your plate, your stores, and your last conversation, and helps you find the meals, studio, and guidance already in the house. She will not pretend to be your clinician.",
  closeTitle: "What does her body need?",
  closeBody:
    "Membership is the house itself: personalized meals and grocery lists, pantry planning, the Belly Binding Studio, stage-right movement, week-by-week guidance, the partner lane, and Nouri. The only extra is a private meeting with Maat.",
};

export type LandingContent = LandingCopy & {
  images: Record<LandingImageSlot, string>;
  alts: Record<LandingImageSlot, string>;
};

export function defaultImages(): Record<LandingImageSlot, string> {
  return Object.fromEntries(
    LANDING_IMAGE_SLOTS.map((s) => [s.id, s.fallback ? `${s.fallback.split("?")[0]}?v=9` : s.fallback]),
  ) as Record<LandingImageSlot, string>;
}

export function defaultAlts(): Record<LandingImageSlot, string> {
  return Object.fromEntries(LANDING_IMAGE_SLOTS.map((s) => [s.id, s.alt])) as Record<
    LandingImageSlot,
    string
  >;
}

export function isLandingSlot(value: string): value is LandingImageSlot {
  return LANDING_IMAGE_SLOTS.some((s) => s.id === value);
}

export function mergeLanding(
  copy: Partial<LandingCopy> | null | undefined,
  images?: Partial<Record<LandingImageSlot, string>>,
): LandingContent {
  const base = defaultImages();
  if (images) {
    for (const slot of LANDING_IMAGE_SLOTS) {
      const next = images[slot.id];
      if (typeof next === "string" && next.trim()) base[slot.id] = next.trim();
    }
  }
  return {
    ...DEFAULT_LANDING_COPY,
    ...pickCopy(copy),
    images: base,
    alts: defaultAlts(),
  };
}

function pickCopy(copy: Partial<LandingCopy> | null | undefined): Partial<LandingCopy> {
  if (!copy) return {};
  const out: Partial<LandingCopy> = {};
  for (const key of Object.keys(DEFAULT_LANDING_COPY) as (keyof LandingCopy)[]) {
    const value = copy[key];
    if (typeof value === "string" && value.trim()) out[key] = value;
  }
  return out;
}

export const OFFER_TICKER = [
  "Personalized meals",
  "Belly Binding Studio",
  "Nouri",
  "Movement",
  "Grocery lists",
  "Partner lane",
  "Week-by-week journey",
  "Fourth trimester care",
];
