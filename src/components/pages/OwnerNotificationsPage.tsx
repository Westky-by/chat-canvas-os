import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Bell, Zap, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

export function OwnerNotificationsPage() {
  const rules = useAppStore((s) => s.notificationRules);
  const toggle = useAppStore((s) => s.toggleRule);
  const test = useAppStore((s) => s.testOwnerNotification);

  return (
    <PageContainer
      title="Owner Notifications"
      description="กฎการแจ้งเตือนเจ้าของผ่าน LINE/Telegram/Email"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => toast.info("เพิ่มกฎใหม่ (mock)")}>เพิ่มกฎ</ActionButton>}
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
            <ActionButton size="sm" variant="ghost" icon={<Pencil className="w-3 h-3" />} onClick={() => toast.info("แก้ไข template (mock)")}>แก้ไข</ActionButton>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
