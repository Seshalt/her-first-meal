type HouseChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type HouseChatInput = {
  system: string;
  messages: HouseChatMessage[];
};

type Provider = {
  key: string;
  url: string;
  model: string;
};

function provider(): Provider | null {
  const openAi = process.env.OPENAI_API_KEY?.trim();
  if (openAi) {
    return {
      key: openAi,
      url: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
    };
  }
  const xai = process.env.XAI_API_KEY?.trim();
  if (xai) {
    return {
      key: xai,
      url: "https://api.x.ai/v1/chat/completions",
      model: process.env.XAI_MODEL?.trim() || "grok-4-fast-reasoning",
    };
  }
  return null;
}

export function houseAiReady(): boolean {
  return Boolean(provider());
}

export async function houseChat(input: HouseChatInput): Promise<string | null> {
  const api = provider();
  if (!api) return null;

  const response = await fetch(api.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${api.key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: api.model,
      temperature: 0.45,
      max_tokens: 650,
      messages: [
        { role: "system", content: input.system },
        ...input.messages.slice(-10).map((message) => ({
          role: message.role,
          content: message.content.slice(0, 2200),
        })),
      ],
    }),
    signal: AbortSignal.timeout(18_000),
  });

  if (!response.ok) {
    console.error("[nouri] AI provider returned", response.status);
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text ? text.slice(0, 5000) : null;
}
