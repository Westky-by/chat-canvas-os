import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { MetricCard } from "@/components/common/MetricCard";
import { useAppStore } from "@/store/useAppStore";
import { fmtDateTime } from "@/utils/formatters";
import { Download, BarChart3 } from "lucide-react";
import type { UsageLog } from "@/types";

export function UsageLogsPage() {
  const logs = useAppStore((s) => s.usageLogs);
  const exportLogs = useAppStore((s) => s.exportUsageLogs);

  const totalTokens = logs.reduce((a, b) => a + b.tokens, 0);
  const totalCost = logs.reduce((a, b) => a + b.cost, 0);

  const cols: Column<UsageLog>[] = [
    { key: "at", header: "เวลา", render: (r) => fmtDateTime(r.at) },
    { key: "feature", header: "Feature" },
    { key: "provider", header: "Provider", render: (r) => <StatusBadge label={r.provider} variant="primary" /> },
    { key: "model", header: "Model", className: "font-mono text-xs" },
    { key: "tokens", header: "Tokens", render: (r) => r.tokens.toLocaleString() },
    { key: "cost", header: "Cost (USD)", render: (r) => `$${r.cost.toFixed(4)}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge label={r.status} variant={r.status === "ok" ? "success" : "danger"} /> },
    { key: "conversationId", header: "Conversation" },
  ];

  return (
    <PageContainer
      title="Usage Logs"
      description="การใช้งาน AI/API พร้อมประมาณการ token และต้นทุน"
      actions={<ActionButton variant="primary" icon={<Download className="w-3 h-3" />} onClick={exportLogs}>Export</ActionButton>}
    >
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Tokens" value={totalTokens.toLocaleString()} icon={<BarChart3 className="w-4 h-4" />} />
        <MetricCard label="Total Cost" value={`$${totalCost.toFixed(4)}`} hint="ประมาณการจาก provider" />
        <MetricCard label="Requests" value={logs.length} />
      </div>
      <DataTable columns={cols} data={logs} />
    </PageContainer>
  );
}
