export const LANDING_IMAGE_SLOTS = [
  { id: "logo", label: "Logo (header mark)", fallback: "" },
  { id: "hero", label: "Home · full-screen opening", fallback: "/images/hero-kitchen.jpg" },
  { id: "meals", label: "Home · meals", fallback: "/images/meal-bowl.jpg" },
  { id: "binding", label: "Home · belly binding", fallback: "/images/binding-hands.jpg" },
  { id: "bindingStill", label: "Home · wrap still life", fallback: "/images/binding-still.jpg" },
  { id: "rest", label: "Home · postpartum rest", fallback: "/images/postpartum-rest.jpg" },
  { id: "movement", label: "Home · movement", fallback: "/images/movement.jpg" },
  { id: "nouri", label: "Home · Nouri", fallback: "/images/nouri-drop.jpg" },
  { id: "family", label: "Home · family table", fallback: "/images/family-table.jpg" },
  { id: "grocery", label: "Home · grocery / partner", fallback: "/images/grocery-partner.jpg" },
  { id: "hydration", label: "Home · hydration", fallback: "/images/hydration.jpg" },
  { id: "about", label: "About · Maat", fallback: "/images/postpartum-rest.jpg" },
  { id: "login", label: "Sign in · photograph", fallback: "/images/hero-kitchen.jpg" },
  { id: "join", label: "Join · photograph", fallback: "/images/family-table.jpg" },
  { id: "pricing", label: "Membership · background", fallback: "/images/hero-kitchen.jpg" },
  { id: "checkout", label: "Checkout · side photograph", fallback: "/images/meal-bowl.jpg" },
  { id: "bindHero", label: "Belly binding page · hero", fallback: "/images/binding-still.jpg" },
  { id: "bindStep1", label: "Binding step 1", fallback: "/images/binding-still.jpg" },
  { id: "bindStep2", label: "Binding step 2", fallback: "/images/binding-hands.jpg" },
  { id: "bindStep3", label: "Binding step 3", fallback: "/images/binding-hands.jpg" },
  { id: "bindStep4", label: "Binding step 4", fallback: "/images/postpartum-rest.jpg" },
  { id: "nouriHero", label: "Nouri page · photograph", fallback: "/images/nouri-drop.jpg" },
] as const;

export type LandingImageSlot = (typeof LANDING_IMAGE_SLOTS)[number]["id"];

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
  eyebrow: "The world celebrates the baby.",
  headline: "Her First Meal",
  headlineAccent: "We remember the mother.",
  subhead:
    "A membership home for pregnancy and postpartum — meals for her body, a belly binding studio, movement, grocery intelligence, and Nouri. Not a course. Not a blog. A house you return to.",
  cta: "Start your journey today",
  secondaryCta: "See membership",
  offerLine: "One membership holds the house. A private meeting with Maat is the only extra.",
  manifesto:
    "Before we ask what the baby needs, we set the table for the woman who grew them. Culture, appetite, rest, wrapping, and a partner who finally has somewhere useful to stand.",
  mealsKicker: "Nourishment",
  mealsTitle: "Meals that bow to her real kitchen.",
  mealsBody:
    "Plans that respect diet, dislikes, household size, budget, and the grocery store she actually walks into. Not a default Western plate. Not a dump of recipes on day one.",
  bindingKicker: "Flagship practice",
  bindingTitle: "Belly binding, held with care.",
  bindingBody:
    "Studio video, wrap comparison, a private journal, and live Zoom review when you want Maat’s eyes on the wrap. Education — never a diagnosis.",
  nouriKicker: "Companion",
  nouriTitle: "Need help? Ask Nouri.",
  nouriBody:
    "Nouri is named for nourish. She remembers your week, your plate, your stores, and your last conversation. She will not pretend to be your clinician.",
  closeTitle: "What does her body need?",
  closeBody: "Membership includes meals, studio, Nouri, movement, grocery, pantry, and the partner lane. The only extra is a private meeting with Maat.",
};

export type LandingContent = LandingCopy & {
  images: Record<LandingImageSlot, string>;
};

export function defaultImages(): Record<LandingImageSlot, string> {
  return Object.fromEntries(LANDING_IMAGE_SLOTS.map((s) => [s.id, s.fallback])) as Record<
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
