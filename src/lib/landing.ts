import { RECIPE_IMAGE_ALT } from "@/lib/content/catalog";

export const LANDING_IMAGE_SLOTS = [
  { id: "logo", label: "Logo (header mark)", fallback: "", alt: "" },
  {
    id: "hero",
    label: "Home · full-screen opening",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman in a kitchen, one hand on her belly",
  },
  {
    id: "meals",
    label: "Home · meals",
    fallback: "/images/meal-bowl.jpg",
    alt: "Bowl of golden soup with herbs on a wooden table",
  },
  {
    id: "binding",
    label: "Home · belly binding",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant woman in a white dress standing outdoors, both hands on her belly",
  },
  {
    id: "bindingStill",
    label: "Home · wrap still life",
    fallback: "/images/binding-still.jpg",
    alt: "Folded cream linen cloth laid on a bed",
  },
  {
    id: "rest",
    label: "Home · postpartum rest",
    fallback: "/images/postpartum-rest.jpg",
    alt: "Latina mother standing outside, holding her baby close",
  },
  {
    id: "movement",
    label: "Home · movement",
    fallback: "/images/movement.jpg",
    alt: "Asian woman in a yoga pose on a mat",
  },
  {
    id: "nouri",
    label: "Home · Nouri",
    fallback: "/images/nouri-drop.jpg",
    alt: "Hot tea pouring into a ceramic cup",
  },
  {
    id: "family",
    label: "Home · family table",
    fallback: "/images/family-table.jpg",
    alt: "East Asian family sitting together at a dining table",
  },
  {
    id: "grocery",
    label: "Home · grocery / partner",
    fallback: "/images/grocery-partner.jpg",
    alt: "Hands holding a bag of fresh produce at a market",
  },
  {
    id: "hydration",
    label: "Home · hydration",
    fallback: "/images/hydration.jpg",
    alt: "Glass of lemon water on a sunlit table",
  },
  {
    id: "about",
    label: "About · Maat",
    fallback: "/images/about-portrait.jpg",
    alt: "Indian woman cooking at a stove",
  },
  {
    id: "login",
    label: "Sign in · photograph",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman in a kitchen, one hand on her belly",
  },
  {
    id: "join",
    label: "Join · photograph",
    fallback: "/images/family-table.jpg",
    alt: "East Asian family sitting together at a dining table",
  },
  {
    id: "pricing",
    label: "Membership · background",
    fallback: "/images/hero-kitchen.jpg",
    alt: "African American pregnant woman in a kitchen, one hand on her belly",
  },
  {
    id: "checkout",
    label: "Checkout · side photograph",
    fallback: "/images/meal-bowl.jpg",
    alt: "Bowl of golden soup with herbs on a wooden table",
  },
  {
    id: "bindHero",
    label: "Belly binding page · hero",
    fallback: "/images/binding-still.jpg",
    alt: "Folded cream linen cloth laid on a bed",
  },
  {
    id: "bindStep1",
    label: "Binding step 1",
    fallback: "/images/binding-still.jpg",
    alt: "Folded cream linen cloth laid on a bed",
  },
  {
    id: "bindStep2",
    label: "Binding step 2",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant woman in a white dress standing outdoors, both hands on her belly",
  },
  {
    id: "bindStep3",
    label: "Binding step 3",
    fallback: "/images/binding-hands.jpg",
    alt: "Pregnant woman in a white dress standing outdoors, both hands on her belly",
  },
  {
    id: "bindStep4",
    label: "Binding step 4",
    fallback: "/images/postpartum-rest.jpg",
    alt: "Latina mother standing outside, holding her baby close",
  },
  {
    id: "nouriHero",
    label: "Nouri page · photograph",
    fallback: "/images/nouri-drop.jpg",
    alt: "Hot tea pouring into a ceramic cup",
  },
] as const;

export type LandingImageSlot = (typeof LANDING_IMAGE_SLOTS)[number]["id"];

/** Alt text keyed to the photo file, so every page uses the same words. */
export const IMAGE_ALT: Record<string, string> = {
  ...Object.fromEntries(LANDING_IMAGE_SLOTS.filter((s) => s.fallback).map((s) => [s.fallback, s.alt])),
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
    "A membership home for pregnancy and postpartum — meals for her body, a belly binding studio, movement, grocery lists for her market, and a letter to Maat. Not a course. Not a blog. A house you return to.",
  cta: "Start your journey today",
  secondaryCta: "See membership",
  offerLine:
    "One membership opens the house: personalized meals, grocery and pantry planning, belly binding education, movement for her stage, week-by-week guidance, and a partner lane. A private session with Maat is the only extra.",
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
  nouriKicker: "The house answers",
  nouriTitle: "A question still has a person behind it.",
  nouriBody:
    "There is no chatbot in this house. Meals, grocery lists, and season guidance follow the stage, diet, and state you share. When you need a human, write Maat — she reads every letter.",
  closeTitle: "What does her body need?",
  closeBody:
    "Membership is the house itself: personalized meals and grocery lists, pantry planning, the Belly Binding Studio, stage-right movement, week-by-week guidance, and the partner lane. The only extra is a private meeting with Maat.",
};

export type LandingContent = LandingCopy & {
  images: Record<LandingImageSlot, string>;
  alts: Record<LandingImageSlot, string>;
};

export function defaultImages(): Record<LandingImageSlot, string> {
  return Object.fromEntries(LANDING_IMAGE_SLOTS.map((s) => [s.id, s.fallback])) as Record<
    LandingImageSlot,
    string
  >;
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

