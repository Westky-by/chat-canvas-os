import type { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";

export function IntegrationCard({
  name,
  status,
  webhookUrl,
  maskedToken,
  lastSync,
  lastMessage,
  error,
  actions,
  icon,
}: {
  name: string;
  status: "connected" | "disconnected" | "error";
  webhookUrl: string;
  maskedToken: string;
  lastSync?: string;
  lastMessage?: string;
  error?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  const variant = status === "connected" ? "success" : status === "error" ? "danger" : "muted";
  const label = status === "connected" ? "เชื่อมต่อ" : status === "error" ? "ผิดพลาด" : "ยังไม่เชื่อม";
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
          <div>
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">{webhookUrl}</div>
          </div>
        </div>
        <StatusBadge label={label} variant={variant} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Token</div>
          <div className="font-mono text-xs mt-0.5 truncate">{maskedToken}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Sync</div>
          <div className="text-xs mt-0.5">{lastSync ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Last message</div>
          <div className="text-xs mt-0.5">{lastMessage ?? "—"}</div>
        </div>
        {error && (
          <div className="col-span-2 text-destructive text-[11px]">⚠ {error}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">{actions}</div>}
    </div>
  );
}
