// Inbound webhook receiver for chat platforms.
// Path: /api/public/webhook/$channel  (e.g. /api/public/webhook/line)
// Bypasses Lovable site auth (per /api/public/* convention).
// Normalizes inbound messages, stores them, and replies on supported channels.
import { createFileRoute } from "@tanstack/react-router";

type NormalizedMessage = {
  channel: string;
  externalUserId: string;
  userName?: string;
  text: string;
  replyToken?: string;
  raw: unknown;
  receivedAt: string;
};

type ChatIntegrationConfig = {
  token?: string;
  endpoint?: string;
  status?: string;
};

const jsonHeaders = { "Content-Type": "application/json" };

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function toBase64(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function verifyLineSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return { ok: true, skipped: true };
  if (!signature) return { ok: false, skipped: false };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const expected = toBase64(await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody)));
  return { ok: safeEqual(signature, expected), skipped: false };
}

async function getChatIntegration(channelType: string): Promise<ChatIntegrationConfig> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("chat_integrations")
      .select("raw_token, send_endpoint, status")
      .eq("channel_type", channelType.toUpperCase())
      .maybeSingle();

    if (error) {
      console.warn(`[webhook:${channelType.toLowerCase()}] integration lookup failed: ${error.message}`);
      return {};
    }

    return {
      token: data?.raw_token?.trim() || undefined,
      endpoint: data?.send_endpoint?.trim() || undefined,
      status: data?.status ?? undefined,
    };
  } catch (error) {
    console.warn(`[webhook:${channelType.toLowerCase()}] integration lookup skipped`, error);
    return {};
  }
}

async function updateIntegrationStatus(channelType: string, patch: { last_error?: string | null; last_sync?: string }) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("chat_integrations")
      .update({ ...patch, last_sync: patch.last_sync ?? new Date().toISOString() })
      .eq("channel_type", channelType.toUpperCase());
  } catch (error) {
    console.warn(`[webhook:${channelType.toLowerCase()}] integration status update skipped`, error);
  }
}

