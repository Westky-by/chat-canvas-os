import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { MessageCircle, Copy, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { ChatIntegration, ChatChannelType } from "@/types";

const LABEL_BY_CHANNEL: Record<ChatChannelType, { sub: string; inboundLabel: string; endpointLabel: string; endpointPlaceholder: string; endpointHelp: string; tokenLabel: string; tokenHelp: string; howTo: string[] }> = {
  LINE: {
    sub: "LINE",
    inboundLabel: "Inbound URL (วางใน LINE Official Account)",
    endpointLabel: "LINE Messaging API Endpoint",
    endpointPlaceholder: "https://api.line.me/v2/bot/message/reply",
    endpointHelp: "Endpoint ที่ระบบใช้ส่งข้อความออกกลับไปหาลูกค้าทาง LINE สำหรับการตอบกลับจาก webhook ให้ใช้ /v2/bot/message/reply",
    tokenLabel: "Channel Access Token (long-lived)",
    tokenHelp: "คัดลอกจาก LINE Developers Console → Provider → Channel → Messaging API → Channel access token",
    howTo: [
      "ไปที่ LINE Developers Console → Provider ของคุณ → Channel ที่ใช้",
      "ไปที่แท็บ Messaging API",
      "คัดลอกค่า Channel access token (long-lived) มาวางในช่อง Token",
      "วาง Inbound URL ด้านบนในช่อง Webhook URL ของ LINE และเปิด Use webhook",
    ],
  },
  WHATSAPP: {
    sub: "WHATSAPP",
    inboundLabel: "Inbound URL (วางใน WhatsApp Business (Meta Cloud API))",
    endpointLabel: "Cloud API Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages",
    endpointHelp: "Endpoint ของ Meta Cloud API สำหรับส่งข้อความออก เช่น https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages",
    tokenLabel: "Permanent Access Token",
    tokenHelp: "สร้างจาก Meta for Developers → My Apps → WhatsApp → API Setup → Permanent token",
    howTo: [
      "เปิด Meta for Developers → My Apps → เลือก WhatsApp",
      "ไปที่ API Setup คัดลอก Phone Number ID และสร้าง Permanent token",
      "ใส่ Send URL ตามเทมเพลตด้านบน (แทน <PHONE_NUMBER_ID>) และวาง token",
      "ไปที่ Configuration → Webhook ใส่ Inbound URL ด้านบน + Verify token",
    ],
  },
  TELEGRAM: {
    sub: "TELEGRAM",
    inboundLabel: "Inbound URL (วางใน Telegram setWebhook)",
    endpointLabel: "Telegram Send URL",
    endpointPlaceholder: "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage",
    endpointHelp: "URL ที่ใช้ส่งข้อความ ใช้ bot token แทน <BOT_TOKEN>",
    tokenLabel: "Bot Token",
    tokenHelp: "จาก @BotFather → /newbot หรือ /token",
    howTo: [
      "คุยกับ @BotFather เพื่อสร้าง bot และรับ token",
      "วาง token ในช่อง Token",
      "เรียก https://api.telegram.org/bot<TOKEN>/setWebhook?url=<Inbound URL>",
    ],
  },
  MESSENGER: {
    sub: "MESSENGER",
    inboundLabel: "Inbound URL (วางใน Facebook App Messenger Webhook)",
    endpointLabel: "Messenger Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/me/messages",
    endpointHelp: "Graph API endpoint สำหรับส่งข้อความออก",
    tokenLabel: "Page Access Token",
    tokenHelp: "จาก Meta for Developers → App → Messenger → Settings → Access Tokens",
    howTo: [
      "สร้าง Facebook App → เพิ่ม Messenger Product",
      "เชื่อม Page และสร้าง Page Access Token",
      "ตั้งค่า Webhook ด้วย Inbound URL ด้านบน + Verify token",
    ],
  },
  INSTAGRAM: {
    sub: "INSTAGRAM",
    inboundLabel: "Inbound URL (วางใน Instagram Webhook)",
    endpointLabel: "Instagram Send URL",
    endpointPlaceholder: "https://graph.facebook.com/v20.0/me/messages",
    endpointHelp: "ใช้ Graph API เดียวกับ Messenger",
    tokenLabel: "Page Access Token (เชื่อม IG Business)",
    tokenHelp: "เชื่อม IG Business Account กับ Facebook Page แล้วใช้ Page Access Token",
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
    howTo: [
      "Copy Inbound URL ด้านบน",
      "ฝัง <script> widget ใน HTML และตั้ง endpoint = Inbound URL",
    ],
  },
  CUSTOM: {
    sub: "CUSTOM",
    inboundLabel: "Inbound URL (Custom Webhook)",
    endpointLabel: "Outbound Send URL (ไม่จำเป็น)",
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

export function ChatIntegrationsPage() {
  const items = useAppStore((s) => s.chatIntegrations);
  const update = useAppStore((s) => s.updateChatIntegration);
  const test = useAppStore((s) => s.testChatWebhook);

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  return (
    <PageContainer
      title="ตั้งค่า Webhook ช่องทางต่างๆ"
      description="แต่ละช่องทางมีค่า 2 อย่างที่ต้องกรอก: Webhook URL = ปลายทางที่ระบบใช้ส่งข้อความออก · Token / Secret = กุญแจยืนยันตัวตนของบัญชีคุณบนแพลตฟอร์มนั้นๆ ส่วน 'Inbound URL' ด้านบนของแต่ละการ์ดคือ URL ที่ต้องนำไปวางในหน้าตั้งค่าของแพลตฟอร์ม เพื่อให้เขาส่งข้อความเข้ามาที่ระบบของเรา"
    >
      <div className="space-y-4">
        {items.map((i) => (
          <ChannelCard key={i.id} item={i} origin={origin} onSave={update} onTest={test} />
        ))}
      </div>
    </PageContainer>
  );
}

function ChannelCard({
  item,
  origin,
  onSave,
  onTest,
}: {
  item: ChatIntegration;
  origin: string;
  onSave: (id: string, patch: Partial<ChatIntegration>) => void;
  onTest: (id: string) => void;
}) {
  const meta = LABEL_BY_CHANNEL[item.channelType] ?? LABEL_BY_CHANNEL.CUSTOM;
  const fullInbound = origin ? `${origin}${item.inboundPath}` : item.inboundPath;

  const [endpoint, setEndpoint] = useState(item.sendEndpoint);
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(item.status === "connected");
  const [open, setOpen] = useState(false);

  useEffect(() => { setEndpoint(item.sendEndpoint); }, [item.sendEndpoint]);
  useEffect(() => { setEnabled(item.status === "connected"); }, [item.status]);

  const save = () => {
    const patch: Partial<ChatIntegration> = {
      sendEndpoint: endpoint,
      status: enabled ? "connected" : "disconnected",
    };
    if (token) (patch as { rawToken: string }).rawToken = token;
    onSave(item.id, patch);
    setToken("");
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    onSave(item.id, { status: next ? "connected" : "disconnected" });
  };

  const copy = () => {
    navigator.clipboard?.writeText(fullInbound);
    toast.success("คัดลอก Inbound URL แล้ว");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      {/* header */}
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

      {/* Inbound URL */}
      <div>
        <label className="text-xs font-medium text-foreground">{meta.inboundLabel}</label>
        <div className="mt-1 flex gap-2">
          <input
            readOnly
            value={fullInbound}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
          />
          <button onClick={copy} className="px-3 rounded-lg border border-border hover:bg-muted" title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">นำ URL นี้ไปวางในช่อง Webhook/Callback URL ของ {item.name}</p>
      </div>

      {/* Send endpoint + Token */}
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
            placeholder={item.maskedToken && item.maskedToken !== "—" ? item.maskedToken : "เช่น EAAG...ZD"}
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{meta.tokenHelp}</p>
        </div>
      </div>

      {/* How to */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        วิธีตั้งค่า {item.name} แบบทีละขั้น
      </button>
      {open && (
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-5">
          {meta.howTo.map((s, idx) => <li key={idx}>{s}</li>)}
        </ol>
      )}

      {/* footer actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => onTest(item.id)}>Test</ActionButton>
        <ActionButton size="sm" variant="primary" onClick={save}>บันทึก</ActionButton>
      </div>
    </div>
  );
}
