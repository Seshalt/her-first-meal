/** Every visible string should pass through `t()` so layouts can later swap locales. */
export const messages = {
  brand: "Her First Meal",
  tagline: "The world celebrates the baby. We remember the mother.",
  cta: "Start your journey today",
  memberLogin: "Member login",
  askNouri: "Ask Nouri",
  talkToNouri: "Talk to Nouri",
  unauthorized: "This page isn't available.",
  loading: "Gathering your table…",
} as const;

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey): string {
  return messages[key];
}