async function getLineProfile(userId: string, token: string) {
  if (!userId || userId === "unknown") return undefined;
  const res = await fetch(`https://api.line.me/v2/bot/profile/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.warn(`[webhook:line] profile lookup failed ${res.status}`);
    return undefined;
  }
  const profile = (await res.json()) as { displayName?: string };
  return profile.displayName?.trim() || undefined;
}

function normalize(channel: string, body: unknown): NormalizedMessage[] {
  const out: NormalizedMessage[] = [];
  const now = new Date().toISOString();
  const b = body as Record<string, unknown>;

  try {
    if (channel === "line") {
      const events = (b.events ?? []) as Array<Record<string, unknown>>;
      for (const ev of events) {
        if (ev.type !== "message") continue;
        const msg = ev.message as Record<string, unknown> | undefined;
        if (msg?.type && msg.type !== "text") continue;
        const src = ev.source as Record<string, unknown> | undefined;
        out.push({
          channel: "LINE",
          externalUserId: String(src?.userId ?? "unknown"),
          text: String(msg?.text ?? ""),
          replyToken: typeof ev.replyToken === "string" ? ev.replyToken : undefined,
          raw: ev,
          receivedAt: now,
        });
      }
    } else if (channel === "telegram") {
      const msg = (b.message ?? b.edited_message) as Record<string, unknown> | undefined;
      if (msg) {
        const from = msg.from as Record<string, unknown> | undefined;
        out.push({
          channel: "TELEGRAM",
          externalUserId: String(from?.id ?? "unknown"),
          userName: [from?.first_name, from?.last_name].filter(Boolean).join(" ") || undefined,
          text: String(msg.text ?? ""),
          raw: b,
          receivedAt: now,
        });
      }
    } else if (channel === "whatsapp" || channel === "messenger" || channel === "instagram") {
      const entries = (b.entry ?? []) as Array<Record<string, unknown>>;
      for (const e of entries) {
        const changes = (e.changes ?? []) as Array<Record<string, unknown>>;
        for (const c of changes) {
          const value = c.value as Record<string, unknown> | undefined;
          const msgs = (value?.messages ?? []) as Array<Record<string, unknown>>;
          for (const m of msgs) {
            out.push({
              channel: channel.toUpperCase(),
              externalUserId: String(m.from ?? "unknown"),
              text: String((m.text as Record<string, unknown> | undefined)?.body ?? ""),
              raw: m,
              receivedAt: now,
            });
          }
        }
        // Messenger / IG also nest under entry[].messaging[]
        const messaging = (e.messaging ?? []) as Array<Record<string, unknown>>;
        for (const m of messaging) {
          const sender = m.sender as Record<string, unknown> | undefined;
          const msg = m.message as Record<string, unknown> | undefined;
          if (!msg) continue;
          out.push({
            channel: channel.toUpperCase(),
            externalUserId: String(sender?.id ?? "unknown"),
            text: String(msg.text ?? ""),
            raw: m,
            receivedAt: now,
          });
        }
      }
    } else if (channel === "web" || channel === "custom") {
      out.push({
        channel: channel.toUpperCase(),
        externalUserId: String(b.userId ?? b.from ?? "web-anon"),
        userName: typeof b.userName === "string" ? b.userName : undefined,
        text: String(b.text ?? b.message ?? ""),
        raw: b,
        receivedAt: now,
      });
    }
  } catch (e) {
    console.error("[webhook] normalize error", e);
  }
  return out;
}

async function persist(messages: NormalizedMessage[]) {
  if (messages.length === 0) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = messages.map((m) => ({
      channel: m.channel,
      external_user_id: m.externalUserId,
      user_name: m.userName ?? null,
      text: m.text,
      raw: m.raw as never,
      received_at: m.receivedAt,
      sender: "customer",
      delivery_status: "received",
    }));
    const { error } = await supabaseAdmin.from("inbox_messages").insert(rows);
    if (error) console.warn("[webhook] insert failed (table may not exist yet):", error.message);
  } catch (e) {
    console.warn("[webhook] persistence skipped:", e);
  }
}

async function persistOutbound(message: NormalizedMessage, text: string, status: "sent" | "failed" | "skipped") {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("inbox_messages").insert({
      channel: message.channel,
      external_user_id: message.externalUserId,
      user_name: message.userName ?? null,
      text,
      raw: { direction: "outbound", source: "ai" } as never,
      received_at: new Date().toISOString(),
      sender: "ai",
      delivery_status: status,
    });
    if (error) console.warn("[webhook] outbound insert failed:", error.message);
  } catch (e) {
    console.warn("[webhook] outbound persistence skipped:", e);
  }
}

async function createAiText(message: NormalizedMessage) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    console.error("[webhook:line] LOVABLE_API_KEY missing; cannot generate AI reply");
    return "ตอนนี้ระบบ AI ยังไม่พร้อมใช้งาน ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ";
  }

  const [{ generateText }, { createLovableAiGatewayProvider }] = await Promise.all([
    import("ai"),
    import("@/lib/ai-gateway.server"),
  ]);
  const gateway = createLovableAiGatewayProvider(key);
  const result = await generateText({
    model: gateway("google/gemini-2.5-flash-lite"),
    system:
      "คุณคือผู้ช่วยแชทธุรกิจภาษาไทย ตอบลูกค้าทาง LINE ให้สุภาพ กระชับ เป็นธรรมชาติ ถ้าไม่มีข้อมูลแน่ชัดให้ขอรายละเอียดเพิ่ม และห้ามอ้างว่าระบบเป็น mock หรือ demo",
    prompt: `ข้อความลูกค้าจาก LINE user ${message.externalUserId}: ${message.text}`,
  });

  return result.text.trim() || "รับทราบครับ ขอรายละเอียดเพิ่มเติมได้เลยครับ";
}

async function replyToLine(message: NormalizedMessage) {
  const integration = await getChatIntegration("LINE");
  const token = integration.token || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("[webhook:line] LINE_CHANNEL_ACCESS_TOKEN missing; cannot send reply");
    await updateIntegrationStatus("LINE", { last_error: "missing_line_token" });
    return { ok: false, status: 500, error: "missing_line_token" };
  }
  if (integration.status && integration.status !== "connected") {
    await persistOutbound(message, "AI reply skipped: LINE integration is disabled", "skipped");
    return { ok: true, status: 200, skipped: "integration_disabled" };
  }
  if (!message.replyToken) {
    console.warn("[webhook:line] missing replyToken; received event cannot be replied to");
    await updateIntegrationStatus("LINE", { last_error: "missing_reply_token" });
    return { ok: false, status: 400, error: "missing_reply_token" };
  }
  if (!message.text.trim()) {
    return { ok: true, status: 200, skipped: "empty_text" };
  }

  if (!message.userName) {
    message.userName = await getLineProfile(message.externalUserId, token);
  }
  const text = await createAiText(message);
  const endpoint = integration.endpoint || "https://api.line.me/v2/bot/message/reply";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken: message.replyToken,
      messages: [{ type: "text", text: text.slice(0, 5000) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[webhook:line] reply failed ${res.status}: ${body.slice(0, 500)}`);
    await persistOutbound(message, text, "failed");
    await updateIntegrationStatus("LINE", { last_error: `LINE reply ${res.status}: ${body.slice(0, 300)}` });
    return { ok: false, status: res.status, error: body.slice(0, 500) };
  }

  await persistOutbound(message, text, "sent");
  await updateIntegrationStatus("LINE", { last_error: null });
  console.log(`[webhook:line] replied to ${message.externalUserId}`);
  return { ok: true, status: res.status };
}

