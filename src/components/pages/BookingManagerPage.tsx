import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Plus, Check, CalendarSearch, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/types";

export function BookingManagerPage() {
  const bookings = useAppStore((s) => s.bookings);
  const customers = useAppStore((s) => s.customers);
  const confirmBooking = useAppStore((s) => s.confirmBooking);
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
      header: "การจัดการ",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <ActionButton
            size="sm"
            variant="primary"
            icon={<Check className="w-3 h-3" />}
            onClick={() => confirm(r.id)}
            disabled={r.status === "confirmed"}
          >
            ยืนยัน
          </ActionButton>
          <ActionButton size="sm" variant="secondary" icon={<CalendarSearch className="w-3 h-3" />} onClick={() => toast.info("เช็คสล็อตว่าง (mock)")}>
            เช็คคิว
          </ActionButton>
          <ActionButton size="sm" variant="secondary" icon={<CalendarClock className="w-3 h-3" />} onClick={() => toast.success("เลื่อนเวลาแล้ว (mock)")}>
            เลื่อน
          </ActionButton>
          <ActionButton
            size="sm"
            variant="danger"
            icon={<X className="w-3 h-3" />}
            onClick={() => { if (confirm(`ยกเลิกการจอง ${r.id}?`)) cancel(r.id); }}
            disabled={r.status === "cancelled"}
          >
            ยกเลิก
          </ActionButton>
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
