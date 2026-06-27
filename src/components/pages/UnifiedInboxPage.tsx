import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Send, Bot, User, Image as ImgIcon, Sparkles, Heart, Link2, Filter, X, Loader2 } from "lucide-react";
import { aiReply } from "@/lib/aiReply.functions";
import { sendInboxMessage, syncLineProfiles } from "@/lib/inbox.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Channel, Conversation, Customer, Message } from "@/types";

const ALL_CHANNELS: Channel[] = ["LINE", "Telegram", "Facebook", "Instagram", "WhatsApp", "Website", "Webhook"];

type InboxRow = {
  id: string;
  channel: string;
  external_user_id: string;
  user_name: string | null;
  text: string;
  received_at: string;
  created_at?: string;
  sender?: string;
  delivery_status?: string;
};

const toChannel = (raw: string): Channel => {
  const channel = raw.toUpperCase();
  if (channel.includes("LINE")) return "LINE";
  if (channel.includes("TELEGRAM")) return "Telegram";
  if (channel.includes("WHATSAPP")) return "WhatsApp";
  if (channel.includes("INSTAGRAM")) return "Instagram";
  if (channel.includes("MESSENGER") || channel.includes("FACEBOOK")) return "Facebook";
  if (channel.includes("WEB")) return "Website";
  return "Webhook";
};

const shortExternalId = (id: string) => (id.length > 10 ? `…${id.slice(-8)}` : id);

