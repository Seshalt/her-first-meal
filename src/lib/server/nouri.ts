import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { ensureProfile } from "./profile";
import { guideFor } from "@/lib/content/phase";
import type { Stage } from "@/lib/content/catalog";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { WEEKS } from "@/lib/content/catalog";

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
