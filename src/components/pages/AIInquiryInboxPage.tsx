import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import type { Inquiry } from "@/types";

const statusVariant: Record<string, "primary" | "success" | "warning" | "danger" | "muted" | "info"> = {
  new: "info",
  interested: "primary",
  waiting_owner: "warning",
  booking_requested: "warning",
  contacted: "success",
  closed: "muted",
};

export function AIInquiryInboxPage() {
  const inquiries = useAppStore((s) => s.inquiries);
  const customers = useAppStore((s) => s.customers);
  const assignAdmin = useAppStore((s) => s.assignAdmin);
  const createBooking = useAppStore((s) => s.createBookingFromInquiry);
  const notifyOwner = useAppStore((s) => s.notifyOwner);
  const markContacted = useAppStore((s) => s.markInquiryContacted);
  const markClosed = useAppStore((s) => s.markInquiryClosed);

  const cols: Column<Inquiry>[] = [
    { key: "id", header: "Inquiry" },
    { key: "customer", header: "ลูกค้า", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? r.customerId },
    { key: "channel", header: "Channel", render: (r) => <StatusBadge label={r.channel} variant="info" /> },
    { key: "interest", header: "สนใจ", render: (r) => `${r.interestedItem} / ${r.interestedZone}` },
    { key: "lastMessage", header: "ข้อความล่าสุด", className: "max-w-[200px] truncate" },
    {
      key: "confidence",
      header: "AI Conf.",
      render: (r) => (
        <span className={r.confidence > 0.85 ? "text-success" : r.confidence > 0.7 ? "text-warning" : "text-destructive"}>
          {(r.confidence * 100).toFixed(0)}%
        </span>
      ),
    },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={statusVariant[r.status]} /> },
    { key: "assignedAdmin", header: "Admin", render: (r) => r.assignedAdmin ?? "—" },
    { key: "createdAt", header: "สร้างเมื่อ", render: (r) => <RelativeTime iso={r.createdAt} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          <ActionButton size="sm" variant="primary" onClick={() => createBooking(r.id)}>สร้างการจอง</ActionButton>
          <ActionButton size="sm" onClick={() => notifyOwner(`Inquiry ${r.id}`, `🛏️ ${r.interestedItem} ${r.interestedZone}`)}>แจ้งเจ้าของ</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => assignAdmin(r.id, "Admin1")}>มอบหมาย</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => markContacted(r.id)}>ติดต่อแล้ว</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => markClosed(r.id)}>ปิด</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="AI Inquiry Inbox" description="คำถามและ Lead ที่ AI จับได้จากทุกช่องทาง">
      <DataTable columns={cols} data={inquiries} />
    </PageContainer>
  );
}
