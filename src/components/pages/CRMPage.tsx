import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { Modal } from "@/components/common/Modal";
import { RelativeTime } from "@/components/common/RelativeTime";
import { MessageSquare, StickyNote, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCustomersDB,
  updateCustomer,
  addCustomerNote,
  listCustomerNotes,
  type CustomerRow,
  type CustomerNoteRow,
} from "@/hooks/useCustomersDB";
import { useAuth } from "@/hooks/useAuth";

const TIER_OPTIONS = ["New", "Regular", "VIP"];

export function CRMPage() {
  const { customers, loading, error, refresh } = useCustomersDB();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [noteOpen, setNoteOpen] = useState(false);
  const [active, setActive] = useState<CustomerRow | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<CustomerNoteRow[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  const openChat = (c: CustomerRow) => {
    navigate({ to: "/inbox", search: { customer: c.id } as never });
  };

  const openNote = async (c: CustomerRow) => {
    setActive(c);
    setNoteBody("");
    setNoteOpen(true);
    try {
      setNotes(await listCustomerNotes(c.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "โหลดโน้ตไม่สำเร็จ");
    }
  };

  const saveNote = async () => {
    if (!active || !noteBody.trim()) return;
    setSavingNote(true);
    try {
      await addCustomerNote(active.id, noteBody.trim(), user?.id);
      setNoteBody("");
      setNotes(await listCustomerNotes(active.id));
      toast.success("เพิ่มโน้ตแล้ว");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "บันทึกโน้ตไม่สำเร็จ");
    } finally {
      setSavingNote(false);
    }
  };

  const setTier = async (c: CustomerRow, tier: string) => {
    setSavingRow(c.id);
    try {
      await updateCustomer(c.id, { tier });
      toast.success(`อัปเดต tier เป็น ${tier}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ไม่สามารถอัปเดต tier");
    } finally {
      setSavingRow(null);
    }
  };

  const cols: Column<CustomerRow>[] = [
    { key: "name", header: "ชื่อ", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "channel", header: "Channel", render: (r) => <StatusBadge label={r.channel} variant="info" /> },
    { key: "external_id", header: "External ID", render: (r) => <span className="text-[11px] font-mono text-muted-foreground">{r.external_id ?? "—"}</span> },
    { key: "phone", header: "เบอร์", render: (r) => r.phone ?? "—" },
    {
      key: "tier",
      header: "Tier",
      render: (r) => (
        <select
          value={r.tier}
          onChange={(e) => setTier(r, e.target.value)}
          disabled={savingRow === r.id}
          className="bg-surface border border-border rounded px-2 py-0.5 text-[11px]"
        >
          {TIER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.tags.map((t) => (
            <span key={t} className="text-[10px] bg-surface-elevated border border-border px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      ),
    },
    { key: "last_activity", header: "Last Activity", render: (r) => <RelativeTime iso={r.last_activity} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" variant="primary" icon={<MessageSquare className="w-3 h-3" />} onClick={() => openChat(r)}>เปิดแชท</ActionButton>
          <ActionButton size="sm" variant="secondary" icon={<StickyNote className="w-3 h-3" />} onClick={() => openNote(r)}>โน้ต</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="CRM • ฐานข้อมูลลูกค้า"
      description="ลูกค้าจริงจากทุกช่องทาง — auto-create เมื่อมีข้อความเข้ามาทาง LINE/Telegram/Meta"
    >
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
          <Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลดลูกค้าจากฐานข้อมูล…
        </div>
      )}
      {error && (
        <div className="text-xs text-danger p-4">โหลดข้อมูลไม่สำเร็จ: {error}</div>
      )}
      {!loading && customers.length === 0 && (
        <div className="text-xs text-muted-foreground p-8 text-center bg-surface rounded-xl border border-border">
          ยังไม่มีลูกค้า — เมื่อมีข้อความเข้ามาทาง LINE/Telegram/Meta ระบบจะสร้างลูกค้าให้อัตโนมัติ
        </div>
      )}
      {customers.length > 0 && <DataTable columns={cols} data={customers} />}

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={active ? `โน้ตของ ${active.name}` : "โน้ต"}
        footer={
          <>
            <ActionButton onClick={() => setNoteOpen(false)}>ปิด</ActionButton>
            <ActionButton variant="primary" icon={<Save className="w-3 h-3" />} onClick={saveNote} disabled={savingNote || !noteBody.trim()}>
              {savingNote ? "กำลังบันทึก…" : "เพิ่มโน้ต"}
            </ActionButton>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            autoFocus
            rows={4}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="พิมพ์โน้ตใหม่ เช่น ความชอบ ข้อจำกัด ประวัติการคุย..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"
          />
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {notes.length === 0 && <div className="text-[11px] text-muted-foreground">ยังไม่มีโน้ต</div>}
            {notes.map((n) => (
              <div key={n.id} className="bg-background border border-border rounded-lg p-2.5 text-xs">
                <div className="whitespace-pre-wrap">{n.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  <RelativeTime iso={n.created_at} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
