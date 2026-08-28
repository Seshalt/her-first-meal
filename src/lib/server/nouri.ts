import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { asJson } from "./json";
import { ensureProfile } from "./profile";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";

const SYSTEM = `You are Nouri, the companion inside Her First Meal, a pregnancy and postpartum wellness home.
Your name is inspired by the word "nourish."

Voice: encouraging, calm, gentle, human, supportive, nonjudgmental. Never robotic. Never sycophantic. Mothers may be overwhelmed or frustrated — answer with patience and short paragraphs.

You help with: meal planning, grocery lists, pregnancy questions, wellness education, the pregnancy timeline, recipes, dietary preferences, grocery substitutions, movement, belly binding education, Her First Meal resources, encouragement, and navigation of the app.

You do NOT diagnose. You do NOT replace healthcare professionals. If a concern needs clinical care (bleeding, severe pain, suicidal thoughts, infant feeding emergencies, chest pain, preeclampsia signs, etc.), tell the member to contact their healthcare provider or emergency services. Do not provide methods of self-harm.

Belly binding feedback is educational only — placement, alignment, wrapping observations — never medical correctness.

Keep replies under 220 words unless they ask for a plan. Offer one clear next step. Use the member's name when you have it.`;

type Msg = { role: "user" | "assistant"; content: string };

export const getNouriThread = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; messages: unknown }>`
      select id, messages from nouri_conversations where user_id = ${context.userId} order by updated_at desc limit 1
    `;
    if (!rows[0]) return { id: null as number | null, messages: [] as Msg[] };
    return { id: rows[0].id, messages: asJson<Msg[]>(rows[0].messages, []) };
  });

