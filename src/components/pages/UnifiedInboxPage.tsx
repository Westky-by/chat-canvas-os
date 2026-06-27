import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppStore } from "@/store/useAppStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { fmtRelative } from "@/utils/formatters";
import { Send, Bot, User, Image as ImgIcon, Sparkles, Heart, Link2 } from "lucide-react";

export function UnifiedInboxPage() {
  const conversations = useAppStore((s) => s.conversations);
  const messages = useAppStore((s) => s.messages);
  const customers = useAppStore((s) => s.customers);
  const catalog = useAppStore((s) => s.catalog);
  const prefs = useAppStore((s) => s.customerPreferences);
  const inquiries = useAppStore((s) => s.inquiries);
  const addMessage = useAppStore((s) => s.addMessage);

  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [text, setText] = useState("");
  const activeConv = conversations.find((c) => c.id === activeId);
  const activeCust = customers.find((c) => c.id === activeConv?.customerId);
  const thread = messages.filter((m) => m.conversationId === activeId);
  const pref = prefs.find((p) => p.customerId === activeConv?.customerId);
  const linkedInq = inquiries.find((i) => i.customerId === activeConv?.customerId);

  const send = () => {
    if (!text.trim() || !activeId) return;
    addMessage(activeId, text);
    setText("");
  };

  return (
    <div className="h-full grid grid-cols-[280px_1fr_320px] divide-x divide-border">
      {/* List */}
      <aside className="overflow-y-auto bg-surface">
        <div className="p-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations ({conversations.length})
        </div>
        {conversations.map((c) => {
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
                <span>{fmtRelative(c.updatedAt)}</span>
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
          <StatusBadge
            label={activeConv?.mode === "ai" ? "AI กำลังตอบ" : "Admin ครอบครอง"}
            variant={activeConv?.mode === "ai" ? "primary" : "warning"}
            icon={activeConv?.mode === "ai" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
          />
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
                  <div className="text-[10px] text-muted-foreground">{fmtRelative(m.at)} • {m.sender}</div>
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
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="พิมพ์ตอบกลับ..."
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
          />
          <ActionButton variant="primary" icon={<Send className="w-3.5 h-3.5" />} onClick={send}>ส่ง</ActionButton>
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

        {pref && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1"><Heart className="w-3 h-3" /> Preference ที่ AI จับได้</div>
            <div className="bg-background border border-border rounded-xl p-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">สนใจ</span><span>{pref.interestedItem} ({pref.interestedZone})</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">วันที่</span><span>{pref.preferredDateTime}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">งบ</span><span>{pref.budget.toLocaleString()} ฿</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Urgency</span><StatusBadge label={pref.urgency} variant={pref.urgency === "high" ? "danger" : "warning"} /></div>
            </div>
          </div>
        )}

        {linkedInq && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Inquiry ที่เชื่อมโยง</div>
            <div className="bg-background border border-border rounded-xl p-3 text-xs">
              <div className="font-medium">{linkedInq.id}</div>
              <div className="text-muted-foreground mt-0.5">{linkedInq.interestedItem} / {linkedInq.interestedZone}</div>
              <div className="mt-2"><StatusBadge label={linkedInq.status} variant="primary" /></div>
            </div>
          </div>
        )}

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
