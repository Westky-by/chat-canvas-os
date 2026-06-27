import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { MessageCircle, Copy, Zap, ChevronDown, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerRole } from "@/hooks/useOwnerRole";
import type { Database } from "@/integrations/supabase/types";

type ChatIntegrationRow = Database["public"]["Tables"]["chat_integrations"]["Row"];

const LABEL_BY_CHANNEL: Record<
  string,
  {
    sub: string;
    inboundLabel: string;
    endpointLabel: string;
    endpointPlaceholder: string;
    endpointHelp: string;
    tokenLabel: string;
    tokenHelp: string;
    howTo: string[];
  }
> = {
  LINE: {
    sub: "LINE",
    inboundLabel: "Inbound URL (วางใน LINE Official Account → Webhook URL)",
    endpointLabel: "LINE Messaging API Endpoint",
    endpointPlaceholder: "https://api.line.me/v2/bot/message/reply",
    endpointHelp: "Endpoint สำหรับตอบกลับลูกค้า ใช้ /v2/bot/message/reply",
    tokenLabel: "Channel Access Token (long-lived)",
    tokenHelp: "คัดลอกจาก LINE Developers Console → Channel → Messaging API → Channel access token",
    howTo: [
      "LINE Developers Console → เลือก Channel ของคุณ",
      "แท็บ Messaging API → คัดลอก Channel access token",
      "วางในช่อง Token ด้านล่าง แล้วกด 'บันทึก'",
      "กลับไปวาง Inbound URL ในช่อง Webhook URL ของ LINE และเปิด Use webhook",
    ],
  },
  TELEGRAM: {
    sub: "TELEGRAM",
    inboundLabel: "Inbound URL (เรียก setWebhook ด้วย URL นี้)",
    endpointLabel: "Telegram Send Base (ไม่จำเป็น — ใช้ default)",
    endpointPlaceholder: "https://api.telegram.org",
    endpointHelp: "ใช้ค่า default ได้เลย ระบบจะเติม /bot<TOKEN>/sendMessage ให้อัตโนมัติ",
    tokenLabel: "Bot Token",
    tokenHelp: "จาก @BotFather → /newbot หรือ /token",
    howTo: [
      "คุยกับ @BotFather ใน Telegram → /newbot → รับ Bot Token",
      "วาง Bot Token ในช่อง Token ด้านล่าง แล้วกด 'บันทึก'",
      "เปิด https://api.telegram.org/bot<TOKEN>/setWebhook?url=<Inbound URL> ใน browser เพื่อ register webhook",
    ],
  },
  WHATSAPP: {
    sub: "WHATSAPP",
    inboundLabel: "Inbound URL (Meta Cloud API Webhook)",
    endpointLabel: "Cloud API Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages",
    endpointHelp: "Endpoint Meta Cloud API ที่ใช้ส่งข้อความออก",
    tokenLabel: "Permanent Access Token",
    tokenHelp: "จาก Meta for Developers → WhatsApp → API Setup",
    howTo: [
      "Meta for Developers → My Apps → เลือก WhatsApp",
      "API Setup → สร้าง Permanent token + คัดลอก Phone Number ID",
      "ใส่ Send URL (แทน <PHONE_NUMBER_ID>) และวาง token",
      "Configuration → Webhook ใส่ Inbound URL + Verify token",
    ],
  },
  MESSENGER: {
    sub: "MESSENGER",
    inboundLabel: "Inbound URL (Facebook App Messenger Webhook)",
    endpointLabel: "Messenger Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/me/messages",
    endpointHelp: "Graph API endpoint สำหรับส่งข้อความออก",
    tokenLabel: "Page Access Token",
    tokenHelp: "จาก Meta for Developers → App → Messenger → Settings → Access Tokens",
    howTo: [
      "สร้าง Facebook App → เพิ่ม Messenger Product",
      "เชื่อม Page → สร้าง Page Access Token",
      "ตั้งค่า Webhook ด้วย Inbound URL + Verify token",
    ],
  },
  INSTAGRAM: {
    sub: "INSTAGRAM",
    inboundLabel: "Inbound URL (Instagram Webhook)",
    endpointLabel: "Instagram Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/me/messages",
    endpointHelp: "ใช้ Graph API เดียวกับ Messenger",
    tokenLabel: "Page Access Token (IG Business)",
    tokenHelp: "เชื่อม IG Business Account กับ Facebook Page",
    howTo: [
      "เชื่อม IG Business Account กับ Facebook Page",
      "เปิด Instagram Messaging permissions ใน App",
      "ตั้ง Webhook ด้วย Inbound URL ด้านบน",
    ],
  },
  WEB: {
    sub: "WEB",
    inboundLabel: "Inbound URL (สำหรับฝัง widget เว็บไซต์)",
    endpointLabel: "Outbound (ไม่จำเป็น)",
    endpointPlaceholder: "",
    endpointHelp: "Web widget ตอบกลับผ่าน SSE/Polling ของระบบโดยตรง",
    tokenLabel: "Site Key (optional)",
    tokenHelp: "ใช้กรองโดเมนต้นทางหากต้องการ",
    howTo: ["Copy Inbound URL", "ฝัง <script> widget โดยตั้ง endpoint = Inbound URL"],
  },
  CUSTOM: {
    sub: "CUSTOM",
    inboundLabel: "Inbound URL (Custom Webhook)",
    endpointLabel: "Outbound Send URL (optional)",
    endpointPlaceholder: "https://your-system/send",
    endpointHelp: "ถ้าระบบของคุณต้องการให้เราเรียกกลับ ใส่ URL ที่นี่",
    tokenLabel: "Secret Token",
    tokenHelp: "ใช้ตรวจสอบ signature ของ webhook",
    howTo: [
      "ส่ง POST JSON มาที่ Inbound URL ด้านบน",
      "Payload ขั้นต่ำ: { userId, userName?, text }",
    ],
  },
};

