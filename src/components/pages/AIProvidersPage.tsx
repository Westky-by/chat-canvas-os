import { PageContainer } from "@/components/layout/PageContainer";
import { ProviderCard } from "@/components/common/ProviderCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import { Sparkles, Key, ShieldAlert, Zap } from "lucide-react";

export function AIProvidersPage() {
  const providers = useAppStore((s) => s.aiProviders);
  const test = useAppStore((s) => s.testAIProvider);
  const rotate = useAppStore((s) => s.rotateAIKey);
  const toggle = useAppStore((s) => s.toggleAIProvider);
  const setPrimary = useAppStore((s) => s.setPrimaryAI);

  return (
    <PageContainer title="AI API Providers" description="จัดการ Provider AI (Gemini, OpenAI, Claude ฯลฯ) และเลือก primary/fallback">
      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> Secrets จะถูกเก็บที่ฝั่ง server เท่านั้น เมื่อบันทึกแล้วจะไม่สามารถดูค่าจริงได้อีก
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => (
          <ProviderCard
            key={p.id}
            name={p.name}
            status={p.status}
            model={p.model}
            maskedKey={p.maskedKey}
            role={p.role}
            lastTested={p.lastTested ? fmtRelative(p.lastTested) : undefined}
            costLimit={p.costLimit}
            icon={<Sparkles className="w-4 h-4" />}
            actions={
              <>
                <ActionButton size="sm" variant="primary" icon={<Zap className="w-3 h-3" />} onClick={() => test(p.id)}>ทดสอบ</ActionButton>
                <ActionButton size="sm" icon={<Key className="w-3 h-3" />} onClick={() => rotate(p.id)}>Rotate Key</ActionButton>
                <ActionButton size="sm" variant="ghost" onClick={() => setPrimary(p.id)}>ตั้งเป็น Primary</ActionButton>
                <ActionButton size="sm" variant={p.status === "active" ? "danger" : "outline"} onClick={() => toggle(p.id)}>{p.status === "active" ? "ปิด" : "เปิด"}</ActionButton>
              </>
            }
          />
        ))}
      </div>
    </PageContainer>
  );
}
