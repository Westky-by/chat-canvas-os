import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Pause, Copy, Eye, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function CampaignAutomationPage() {
  const campaigns = useAppStore((s) => s.campaigns);
  const pause = useAppStore((s) => s.pauseCampaign);
  const reqApproval = useAppStore((s) => s.requestCampaignApproval);
  const create = useAppStore((s) => s.createCampaign);

  return (
    <PageContainer
      title="Campaign Automation"
      description="แคมเปญต้อนรับ, Follow-up, Broadcast, คูปอง, เตือนนัด ฯลฯ"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => create({ name: "New Broadcast", type: "broadcast" })}>สร้างแคมเปญ</ActionButton>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm">{c.name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{c.type} • {c.segment}</div>
              </div>
              <StatusBadge label={c.status} variant={c.status === "active" ? "success" : c.status === "paused" ? "warning" : "muted"} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="Channel" value={c.channel} />
              <Stat label="Approval" value={c.approval} />
              <Stat label="ส่งแล้ว" value={`${c.sent}`} />
              <Stat label="แปลง" value={`${c.conversion}`} />
            </div>
            {c.type === "broadcast" && c.approval !== "approved" && (
              <div className="text-[11px] bg-warning/10 border border-warning/30 text-warning rounded-lg p-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> ต้องได้รับอนุมัติจากเจ้าของ
              </div>
            )}
            <div className="flex gap-1 flex-wrap pt-2 border-t border-border">
              <ActionButton size="sm" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => toast.info("พรีวิว flow")}>พรีวิว</ActionButton>
              <ActionButton size="sm" icon={<Pause className="w-3 h-3" />} onClick={() => pause(c.id)}>หยุด</ActionButton>
              <ActionButton size="sm" onClick={() => reqApproval(c.id)}>ขออนุมัติ</ActionButton>
              <ActionButton size="sm" variant="ghost" icon={<Copy className="w-3 h-3" />} onClick={() => create({ name: c.name + " (copy)", type: c.type })}>ทำซ้ำ</ActionButton>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-background rounded-lg px-2 py-1.5">
    <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</div>
    <div className="text-xs font-medium mt-0.5">{value}</div>
  </div>
);
