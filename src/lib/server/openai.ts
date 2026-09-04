type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function houseAiReady(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() || process.env.XAI_API_KEY?.trim());
}

export async function houseChat(input: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  json?: boolean;
}): Promise<string | null> {
  const openai = process.env.OPENAI_API_KEY?.trim();
  const xai = process.env.XAI_API_KEY?.trim();
  if (openai) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openai}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: input.maxTokens ?? 900,
        temperature: 0.7,
        response_format: input.json ? { type: "json_object" } : undefined,
        messages: [{ role: "system", content: input.system }, ...input.messages.filter((m) => m.role !== "system")],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() || null;
  }
  if (xai) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${xai}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: input.maxTokens ?? 900,
        temperature: 0.7,
        messages: [{ role: "system", content: input.system }, ...input.messages.filter((m) => m.role !== "system")],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() || null;
  }
  return null;
}
