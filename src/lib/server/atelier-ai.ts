import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

function deny() {
  const err = new Error("Unauthorized");
  (err as Error & { status?: number }).status = 401;
  throw err;
}

export const applyAtelierEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string }) => ({ message: input.message.trim().slice(0, 600) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId}`;
    if (rows[0]?.role !== "admin") deny();
    if (!data.message) return { ok: false as const, text: "Describe the short piece of copy you need." };
    const key = process.env.GROQ_API_KEY;
    if (!key) return { ok: false as const, text: "Groq is not connected yet. Add GROQ_API_KEY as a server-only Vercel environment variable." };
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          max_completion_tokens: 450,
          messages: [
            { role: "system", content: "You draft brief website copy for Her First Meal, a maternal wellness service. Return only a concise draft, max 120 words. Do not invent credentials, clinical claims, prices, or services. Never provide medical advice. An owner reviews and manually applies every draft." },
            { role: "user", content: data.message },
          ],
        }),
      });
      if (!response.ok) return { ok: false as const, text: response.status === 429 ? "Groq's free rate limit was reached. Try later." : "Groq could not draft this right now." };
      const result = await response.json() as { choices?: { message?: { content?: string } }[] };
      const draft = result.choices?.[0]?.message?.content?.trim();
      if (!draft) return { ok: false as const, text: "Groq returned an empty draft. Try a shorter request." };
      return { ok: true as const, text: draft.slice(0, 1500) };
    } catch {
      return { ok: false as const, text: "Groq did not respond. Try again shortly." };
    }
  });
