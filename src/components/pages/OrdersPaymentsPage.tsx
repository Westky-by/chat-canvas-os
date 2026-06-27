import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { toast } from "sonner";
import type { Order } from "@/types";

export function OrdersPaymentsPage() {
  const orders = useAppStore((s) => s.orders);
  const customers = useAppStore((s) => s.customers);
  const confirmPayment = useAppStore((s) => s.confirmPayment);

  const cols: Column<Order>[] = [
    { key: "id", header: "Order" },
    { key: "customer", header: "ลูกค้า", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? r.customerId },
    { key: "items", header: "รายการ" },
    { key: "amount", header: "ยอด", render: (r) => r.amount.toLocaleString() + " ฿" },
    { key: "paymentStatus", header: "ชำระเงิน", render: (r) => <StatusBadge label={r.paymentStatus} variant={r.paymentStatus === "paid" ? "success" : r.paymentStatus === "pending_review" ? "warning" : "muted"} /> },
    { key: "fulfillmentStatus", header: "ดำเนินการ", render: (r) => <StatusBadge label={r.fulfillmentStatus} variant={r.fulfillmentStatus === "completed" || r.fulfillmentStatus === "confirmed" ? "success" : "warning"} /> },
    { key: "channel", header: "Channel", render: (r) => <StatusBadge label={r.channel} variant="info" /> },
    { key: "createdAt", header: "เมื่อ", render: (r) => <RelativeTime iso={r.createdAt} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.paymentStatus !== "paid" && <ActionButton size="sm" variant="primary" onClick={() => confirmPayment(r.id)}>ยืนยันชำระ</ActionButton>}
          <ActionButton size="sm" onClick={() => toast.success("แนบสลิปแล้ว (mock)")}>แนบสลิป</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => toast.success("สร้างใบเสร็จ (mock)")}>ใบเสร็จ</ActionButton>
          <ActionButton size="sm" variant="danger" onClick={() => toast.warning("ยกเลิกคำสั่งซื้อแล้ว")}>ยกเลิก</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="Orders & Payments" description="คำสั่งซื้อจากทุกช่องทาง พร้อมสถานะการชำระเงินและดำเนินการ">
      <DataTable columns={cols} data={orders} />
    </PageContainer>
  );
}
