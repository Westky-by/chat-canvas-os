import type { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";

export function ProviderCard({
  name,
  status,
  model,
  maskedKey,
  role,
  lastTested,
  costLimit,
  actions,
  icon,
}: {
  name: string;
  status: "active" | "disabled";
  model: string;
  maskedKey: string;
  role: "primary" | "fallback" | "manual";
  lastTested?: ReactNode;
  costLimit: number;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
          <div>
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-[11px] text-muted-foreground">{model}</div>
          </div>
        </div>
        <StatusBadge label={status === "active" ? "ใช้งานอยู่" : "ปิด"} variant={status === "active" ? "success" : "muted"} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <Field label="Masked Key" value={maskedKey} />
        <Field label="บทบาท" value={role} />
        <Field label="ทดสอบล่าสุด" value={lastTested ?? "—"} />
        <Field label="วงเงิน" value={`${costLimit.toLocaleString()} ฿/เดือน`} />
      </div>
      {actions && <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">{actions}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-mono text-xs mt-0.5 truncate">{value}</div>
    </div>
  );
}
