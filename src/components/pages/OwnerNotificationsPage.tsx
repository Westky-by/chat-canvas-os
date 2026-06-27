import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Bell, Zap, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { NotificationRule } from "@/types";

type FormState = {
  id?: string;
  trigger: string;
  channel: NotificationRule["channel"];
  template: string;
  enabled: boolean;
  priority: NotificationRule["priority"];
};

const empty = (): FormState => ({
  trigger: "", channel: "LINE", template: "", enabled: true, priority: "medium",
});

export function OwnerNotificationsPage() {
  const rules = useAppStore((s) => s.notificationRules);
  const toggle = useAppStore((s) => s.toggleRule);
  const test = useAppStore((s) => s.testOwnerNotification);
  const update = useAppStore((s) => s.updateNotificationRule);
  const add = useAppStore((s) => s.addNotificationRule);
  const remove = useAppStore((s) => s.deleteNotificationRule);

  const [form, setForm] = useState<FormState | null>(null);

  const openEdit = (r: NotificationRule) =>
    setForm({ id: r.id, trigger: r.trigger, channel: r.channel, template: r.template, enabled: r.enabled, priority: r.priority });

  const submit = () => {
    if (!form) return;
    if (!form.trigger.trim()) return toast.error("กรอก trigger");
    if (!form.template.trim()) return toast.error("กรอก template");
    if (form.id) update(form.id, form);
    else add(form);
    setForm(null);
  };

  return (
    <PageContainer
      title="Owner Notifications"
      description="กฎการแจ้งเตือนเจ้าของผ่าน LINE/Telegram/Email"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => setForm(empty())}>เพิ่มกฎ</ActionButton>}
    >
      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Bell className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm">{r.trigger}</div>
                <StatusBadge label={r.priority} variant={r.priority === "high" ? "danger" : r.priority === "medium" ? "warning" : "muted"} />
                <StatusBadge label={r.channel} variant="info" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{r.template}</div>
              <div className="text-[10px] text-muted-foreground mt-1">ส่งล่าสุด: {r.lastSent ? <RelativeTime iso={r.lastSent} /> : "—"}</div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={r.enabled} onChange={() => toggle(r.id)} />
              <span className="text-[11px]">เปิดใช้</span>
            </label>
            <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => test(r.id)}>ทดสอบ</ActionButton>
            <ActionButton size="sm" variant="ghost" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(r)}>แก้ไข</ActionButton>
            <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm("ลบกฎนี้?")) remove(r.id); }}>ลบ</ActionButton>
          </div>
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "แก้ไขกฎแจ้งเตือน" : "เพิ่มกฎใหม่"}
        footer={
          <>
            <ActionButton onClick={() => setForm(null)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={submit}>บันทึก</ActionButton>
          </>
        }
      >
        {form && (
          <div className="space-y-3 text-xs">
            <Field label="Trigger event">
              <input className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono"
                value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                placeholder="เช่น payment_slip_upload" />
            </Field>
            <Field label="Template ข้อความ">
              <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2 min-h-[80px]"
                value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}
                placeholder="เช่น 🔔 ลูกค้า {customer} ส่งสลิป {amount} บาท" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ช่องทาง">
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                  value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as NotificationRule["channel"] })}>
                  <option value="LINE">LINE</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Email">Email</option>
                </select>
              </Field>
              <Field label="ความสำคัญ">
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                  value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as NotificationRule["priority"] })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
              <span>เปิดใช้กฎนี้</span>
            </label>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
