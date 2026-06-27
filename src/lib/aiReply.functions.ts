import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";

export type AIReplyInput = {
  provider?: string;
  model?: string;
  systemPrompt?: string;
  userApiKey?: string; // optional override; when blank we use LOVABLE_API_KEY
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
};

const inputValidator = (data: unknown): AIReplyInput => {
  const d = data as AIReplyInput;
  if (!d || !Array.isArray(d.messages) || d.messages.length === 0) {
    throw new Error("messages is required");
  }
  return {
    provider: d.provider ?? "Lovable AI / Google Gemini API",
    model: d.model || "google/gemini-2.5-flash-lite",
    systemPrompt: d.systemPrompt ?? "",
    userApiKey: d.userApiKey ?? "",
    messages: d.messages,
  };
};

export const aiReply = createServerFn({ method: "POST" })
  .inputValidator(inputValidator)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const usingUserKey = !!data.userApiKey;

    // If user supplied a Gemini key, call Google's REST API directly.
    if (usingUserKey) {
      const model = data.model?.replace(/^google\//, "") || "gemini-2.5-flash-lite";
      const sys = data.systemPrompt?.trim();
      const contents = data.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      const body: Record<string, unknown> = { contents };
      if (sys) body.systemInstruction = { parts: [{ text: sys }] };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(data.userApiKey!)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini API ${res.status}: ${t.slice(0, 400)}`);
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return { text, provider: "Google Gemini (user key)", model };
    }

    // Otherwise use Lovable AI Gateway with project credit.
    if (!lovableKey) {
      throw new Error(
        "LOVABLE_API_KEY missing on server. Either configure it or provide your own Google Gemini API Key in AI Providers.",
      );
    }
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(lovableKey);
    const modelId =
      data.model && data.model.includes("/")
        ? data.model
        : `google/${data.model || "gemini-2.5-flash-lite"}`;

    const sys = data.systemPrompt?.trim();
    const messages = [
      ...(sys ? [{ role: "system" as const, content: sys }] : []),
      ...data.messages,
    ];

    const result = await generateText({
      model: gateway(modelId),
      messages,
    });

    return { text: result.text, provider: "Lovable AI Gateway", model: modelId };
  });
