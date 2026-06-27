import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtDateTime } from "@/utils/formatters";
import { Download } from "lucide-react";
import type { AuditLog } from "@/types";

export function AuditLogsPage() {
  const logs = useAppStore((s) => s.auditLogs);
  const exportLogs = useAppStore((s) => s.exportAuditLogs);

  const cols: Column<AuditLog>[] = [
    { key: "at", header: "เวลา", render: (r) => fmtDateTime(r.at) },
    { key: "actor", header: "Actor" },
    { key: "role", header: "Role", render: (r) => <StatusBadge label={r.role} variant="info" /> },
    { key: "action", header: "Action", className: "font-mono text-xs" },
    { key: "target", header: "Target" },
    { key: "status", header: "Status", render: (r) => <StatusBadge label={r.status} variant={r.status === "success" ? "success" : "danger"} /> },
    { key: "ip", header: "IP", className: "font-mono text-xs" },
  ];

  return (
    <PageContainer
      title="Audit Logs"
      description="บันทึกการกระทำที่สำคัญทุกอย่างในระบบ"
      actions={<ActionButton variant="primary" icon={<Download className="w-3 h-3" />} onClick={exportLogs}>Export CSV</ActionButton>}
    >
      <DataTable columns={cols} data={logs} />
    </PageContainer>
  );
}
