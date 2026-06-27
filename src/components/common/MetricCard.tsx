import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-2">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        {icon && <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-3 text-[11px] font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
          {trend.positive ? "▲" : "▼"} {trend.value}
        </div>
      )}
    </div>
  );
}
