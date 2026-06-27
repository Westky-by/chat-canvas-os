import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/types";

export function BookingManagerPage() {
  const bookings = useAppStore((s) => s.bookings);
  const customers = useAppStore((s) => s.customers);
  const confirm = useAppStore((s) => s.confirmBooking);
  const cancel = useAppStore((s) => s.cancelBooking);
  const add = useAppStore((s) => s.addBooking);

  const cols: Column<Booking>[] = [
    { key: "id", header: "Booking" },
    { key: "customer", header: "ลูกค้า", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? r.customerId },
    { key: "resource", header: "Resource" },
    { key: "date", header: "วัน/เวลา" },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "confirmed" ? "success" : r.status === "pending" ? "warning" : r.status === "cancelled" ? "danger" : "info"} /> },
    { key: "price", header: "ราคา", render: (r) => r.price.toLocaleString() + " ฿" },
    { key: "related", header: "เกี่ยวข้อง", render: (r) => r.relatedInquiryId ?? "—" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          {r.status !== "confirmed" && <ActionButton size="sm" variant="primary" onClick={() => confirm(r.id)}>ยืนยัน</ActionButton>}
          <ActionButton size="sm" variant="ghost" onClick={() => toast.info("เปิดเช็คสล็อตว่าง (mock)")}>เช็คคิว</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => toast.success("เลื่อนเวลาแล้ว (mock)")}>เลื่อน</ActionButton>
          <ActionButton size="sm" variant="danger" onClick={() => cancel(r.id)}>ยกเลิก</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="จัดการการจอง (Booking Manager)"
      description="คิวการจองทั้งหมด ครอบคลุมห้องพัก ที่นั่ง และนัดหมาย"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => add({ resource: "ห้อง Demo", price: 1500 })}>สร้างการจอง</ActionButton>}
    >
      <div className="bg-warning/10 border border-warning/30 text-warning rounded-xl p-3 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Production จะใช้ slot lock และระบบกัน double-booking บนฝั่ง backend
      </div>
      <DataTable columns={cols} data={bookings} />
    </PageContainer>
  );
}
