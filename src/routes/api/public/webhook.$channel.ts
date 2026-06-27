// Inbound webhook receiver for chat platforms.
// Path: /api/public/webhook/$channel  (e.g. /api/public/webhook/line)
// Bypasses Lovable site auth (per /api/public/* convention).
// Normalizes inbound messages and stores them in `inbox_messages` if Supabase admin is configured.
import { createFileRoute } from "@tanstack/react-router";

type NormalizedMessage = {
  channel: string;
  externalUserId: string;
  userName?: string;
  text: string;
  raw: unknown;
  receivedAt: string;
};

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
        const src = ev.source as Record<string, unknown> | undefined;
        out.push({
          channel: "LINE",
          externalUserId: String(src?.userId ?? "unknown"),
          text: String(msg?.text ?? ""),
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
      raw: m.raw as object,
      received_at: m.receivedAt,
    }));
    const { error } = await supabaseAdmin.from("inbox_messages").insert(rows);
    if (error) console.warn("[webhook] insert failed (table may not exist yet):", error.message);
  } catch (e) {
    console.warn("[webhook] persistence skipped:", e);
  }
}

export const Route = createFileRoute("/api/public/webhook/$channel")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        Response.json({
          ok: true,
          channel: params.channel,
          info: "POST your platform webhook here",
        }),
      POST: async ({ request, params }) => {
        const channel = params.channel.toLowerCase();
        let body: unknown = {};
        try {
          body = await request.json();
        } catch {
          body = {};
        }
        const messages = normalize(channel, body);
        console.log(`[webhook:${channel}] received ${messages.length} message(s)`);
        await persist(messages);
        // Most platforms expect a 200 quickly; never echo content back to the platform here.
        if (channel === "messenger" || channel === "instagram" || channel === "whatsapp") {
          return new Response("EVENT_RECEIVED", { status: 200 });
        }
        return Response.json({ ok: true, received: messages.length });
      },
    },
  },
});
