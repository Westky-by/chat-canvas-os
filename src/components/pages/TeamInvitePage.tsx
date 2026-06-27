import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

interface Invite { id: string; email: string; role: string; channel: string; team: string; status: "pending" | "accepted" | "revoked" }

export function TeamInvitePage() {
  const [invites, setInvites] = useState<Invite[]>([
    { id: "IV1", email: "newadmin@shop.local", role: "Admin", channel: "LINE", team: "Support", status: "pending" },
    { id: "IV2", email: "finance2@shop.local", role: "Finance", channel: "ทั้งหมด", team: "Finance", status: "accepted" },
  ]);
  const [form, setForm] = useState({ email: "", role: "Agent", channel: "LINE", team: "Support" });

  const send = () => {
    if (!form.email) return toast.error("กรอกอีเมล");
    setInvites([{ id: `IV${Date.now()}`, ...form, status: "pending" }, ...invites]);
    setForm({ email: "", role: "Agent", channel: "LINE", team: "Support" });
    toast.success("ส่งคำเชิญแล้ว (mock email)");
  };
  const revoke = (id: string) => {
    setInvites(invites.map((i) => (i.id === id ? { ...i, status: "revoked" } : i)));
    toast.warning("เพิกถอนคำเชิญแล้ว");
  };

  const cols: Column<Invite>[] = [
    { key: "email", header: "อีเมล" },
    { key: "role", header: "บทบาท", render: (r) => <StatusBadge label={r.role} variant="info" /> },
    { key: "channel", header: "Channel" },
    { key: "team", header: "ทีม" },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "accepted" ? "success" : r.status === "revoked" ? "danger" : "warning"} /> },
    { key: "actions", header: "Actions", render: (r) => r.status === "pending" && <ActionButton size="sm" variant="danger" icon={<X className="w-3 h-3" />} onClick={() => revoke(r.id)}>เพิกถอน</ActionButton> },
  ];

  const input = "bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary";

  return (
    <PageContainer title="เชิญสมาชิกทีม (Invite Team Member)" description="ส่งคำเชิญเข้าร่วมเวิร์กสเปซพร้อมกำหนดสิทธิ์และทีม">
      <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div><div className="text-[11px] text-muted-foreground mb-1">อีเมล</div><input className={input + " w-full"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></div>
        <div><div className="text-[11px] text-muted-foreground mb-1">บทบาท</div>
          <select className={input + " w-full"} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {["Owner","Admin","Manager","Agent","Viewer","Finance","Developer"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div><div className="text-[11px] text-muted-foreground mb-1">ช่องทาง</div>
          <select className={input + " w-full"} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            {["ทั้งหมด","LINE","Facebook","Instagram","WhatsApp","Telegram"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><div className="text-[11px] text-muted-foreground mb-1">ทีม</div>
          <select className={input + " w-full"} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
            {["Support","Sales","Finance","Operations"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <ActionButton variant="primary" icon={<Send className="w-3 h-3" />} onClick={send}>ส่งคำเชิญ</ActionButton>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">คำเชิญทั้งหมด</h3>
        <DataTable columns={cols} data={invites} />
      </div>
    </PageContainer>
  );
}
