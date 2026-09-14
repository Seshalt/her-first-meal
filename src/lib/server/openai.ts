/**
 * Her First Meal is intentionally AI-free.
 * Keep this compatibility shim so an accidentally configured API key can never be spent.
 */
export function houseAiReady(): boolean {
  return false;
}

export async function houseChat(_input?: unknown): Promise<string | null> {
  return null;
}