const mask = (raw: string | null | undefined) => {
  if (!raw) return "—";
  return raw.length <= 4 ? "••••" : `•••• ${raw.slice(-4)}`;
};

export function ChatIntegrationsPage() {
  const { isOwner, loading: ownerLoading } = useOwnerRole();
  const [items, setItems] = useState<ChatIntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_integrations")
      .select("*")
      .order("channel_type", { ascending: true });
    if (error) {
      toast.error(`โหลด integrations ไม่สำเร็จ: ${error.message}`);
      setLoading(false);
      return;
    }
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ownerLoading) return;
    if (!isOwner) {
      setLoading(false);
      return;
    }
    refresh();
  }, [isOwner, ownerLoading, refresh]);

  if (ownerLoading || loading) {
    return (
      <PageContainer title="ตั้งค่า Webhook ช่องทางต่างๆ" description="กำลังตรวจสอบสิทธิ์…">
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </div>
      </PageContainer>
    );
  }

  if (!isOwner) {
    return (
      <PageContainer title="ตั้งค่า Webhook ช่องทางต่างๆ" description="">
        <div className="bg-warning/10 border border-warning/40 rounded-xl p-6 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <div className="font-semibold text-foreground">เฉพาะเจ้าของระบบเท่านั้น</div>
            <div className="text-xs text-muted-foreground mt-1">
              การจัดการ token ของช่องทางการแชทเป็นข้อมูลลับ — กรุณาเข้าสู่ระบบด้วยบัญชี Owner
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="ตั้งค่า Webhook ช่องทางต่างๆ"
      description="Webhook URL = ปลายทางที่ระบบส่งข้อความออก · Token = กุญแจของบัญชีคุณบนแพลตฟอร์มนั้น · Inbound URL = วางในหน้าตั้งค่าของแพลตฟอร์มเพื่อให้ส่งข้อความเข้าระบบเรา · ทุกค่าเก็บใน database จริง (server-side) ให้ webhook เรียกใช้ได้ทันที"
    >
      <div className="space-y-4">
        {items.map((i) => (
          <ChannelCard key={i.id} item={i} origin={origin} onChanged={refresh} />
        ))}
      </div>
    </PageContainer>
  );
}

function ChannelCard({
  item,
  origin,
  onChanged,
}: {
  item: ChatIntegrationRow;
  origin: string;
  onChanged: () => Promise<void>;
}) {
  const meta = LABEL_BY_CHANNEL[item.channel_type] ?? LABEL_BY_CHANNEL.CUSTOM;
  const fullInbound = origin ? `${origin}${item.inbound_path}` : item.inbound_path;

  const [endpoint, setEndpoint] = useState(item.send_endpoint ?? "");
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(item.status === "connected");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEndpoint(item.send_endpoint ?? "");
    setEnabled(item.status === "connected");
  }, [item.send_endpoint, item.status]);

  const save = async () => {
    setSaving(true);
    const patch: Database["public"]["Tables"]["chat_integrations"]["Update"] = {
      send_endpoint: endpoint,
      status: enabled ? "connected" : "disconnected",
      last_sync: new Date().toISOString(),
    };
    if (token) patch.raw_token = token;
    const { error } = await supabase.from("chat_integrations").update(patch).eq("id", item.id);
    setSaving(false);
    if (error) {
      toast.error(`บันทึกไม่สำเร็จ: ${error.message}`);
      return;
    }
    setToken("");
    toast.success(`บันทึก ${item.name} แล้ว — webhook พร้อมใช้งาน`);
    await onChanged();
  };

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    const { error } = await supabase
      .from("chat_integrations")
      .update({ status: next ? "connected" : "disconnected" })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      setEnabled(!next);
      return;
    }
    await onChanged();
  };

  const copy = () => {
    navigator.clipboard?.writeText(fullInbound);
    toast.success("คัดลอก Inbound URL แล้ว");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary grid place-items-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{item.name}</div>
            <div className="text-[11px] text-muted-foreground tracking-wide">{meta.sub}</div>
          </div>
        </div>
        <button
          onClick={toggleEnabled}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition ${
            enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`w-8 h-4 rounded-full relative transition ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition ${enabled ? "left-4" : "left-0.5"}`} />
          </span>
          {enabled ? "เปิดใช้งาน" : "ปิดอยู่"}
        </button>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground">{meta.inboundLabel}</label>
        <div className="mt-1 flex gap-2">
          <input readOnly value={fullInbound} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono" />
          <button onClick={copy} className="px-3 rounded-lg border border-border hover:bg-muted" title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">นำ URL นี้ไปวางในช่อง Webhook/Callback URL ของ {item.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground">{meta.endpointLabel}</label>
          <input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder={meta.endpointPlaceholder}
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{meta.endpointHelp}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">{meta.tokenLabel}</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={item.raw_token ? `ปัจจุบัน: ${mask(item.raw_token)} — กรอกใหม่เพื่อแทนที่` : "เช่น EAAG...ZD"}
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{meta.tokenHelp}</p>
        </div>
      </div>

      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        วิธีตั้งค่า {item.name} แบบทีละขั้น
      </button>
      {open && (
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-5">
          {meta.howTo.map((s, idx) => <li key={idx}>{s}</li>)}
        </ol>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => toast.info("ทดสอบ webhook: ลองส่งข้อความจริงจากแอป LINE/Telegram/Meta")}>Test</ActionButton>
        <ActionButton size="sm" variant="primary" onClick={save} disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </ActionButton>
      </div>
    </div>
  );
}
