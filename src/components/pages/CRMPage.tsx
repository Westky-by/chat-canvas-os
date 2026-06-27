import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { Modal } from "@/components/common/Modal";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { MessageSquare, StickyNote, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/types";

export function CRMPage() {
  const customers = useAppStore((s) => s.customers);
  const conversations = useAppStore((s) => s.conversations);
  const updateNote = useAppStore((s) => s.updateCustomerNote);
  const navigate = useNavigate();

  const [noteOpen, setNoteOpen] = useState(false);
  const [active, setActive] = useState<Customer | null>(null);
  const [noteText, setNoteText] = useState("");

  const openChat = (c: Customer) => {
    const conv = conversations.find((v) => v.customerId === c.id);
    if (!conv) {
      toast.error(`ยังไม่มีบทสนทนาของ ${c.name} ใน Inbox`);
      return;
    }
    navigate({ to: "/inbox", search: { customer: c.id } as never });
  };

  const openNote = (c: Customer) => {
    setActive(c);
    setNoteText(c.note ?? "");
    setNoteOpen(true);
  };
  const saveNote = () => {
    if (!active) return;
    updateNote(active.id, noteText.trim());
    setNoteOpen(false);
  };

  const cols: Column<Customer>[] = [
    { key: "id", header: "Customer ID" },
    { key: "name", header: "ชื่อ", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "channel", header: "Channel", render: (r) => <StatusBadge label={r.channel} variant="info" /> },
    { key: "phone", header: "เบอร์" },
    { key: "tier", header: "Tier", render: (r) => <StatusBadge label={r.tier} variant={r.tier === "VIP" ? "primary" : "muted"} /> },
    { key: "tags", header: "Tags", render: (r) => <div className="flex gap-1 flex-wrap">{r.tags.map((t) => <span key={t} className="text-[10px] bg-surface-elevated border border-border px-1.5 py-0.5 rounded">{t}</span>)}</div> },
    { key: "note", header: "โน้ต", render: (r) => <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[180px] block">{r.note || "—"}</span> },
    { key: "lastActivity", header: "Last Activity", render: (r) => <RelativeTime iso={r.lastActivity} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" variant="primary" icon={<MessageSquare className="w-3 h-3" />} onClick={() => openChat(r)}>เปิดแชท</ActionButton>
          <ActionButton size="sm" variant="secondary" icon={<StickyNote className="w-3 h-3" />} onClick={() => openNote(r)}>โน้ต</ActionButton>
          <ActionButton size="sm" variant="ghost" icon={<Heart className="w-3 h-3" />} onClick={() => toast.info(`ดู preferences ของ ${r.name}`)}>Preferences</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="CRM • ฐานข้อมูลลูกค้า" description="รวมลูกค้าจากทุกช่องทาง พร้อม tier, tags และ activity ล่าสุด">
      <DataTable columns={cols} data={customers} />

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={active ? `โน้ตของ ${active.name}` : "โน้ต"}
        footer={
          <>
            <ActionButton onClick={() => setNoteOpen(false)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={saveNote}>บันทึก</ActionButton>
          </>
        }
      >
        <div className="space-y-3">
          {active?.note && (
            <div className="bg-background border border-border rounded-xl p-3 text-xs text-muted-foreground whitespace-pre-wrap">
              <div className="text-[10px] uppercase tracking-wider mb-1">โน้ตปัจจุบัน</div>
              {active.note}
            </div>
          )}
          <textarea
            autoFocus
            rows={6}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="พิมพ์โน้ตลูกค้า เช่น ความชอบ ข้อจำกัด ประวัติการคุย..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"
          />
          <div className="text-[10px] text-muted-foreground">โน้ตจะแสดงในตาราง CRM และอ้างอิงในการให้บริการครั้งต่อไป</div>
        </div>
      </Modal>
    </PageContainer>
  );
}