export const askNouri = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string; about?: string }) => ({
    message: input.message.trim().slice(0, 2000),
    about: input.about?.slice(0, 400),
  }))
  .handler(async ({ context, data }) => {
    if (!data.message) return { ok: false as const, error: "Say a little more so I can meet you there." };
    const apiKey = process.env.XAI_API_KEY;
    const sql = await getSql();
    const profile = await ensureProfile(context.userId);
    const diet = await sql<{
      diets: unknown;
      allergies: unknown;
      avoids: string | null;
      dislikes: string | null;
      loves: string | null;
      cuisines: unknown;
    }>`select * from dietary_profiles where user_id = ${context.userId}`;
    const grocery = await sql<{ stores: unknown }>`select stores from grocery_preferences where user_id = ${context.userId}`;
    const settings = await sql<{ nouri_system_notes: string | null }>`select nouri_system_notes from business_settings where id = 1`;
    const existing = await sql<{ id: number; messages: unknown }>`
      select id, messages from nouri_conversations where user_id = ${context.userId} order by updated_at desc limit 1
    `;
    const history = asJson<Msg[]>(existing[0]?.messages, []).slice(-12);
    const week =
      profile.stage === "postpartum"
        ? postpartumWeekFromBirthday(profile.babyBirthday)
        : pregnancyWeekFromDueDate(profile.dueDate);
    const contextBlock = [
      `Member name: ${profile.displayName ?? "unknown"}`,
      `Stage: ${profile.stage ?? "unknown"}`,
      `Week estimate: ${week ?? "unknown"}`,
      `Household size: ${profile.householdSize}`,
      `Location: ${profile.city || profile.location || profile.zipCode || "not shared"}`,
      `Diets: ${asJson<string[]>(diet[0]?.diets, []).join(", ") || "none stated"}`,
      `Allergies: ${asJson<string[]>(diet[0]?.allergies, []).join(", ") || "none stated"}`,
      `Avoids: ${diet[0]?.avoids ?? "none"}`,
      `Dislikes: ${diet[0]?.dislikes ?? "none"}`,
      `Loves: ${diet[0]?.loves ?? "none"}`,
      `Cuisines: ${asJson<string[]>(diet[0]?.cuisines, []).join(", ") || "none"}`,
      `Stores: ${asJson<string[]>(grocery[0]?.stores, []).join(", ") || "none"}`,
      settings[0]?.nouri_system_notes ? `Owner notes for Nouri: ${settings[0].nouri_system_notes}` : "",
      data.about ? `The member is asking about: ${data.about}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!apiKey) {
      const fallback = fallbackNouri(data.message, profile.displayName);
      await persist(sql, context.userId, existing[0]?.id, history, data.message, fallback);
      return { ok: true as const, text: fallback, degraded: true };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "system", content: contextBlock },
          ...history,
          { role: "user", content: data.message },
        ],
      }),
    });
    if (!res.ok) {
      const fallback = fallbackNouri(data.message, profile.displayName);
      await persist(sql, context.userId, existing[0]?.id, history, data.message, fallback);
      return { ok: true as const, text: fallback, degraded: true };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() || fallbackNouri(data.message, profile.displayName);
    await persist(sql, context.userId, existing[0]?.id, history, data.message, text);
    return { ok: true as const, text, degraded: false };
  });

async function persist(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  id: number | undefined,
  history: Msg[],
  user: string,
  assistant: string,
) {
  const messages = [...history, { role: "user" as const, content: user }, { role: "assistant" as const, content: assistant }];
  if (id) {
    await sql`update nouri_conversations set messages = ${JSON.stringify(messages)}::jsonb, updated_at = now() where id = ${id} and user_id = ${userId}`;
  } else {
    await sql`insert into nouri_conversations (user_id, title, messages) values (${userId}, ${user.slice(0, 48)}, ${JSON.stringify(messages)}::jsonb)`;
  }
}

function fallbackNouri(message: string, name: string | null) {
  const who = name ? `${name}, ` : "";
  const lower = message.toLowerCase();
  if (lower.includes("bind")) {
    return `${who}belly binding here is educational, never a diagnosis. Start low at the pelvis, wrap on an exhale, and stop if breath or circulation feels pinched. Open Belly Binding Studio for the sequence, or ask your provider before you begin.`;
  }
  if (lower.includes("eat") || lower.includes("meal") || lower.includes("hungry")) {
    return `${who}let's keep this kind. A warm bowl, something with protein you already like, and water within reach is a complete act of care. Open Today's meals — I planned them around your preferences — or tell me what sounds possible.`;
  }
  return `${who}I'm here, and I will not rush you. Tell me whether you need food, rest, a wrap, a walk, or a question for your clinician, and we will take only the next kind step. I do not diagnose, and I never replace your healthcare team.`;
}

export const compareBindingPhotos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { angle: string; notes?: string; imageData?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const apiKey = process.env.XAI_API_KEY;
    const image = data.imageData && data.imageData.length < 450000 ? data.imageData : null;
    let feedback =
      "Educational observation only — not medical advice. Compare your wrap with the studio reference: the first pass should sit at the pelvis, edges even on both sides, and you should be able to take a full breath. Loosen if you feel tingling, dizziness, or restricted air.";
    if (apiKey) {
      const messages: unknown[] = [
        {
          role: "system",
          content:
            "You are Nouri offering educational belly-binding observations. Never diagnose. Never claim medical correctness. Comment on placement, alignment, evenness, and breath room. Keep under 140 words. State clearly that this is educational.",
        },
      ];
      const userContent: unknown[] = [
        {
          type: "text",
          text: `Angle: ${data.angle}. Member notes: ${data.notes || "none"}. Offer educational wrapping observations.`,
        },
      ];
      if (image?.startsWith("data:image")) {
        userContent.push({ type: "image_url", image_url: { url: image } });
      }
      messages.push({ role: "user", content: userContent });
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: "grok-4.5", max_tokens: 400, messages }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          feedback = body.choices?.[0]?.message?.content?.trim() || feedback;
        }
      } catch {
        /* keep fallback */
      }
    }
    await sql`
      insert into binding_uploads (user_id, angle, image_data, notes, ai_feedback)
      values (${context.userId}, ${data.angle}, ${image}, ${data.notes ?? null}, ${feedback})
    `;
    return { ok: true as const, feedback };
  });
