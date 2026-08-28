export const MEMBERSHIP_INCLUDES = [
  "Today's Journey, unlocking by week",
  "Personalized meals for her real kitchen",
  "Grocery lists for the stores she uses",
  "Virtual pantry",
  "Belly Binding Studio",
  "Nouri, named for nourish",
  "Movement — optional, never punitive",
  "A private lane for her partner",
  "The resource library",
] as const;

export function yearlySavings(monthlyCents: number, yearlyCents: number) {
  const fullYearCents = monthlyCents * 12;
  const savedCents = Math.max(0, fullYearCents - yearlyCents);
  const percent = fullYearCents > 0 ? Math.round((savedCents / fullYearCents) * 100) : 0;
  const perMonthCents = Math.round(yearlyCents / 12);
  return { fullYearCents, savedCents, percent, perMonthCents };
}