async function processReplies(channel: string, messages: NormalizedMessage[]) {
  if (channel !== "line") return [];
  const results = [];
  for (const message of messages) {
    try {
      results.push(await replyToLine(message));
    } catch (error) {
      console.error("[webhook:line] reply error", error);
      results.push({ ok: false, status: 500, error: error instanceof Error ? error.message : "reply_error" });
    }
  }
  return results;
}

export const Route = createFileRoute("/api/public/webhook/$channel")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204 }),
      GET: async ({ params }) =>
        Response.json({
          ok: true,
          channel: params.channel,
          info: "POST your platform webhook here",
        }),
      POST: async ({ request, params }) => {
        const channel = params.channel.toLowerCase();
        const rawBody = await request.text();
        if (channel === "line") {
          const signature = await verifyLineSignature(rawBody, request.headers.get("x-line-signature"));
          if (!signature.ok) {
            console.warn("[webhook:line] invalid signature");
            return new Response(JSON.stringify({ ok: false, error: "invalid_line_signature" }), {
              status: 401,
              headers: jsonHeaders,
            });
          }
        }
        let body: unknown = {};
        try {
          body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          body = {};
        }
        const messages = normalize(channel, body);
        if (channel === "line" && messages.length > 0) {
          const integration = await getChatIntegration("LINE");
          const token = integration.token || process.env.LINE_CHANNEL_ACCESS_TOKEN;
          if (token) {
            await Promise.all(
              messages.map(async (message) => {
                message.userName = message.userName || (await getLineProfile(message.externalUserId, token));
              }),
            );
          }
        }
        console.log(`[webhook:${channel}] received ${messages.length} message(s)`);
        await persist(messages);
        const replies = await processReplies(channel, messages);
        // Most platforms expect a 200 quickly; never echo content back to the platform here.
        if (channel === "messenger" || channel === "instagram" || channel === "whatsapp") {
          return new Response("EVENT_RECEIVED", { status: 200 });
        }
        return Response.json({ ok: true, received: messages.length, replies });
      },
    },
  },
});
