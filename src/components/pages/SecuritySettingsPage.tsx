import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RotateCcw, ShieldAlert } from "lucide-react";

const OWNER_EMAIL = "wesaa521@gmail.com";

const Toggle = ({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between gap-3 p-3 bg-background rounded-lg border border-border">
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
    </div>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition ${value ? "bg-primary" : "bg-surface-elevated"} relative flex-shrink-0`}>
      <span className={`absolute top-0.5 ${value ? "left-5" : "left-0.5"} transition-all w-4 h-4 rounded-full bg-background`} />
    </button>
  </div>
);

export function SecuritySettingsPage() {
  const s = useAppStore((st) => st.securitySettings);
  const save = useAppStore((st) => st.saveSecuritySettings);
  const resetAll = useAppStore((st) => st.resetAll);
  const { user } = useAuth();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL;

  function handleReset() {
    if (!isOwner) {
      toast.error("เฉพาะ Owner เท่านั้นที่มีสิทธิ์รีเซ็ตข้อมูล");
      return;
    }
    if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Default)?\nการแก้ไข/เพิ่ม/ลบทั้งหมดในเซสชันนี้จะหายไป")) {
      resetAll();
    }
  }


  return (
    <PageContainer
      title="Security Settings"
      description="กำหนดนโยบายความปลอดภัยของระบบ"
      actions={
        <>
          <ActionButton onClick={() => toast.success("ทดสอบส่ง Login Alert แล้ว")}>ทดสอบ Login Alert</ActionButton>
          <ActionButton variant="primary" onClick={() => toast.success("สร้างรายงานความปลอดภัยแล้ว (mock PDF)")}>สร้างรายงาน</ActionButton>
        </>
      }
    >
      <div className="bg-surface border border-border rounded-xl p-5 space-y-2 max-w-3xl">
        <Toggle label="บังคับใช้ 2FA" hint="ผู้ใช้ทุกคนต้องเปิด 2FA" value={s.require2FA} onChange={(v) => save({ require2FA: v })} />
        <Toggle label="แจ้งเตือนการ login" hint="ส่ง LINE เมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่" value={s.loginAlerts} onChange={(v) => save({ loginAlerts: v })} />
        <Toggle label="อนุมัติก่อน Export ข้อมูล" hint="ป้องกันการดึงข้อมูลออกจากระบบโดยไม่ได้รับอนุญาต" value={s.dataExportApproval} onChange={(v) => save({ dataExportApproval: v })} />
        <Toggle label="ปิดผู้ใช้ที่ไม่ active" hint="ระงับอัตโนมัติเมื่อไม่ login เกิน 90 วัน" value={s.disableInactive} onChange={(v) => save({ disableInactive: v })} />
        <Toggle label="ตรวจสอบ Webhook Signature" hint="ปฏิเสธ webhook ที่ไม่มี signature ที่ถูกต้อง" value={s.webhookSignatureValidation} onChange={(v) => save({ webhookSignatureValidation: v })} />

        <div className="p-3 bg-background rounded-lg border border-border space-y-2">
          <div className="text-sm font-medium">Session Timeout (นาที)</div>
          <input type="number" className="w-32 bg-surface border border-border rounded px-3 py-1.5 text-xs" value={s.sessionTimeoutMin} onChange={(e) => save({ sessionTimeoutMin: +e.target.value })} />
        </div>
        <div className="p-3 bg-background rounded-lg border border-border space-y-2">
          <div className="text-sm font-medium">เตือน Rotate Secret ทุก (วัน)</div>
          <input type="number" className="w-32 bg-surface border border-border rounded px-3 py-1.5 text-xs" value={s.secretRotationDays} onChange={(e) => save({ secretRotationDays: +e.target.value })} />
        </div>
        <div className="p-3 bg-background rounded-lg border border-border space-y-2">
          <div className="text-sm font-medium">IP Allowlist</div>
          <input className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs font-mono" value={s.ipAllowlist.join(", ")} onChange={(e) => save({ ipAllowlist: e.target.value.split(",").map((x) => x.trim()) })} />
        </div>
      </div>
    </PageContainer>
  );
}
