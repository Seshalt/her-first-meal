import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { ensureProfile } from "./profile";
import { guideFor } from "@/lib/content/phase";
import type { Stage } from "@/lib/content/catalog";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { WEEKS } from "@/lib/content/catalog";
import { houseAiReady, houseChat } from "./openai";
import { quotaMessage, takeAiTurn } from "./ai-quota";

export const getPhaseGuide = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    const stage = (profile.stage as Stage | null) ?? "postpartum";
    const week =
      stage === "postpartum"
        ? postpartumWeekFromBirthday(profile.babyBirthday)
        : pregnancyWeekFromDueDate(profile.dueDate);
    const weekCopy = week ? WEEKS.find((w) => w.week === week) ?? null : null;
    return {
      stage,
      week,
      guide: guideFor(stage),
      weekCopy,
      displayName: profile.displayName,
      stateCode: profile.stateCode,
    };
  });


type NouriHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export const askNouri = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string; locale?: string; history?: NouriHistoryItem[] }) => ({
    message: input.message.trim().slice(0, 2200),
    locale: (input.locale || "en").slice(0, 12),
    history: (input.history || []).slice(-8).map((item) => ({
      role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(item.content || "").slice(0, 2200),
    })),
  }))
  .handler(async ({ context, data }) => {
    if (data.message.length < 2) throw new Error("Ask Nouri a little more so she can help.");

    const profile = await ensureProfile(context.userId);
    const stage = (profile.stage as Stage | null) ?? "postpartum";
    const week =
      stage === "postpartum"
        ? postpartumWeekFromBirthday(profile.babyBirthday)
        : pregnancyWeekFromDueDate(profile.dueDate);
    const guide = guideFor(stage);

    if (!houseAiReady()) {
      return {
        ok: true as const,
        ai: false,
        left: null,
        reply: `Nouri is being connected to the house right now. For ${stage}, start here: ${guide.nourish} ${guide.rest} For urgent or medical concerns, contact your healthcare professional.`,
      };
    }

    const turn = await takeAiTurn(context.userId, "nouri");
    if (!turn.ok) {
      return { ok: true as const, ai: true, left: 0, reply: quotaMessage("nouri") };
    }

    const sql = await getSql();
    const dietRows = await sql<{ diets: unknown; allergies: unknown }>`
      select diets, allergies from dietary_profiles where user_id = ${context.userId}
    `;
    const storeRows = await sql<{ stores: unknown }>`
      select stores from grocery_preferences where user_id = ${context.userId}
    `;
    const parseList = (value: unknown) => {
      if (Array.isArray(value)) return value.map(String);
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    const dietary = parseList(dietRows[0]?.diets).join(", ") || "not set";
    const allergies = parseList(dietRows[0]?.allergies).join(", ") || "none listed";
    const stores = parseList(storeRows[0]?.stores).join(", ") || "not set";
    const system = [
      "You are Nouri, the calm wellness companion inside Her First Meal.",
      "Your job is to support pregnant and postpartum people with practical, warm, nonjudgmental education and navigation.",
      "You can help with meal planning, groceries, recipes, pregnancy/postpartum education, movement, belly binding education, encouragement, and finding Her First Meal resources.",
      "Never diagnose, prescribe, claim medical correctness, or replace a healthcare professional. For symptoms, emergencies, medication questions, complications, or anything clinically concerning, clearly encourage contacting an appropriate healthcare professional or emergency service.",
      "Do not shame food choices, bodies, feeding choices, birth choices, or cultural practices.",
      "Keep responses concise and useful. Prefer 2-5 short paragraphs or a small set of steps.",
      `Respond naturally in the user's selected language code: ${data.locale}.`,
      `Authorized member context: stage=${stage}; week=${week ?? "unknown"}; dietary preferences=${dietary}; allergies=${allergies}; stores=${stores}; state=${profile.stateCode ?? "not set"}.`,
      "Use only this authorized context and what the member says in the conversation. Do not invent medical records or private facts.",
    ].join("\n");

    const reply = await houseChat({
      system,
      messages: [...data.history, { role: "user", content: data.message }],
    });

    if (!reply) {
      return {
        ok: true as const,
        ai: true,
        left: turn.left,
        reply: `I couldn't reach the full Nouri service for this message. For ${stage}, one useful place to begin is: ${guide.nourish} If this is a medical concern, contact your healthcare professional.`,
      };
    }

    return { ok: true as const, ai: true, left: turn.left, reply };
  });

const ANGLE_NOTES: Record<string, string> = {
  front:
    "From the front: the first pass should sit at the widest part of the pelvis, not the ribs. Edges should look even left to right. You should still take a full breath.",
  left: "From the left: the cloth should lie flat without a sharp diagonal that cuts under the ribs. Loosen if you feel tingling or dizziness.",
  right: "From the right: match the left side. Uneven height usually means the first pass started too high.",
  back: "From the back: the wrap should look like a spiral, not a cinch at the waist. If the fabric bunches at the lumbar, unwind and start lower.",
};

export const compareBindingPhotos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { angle: string; notes?: string; imageData?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const image = data.imageData && data.imageData.length < 450000 ? data.imageData : null;
    const angleNote = ANGLE_NOTES[data.angle] ?? ANGLE_NOTES.front;
    const feedback = [
      "Educational observation only — not medical advice.",
      angleNote,
      data.notes?.trim() ? `You noted: ${data.notes.trim().slice(0, 240)}` : "",
      "Loosen immediately for numbness, sharp pain, or restricted breath. Ask your clinician before you begin, especially after surgery.",
    ]
      .filter(Boolean)
      .join(" ");
    await sql`
      insert into binding_uploads (user_id, angle, image_data, notes, ai_feedback)
      values (${context.userId}, ${data.angle}, ${image}, ${data.notes ?? null}, ${feedback})
    `;
    return { ok: true as const, feedback };
  });
