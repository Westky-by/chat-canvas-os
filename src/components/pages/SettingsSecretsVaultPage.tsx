import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Key, ShieldAlert, Zap, RotateCw } from "lucide-react";
import { toast } from "sonner";

export function SettingsSecretsVaultPage() {
  const providers = useAppStore((s) => s.aiProviders);
  const integrations = useAppStore((s) => s.chatIntegrations);
  const rotate = useAppStore((s) => s.rotateAIKey);
  const test = useAppStore((s) => s.testAIProvider);

  return (
    <PageContainer title="Settings & Secrets Vault" description="จัดการ secret/API key — แสดงเฉพาะแบบ mask เท่านั้น">
      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> ระบบจะไม่แสดง secret ดิบกับใครเลย เมื่อบันทึกแล้วจะดูได้แค่ค่ามาสก์เท่านั้น
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">AI Provider Secrets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Key className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{p.maskedKey}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">ทดสอบล่าสุด: {p.lastTested ? <RelativeTime iso={p.lastTested} /> : "—"}</div>
              </div>
              <StatusBadge label={p.status} variant={p.status === "active" ? "success" : "muted"} />
              <ActionButton size="sm" icon={<RotateCw className="w-3 h-3" />} onClick={() => rotate(p.id)}>Rotate</ActionButton>
              <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => test(p.id)}>Test</ActionButton>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Channel Secrets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((i) => (
            <div key={i.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center"><Key className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{i.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{i.maskedToken}</div>
              </div>
              <StatusBadge label={i.status} variant={i.status === "connected" ? "success" : "muted"} />
              <ActionButton size="sm" onClick={() => toast.success("Rotate channel token (mock)")}>Rotate</ActionButton>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