export function UnifiedInboxPage() {
  const catalog = useAppStore((s) => s.catalog);

  const [liveRows, setLiveRows] = useState<InboxRow[]>([]);
  const [liveModes, setLiveModes] = useState<Record<string, Conversation["mode"]>>({});
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [text, setText] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadInbox = async () => {
      const { data, error } = await supabase
        .from("inbox_messages")
      .select("id, channel, external_user_id, user_name, text, received_at, created_at, sender, delivery_status")
        .order("received_at", { ascending: false })
        .limit(300);

      if (!mounted) return;
      if (error) {
        setLiveError(error.message);
        setLiveLoading(false);
        return;
      }
      setLiveRows((data ?? []) as InboxRow[]);
      setLiveError("");
      setLiveLoading(false);
    };

    loadInbox();
    syncLineProfiles()
      .then((res) => {
        if (res.updated > 0) void loadInbox();
      })
      .catch(() => undefined);
    const poll = window.setInterval(loadInbox, 8000);
    const channel = supabase
      .channel("inbox_messages_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inbox_messages" },
        (payload) => {
          const row = payload.new as InboxRow;
          setLiveRows((rows) => [row, ...rows.filter((r) => r.id !== row.id)].slice(0, 300));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, []);

  const liveInbox = useMemo(() => {
    const grouped = new Map<string, { customer: Customer; conversation: Conversation; messages: Message[] }>();
    const rows = [...liveRows].sort(
      (a, b) => new Date(a.received_at || a.created_at || 0).getTime() - new Date(b.received_at || b.created_at || 0).getTime(),
    );

    for (const row of rows) {
      const channel = toChannel(row.channel);
      const at = row.received_at || row.created_at || new Date().toISOString();
      const key = `live:${channel}:${row.external_user_id}`;
      const customerId = `customer:${key}`;
      const conversationId = `conversation:${key}`;
      const displayName = row.user_name?.trim() || `${channel} ${shortExternalId(row.external_user_id)}`;
      const existing = grouped.get(key);
      const sender = row.sender === "ai" || row.sender === "admin" || row.sender === "system" ? row.sender : "customer";

      if (!existing) {
        grouped.set(key, {
          customer: {
            id: customerId,
            name: displayName,
            channel,
            phone: row.external_user_id,
            tier: "New",
            tags: [channel === "LINE" ? "LINE OA" : channel, "Live Inbox"],
            lastActivity: at,
          },
          conversation: {
            id: conversationId,
            customerId,
            channel,
            lastMessage: row.text,
            unread: 0,
            mode: liveModes[conversationId] ?? "ai",
            updatedAt: at,
          },
          messages: [],
        });
      }

      const bucket = grouped.get(key)!;
      const currentName = bucket.customer.name;
      if (row.user_name?.trim() && currentName.includes("…")) bucket.customer.name = row.user_name.trim();
      bucket.customer.lastActivity = at;
      bucket.conversation.lastMessage = row.text;
      bucket.conversation.updatedAt = at;
      if (sender === "customer") bucket.conversation.unread += 1;
      bucket.messages.push({
        id: `live-message:${row.id}`,
        conversationId,
        sender: sender === "system" ? "admin" : sender,
        text: row.text || "(ไม่มีข้อความ)",
        at,
      });
    }

    const buckets = [...grouped.values()].sort(
      (a, b) => new Date(b.conversation.updatedAt).getTime() - new Date(a.conversation.updatedAt).getTime(),
    );

    return {
      customers: buckets.map((b) => b.customer),
      conversations: buckets.map((b) => b.conversation),
      messages: buckets.flatMap((b) => b.messages),
    };
  }, [liveRows, liveModes]);

  const customers = liveInbox.customers;
  const conversations = liveInbox.conversations;
  const messages = liveInbox.messages;

  // Auto-select conversation from ?customer=ID (e.g. navigated from CRM)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("customer");
    if (!cid) return;
    const conv = conversations.find((c) => c.customerId === cid);
    if (conv) setActiveId(conv.id);
  }, [conversations]);

  useEffect(() => {
    if (activeId && conversations.some((c) => c.id === activeId)) return;
    setActiveId(conversations[0]?.id ?? "");
  }, [activeId, conversations]);


  const filteredConvs = useMemo(
    () => (selectedChannels.length === 0 ? conversations : conversations.filter((c) => selectedChannels.includes(c.channel))),
    [conversations, selectedChannels],
  );

  const toggleChannel = (ch: string) =>
    setSelectedChannels((s) => (s.includes(ch) ? s.filter((x) => x !== ch) : [...s, ch]));
  const activeConv = conversations.find((c) => c.id === activeId);
  const activeCust = customers.find((c) => c.id === activeConv?.customerId);
  const thread = messages.filter((m) => m.conversationId === activeId);
  const toggleActiveMode = () => {
    if (!activeConv) return;
    const next = activeConv.mode === "ai" ? "admin" : "ai";
    setLiveModes((modes) => ({ ...modes, [activeConv.id]: next }));
    toast.success(next === "ai" ? "เปิด AI ตอบอัตโนมัติแล้ว" : "ปิด AI — Admin ครอบครอง");
  };

  const send = async () => {
    if (!text.trim() || !activeId || !activeConv || !activeCust) return;
    const messageText = text;
    setText("");
    try {
      await sendInboxMessage({
        data: {
          channel: activeConv.channel,
          externalUserId: activeCust.phone ?? "",
          userName: activeCust.name,
          text: messageText,
          sender: "admin",
        },
      });
      toast.success("ส่งข้อความแล้ว");
    } catch (e) {
      setText(messageText);
      toast.error(e instanceof Error ? e.message : "ส่งข้อความไม่สำเร็จ");
    }
  };

  const aiProviders = useAppStore((s) => s.aiProviders);
  const [aiLoading, setAiLoading] = useState(false);

  const generateAIReply = async () => {
    if (!activeId || thread.length === 0) return;
    const primary = aiProviders.find((p) => p.role === "primary" && p.status === "active") ?? aiProviders[0];
    if (!primary) return toast.error("ยังไม่มี AI Provider — ตั้งค่าใน Integrations → AI API Providers");
    setAiLoading(true);
    try {
      const history = thread.slice(-12).map((m) => ({
        role: (m.sender === "customer" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));
      const res = await aiReply({
        data: {
          provider: primary.providerLabel,
          model: primary.model,
          systemPrompt: primary.systemPrompt,
          userApiKey: primary.rawKey,
          messages: history,
        },
      });
      const answer = res.text || "(ไม่มีคำตอบ)";
      if (activeConv && activeCust?.phone) {
        await sendInboxMessage({
          data: {
            channel: activeConv.channel,
            externalUserId: activeCust.phone,
            userName: activeCust.name,
            text: answer,
            sender: "ai",
          },
        });
      }
      toast.success(`ตอบโดย ${res.provider}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "เรียก AI ไม่สำเร็จ");
    } finally {
      setAiLoading(false);
    }
  };


  return (
    <div className="h-full grid grid-cols-[280px_1fr_320px] divide-x divide-border">
      {/* List */}
      <aside className="overflow-y-auto bg-surface">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversations ({filteredConvs.length}/{conversations.length})
            </div>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border transition ${
                selectedChannels.length > 0 ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-surface-hover"
              }`}
            >
              <Filter className="w-3 h-3" />
              ช่องทาง{selectedChannels.length > 0 ? ` (${selectedChannels.length})` : ""}
            </button>
          </div>
          {filterOpen && (
            <div className="flex flex-wrap gap-1">
              {ALL_CHANNELS.map((ch) => {
                const on = selectedChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                      on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
              {selectedChannels.length > 0 && (
                <button
                  onClick={() => setSelectedChannels([])}
                  className="text-[10px] px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                >
                  <X className="w-2.5 h-2.5" /> ล้าง
                </button>
              )}
            </div>
          )}
        </div>
        {filteredConvs.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {liveLoading ? "กำลังดึงข้อความจาก LINE OA..." : "ไม่มีบทสนทนาในช่องทางที่เลือก"}
            {liveError && <div className="mt-2 text-danger">โหลดข้อความ webhook ไม่สำเร็จ: {liveError}</div>}
          </div>
        )}
        {filteredConvs.map((c) => {
          const cust = customers.find((cu) => cu.id === c.customerId);
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left p-3 border-b border-border hover:bg-surface-hover transition ${activeId === c.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-xs truncate">{cust?.name}</div>
                <StatusBadge label={c.channel} variant="info" />
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">{c.lastMessage}</div>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>{<RelativeTime iso={c.updatedAt} />}</span>
                {c.mode === "ai" ? <span className="flex items-center gap-1 text-primary"><Bot className="w-3 h-3" />AI</span> : <span className="flex items-center gap-1 text-warning"><User className="w-3 h-3" />Admin</span>}
              </div>
            </button>
          );
        })}
      </aside>


      {/* Thread */}
      <section className="flex flex-col bg-background">
        <div className="h-14 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-semibold">{activeCust?.name}</div>
            <div className="text-[11px] text-muted-foreground">{activeConv?.channel} • {activeCust?.phone}</div>
          </div>
          {activeConv && (
            <button
              type="button"
              role="switch"
              aria-checked={activeConv.mode === "ai"}
              onClick={toggleActiveMode}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                activeConv.mode === "ai"
                  ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                  : "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
              }`}
              title={activeConv.mode === "ai" ? "คลิกเพื่อปิด AI (Admin ครอบครอง)" : "คลิกเพื่อเปิดให้ AI ตอบอัตโนมัติ"}
            >
              {activeConv.mode === "ai" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span>{activeConv.mode === "ai" ? "AI: เปิด" : "AI: ปิด"}</span>
              <span
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
                  activeConv.mode === "ai" ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                    activeConv.mode === "ai" ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {thread.map((m) => {
            const me = m.sender !== "customer";
            return (
              <div key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] space-y-2`}>
                  <div className={`px-3 py-2 rounded-2xl text-xs ${me ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-surface border border-border rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                  {m.attachments?.map((a, i) =>
                    a.type === "catalog" ? (
                      <CatalogCardMini key={i} item={catalog.find((c) => c.id === a.catalogId)} />
                    ) : null
                  )}
                  <div className="text-[10px] text-muted-foreground">{<RelativeTime iso={m.at} />} • {m.sender}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-3 flex gap-2 items-end flex-shrink-0">
          <button className="p-2 rounded-lg hover:bg-surface-hover text-muted-foreground"><ImgIcon className="w-4 h-4" /></button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
            placeholder="พิมพ์ตอบกลับ..."
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
          />
          <ActionButton
            icon={aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            onClick={generateAIReply}
            disabled={aiLoading}
          >
            {aiLoading ? "AI..." : "ให้ AI ตอบ"}
          </ActionButton>
          <ActionButton variant="primary" icon={<Send className="w-3.5 h-3.5" />} onClick={() => void send()}>ส่ง</ActionButton>
        </div>
      </section>

      {/* Insights */}
      <aside className="overflow-y-auto bg-surface p-4 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">ข้อมูลลูกค้า</div>
          <div className="bg-background border border-border rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">ชื่อ</span><span>{activeCust?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><StatusBadge label={activeCust?.tier ?? ""} variant="primary" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">เบอร์</span><span>{activeCust?.phone}</span></div>
            <div className="flex flex-wrap gap-1 pt-1">{activeCust?.tags.map((t) => <span key={t} className="text-[10px] bg-surface-elevated px-2 py-0.5 rounded">{t}</span>)}</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1"><Heart className="w-3 h-3" /> Live Thread</div>
          <div className="bg-background border border-border rounded-xl p-3 space-y-1 text-xs text-muted-foreground">
            อ่านจากตาราง inbox_messages แบบ realtime เท่านั้น ไม่มี local mock ในหน้านี้
          </div>
        </div>

        <ActionButton variant="outline" icon={<Link2 className="w-3 h-3" />} className="w-full justify-center">ดู Inquiry เต็มหน้าจอ</ActionButton>
      </aside>
    </div>
  );
}

function CatalogCardMini({ item }: { item?: { title: string; price: number; image: string; cfKeyword: string } }) {
  if (!item) return null;
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden w-56">
      <img src={item.image} alt={item.title} className="w-full h-28 object-cover" />
      <div className="p-2 text-[11px]">
        <div className="font-semibold">{item.title}</div>
        <div className="text-muted-foreground">CF: {item.cfKeyword}</div>
        <div className="text-primary font-semibold mt-0.5">{item.price.toLocaleString()} ฿</div>
      </div>
    </div>
  );
}
