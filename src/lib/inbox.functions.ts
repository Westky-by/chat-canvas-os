import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SendInboxMessageInput = {
  channel: string;
  externalUserId: string;
  userName?: string | null;
  text: string;
  sender: "ai" | "admin";
};

const sendInputValidator = (data: unknown): SendInboxMessageInput => {
  const d = data as SendInboxMessageInput;
  if (!d?.channel || !d?.externalUserId || !d?.text?.trim()) throw new Error("ข้อความไม่ครบ");
  return {
    channel: d.channel,
    externalUserId: d.externalUserId,
    userName: d.userName ?? null,
    text: d.text.trim(),
    sender: d.sender === "ai" ? "ai" : "admin",
  };
};

async function getLineIntegration() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("chat_integrations")
    .select("raw_token, status")
    .eq("channel_type", "LINE")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function pushToLine(externalUserId: string, text: string) {
  const integration = await getLineIntegration();
  const token = integration?.raw_token?.trim() || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("ยังไม่มี LINE Channel Access Token");
  if (integration?.status && integration.status !== "connected") throw new Error("LINE integration ยังปิดอยู่");

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: externalUserId,
      messages: [{ type: "text", text: text.slice(0, 5000) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE push ${res.status}: ${body.slice(0, 300)}`);
  }
}

export const sendInboxMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(sendInputValidator)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let status: "sent" | "failed" = "sent";
    let errorMessage = "";

    if (data.channel.toUpperCase() === "LINE") {
      try {
        await pushToLine(data.externalUserId, data.text);
      } catch (error) {
        status = "failed";
        errorMessage = error instanceof Error ? error.message : "ส่ง LINE ไม่สำเร็จ";
      }
    }

    const { error } = await supabaseAdmin.from("inbox_messages").insert({
      channel: data.channel.toUpperCase(),
      external_user_id: data.externalUserId,
      user_name: data.userName ?? null,
      text: data.text,
      raw: { direction: "outbound", source: data.sender, error: errorMessage || undefined } as never,
      received_at: new Date().toISOString(),
      sender: data.sender,
      delivery_status: status,
    });
    if (error) throw new Error(error.message);
    if (status === "failed") throw new Error(errorMessage);
    return { ok: true };
  });

export const syncLineProfiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const integration = await getLineIntegration();
    const token = integration?.raw_token?.trim() || process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) return { updated: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("inbox_messages")
      .select("external_user_id")
      .eq("channel", "LINE")
      .or("user_name.is.null,user_name.eq.")
      .limit(50);
    if (error) throw new Error(error.message);

    const userIds = [...new Set((rows ?? []).map((r) => r.external_user_id).filter((id) => id && id !== "unknown"))];
    let updated = 0;

    for (const userId of userIds) {
      const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) continue;
      const profile = (await profileRes.json()) as { displayName?: string };
      const displayName = profile.displayName?.trim();
      if (!displayName) continue;

      await supabaseAdmin.from("inbox_messages").update({ user_name: displayName }).eq("channel", "LINE").eq("external_user_id", userId);
      await supabaseAdmin.from("customers").update({ name: displayName }).eq("channel", "LINE").eq("external_id", userId);
      updated += 1;
    }

    return { updated };
  });