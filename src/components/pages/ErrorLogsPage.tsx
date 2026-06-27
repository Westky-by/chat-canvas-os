import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtDateTime } from "@/utils/formatters";
import { RotateCw, Check, Eye } from "lucide-react";
import type { ErrorLog } from "@/types";
import { toast } from "sonner";

export function ErrorLogsPage() {
  const logs = useAppStore((s) => s.errorLogs);
  const retry = useAppStore((s) => s.retryErrorLog);
  const resolve = useAppStore((s) => s.markErrorResolved);

  const cols: Column<ErrorLog>[] = [
    { key: "at", header: "เวลา", render: (r) => fmtDateTime(r.at) },
    { key: "source", header: "Source", className: "font-mono text-xs" },
    { key: "type", header: "Type", render: (r) => <StatusBadge label={r.type} variant="danger" /> },
    { key: "message", header: "Message", className: "max-w-[300px] truncate" },
    { key: "status", header: "Status", render: (r) => <StatusBadge label={r.status} variant={r.status === "resolved" ? "success" : r.status === "retrying" ? "warning" : "danger"} /> },
    { key: "retries", header: "Retries" },
    { key: "ownerNotified", header: "Owner แจ้ง?", render: (r) => r.ownerNotified ? <StatusBadge label="แจ้งแล้ว" variant="success" /> : <StatusBadge label="ยัง" variant="muted" /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" icon={<RotateCw className="w-3 h-3" />} onClick={() => retry(r.id)}>Retry</ActionButton>
          <ActionButton size="sm" variant="primary" icon={<Check className="w-3 h-3" />} onClick={() => resolve(r.id)}>Resolve</ActionButton>
          <ActionButton size="sm" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => toast.info(`Payload: { source: "${r.source}", message: "${r.message}" }`)}>Payload</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="Error Logs" description="ข้อผิดพลาดจากระบบ พร้อมสถานะการ retry และการแจ้งเตือนเจ้าของ">
      <DataTable columns={cols} data={logs} />
    </PageContainer>
  );
}
