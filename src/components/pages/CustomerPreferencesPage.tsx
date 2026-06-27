import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import type { CustomerPreference } from "@/types";

export function CustomerPreferencesPage() {
  const prefs = useAppStore((s) => s.customerPreferences);
  const customers = useAppStore((s) => s.customers);
  const notify = useAppStore((s) => s.notifyOwner);
  const addBooking = useAppStore((s) => s.addBooking);

  const cols: Column<CustomerPreference>[] = [
    { key: "customer", header: "ลูกค้า", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? r.customerId },
    { key: "interestedItem", header: "สนใจ", render: (r) => `${r.interestedItem} (${r.interestedZone})` },
    { key: "preferredDateTime", header: "วัน/เวลา" },
    { key: "people", header: "คน" },
    { key: "budget", header: "งบ", render: (r) => r.budget.toLocaleString() + " ฿" },
    { key: "specialRequest", header: "ขอพิเศษ", className: "max-w-[200px] text-muted-foreground" },
    { key: "urgency", header: "Urgency", render: (r) => <StatusBadge label={r.urgency} variant={r.urgency === "high" ? "danger" : r.urgency === "medium" ? "warning" : "muted"} /> },
    { key: "leadStatus", header: "Lead", render: (r) => <StatusBadge label={r.leadStatus} variant={r.leadStatus === "hot" ? "danger" : r.leadStatus === "warm" ? "warning" : "muted"} /> },
    { key: "sourceChannel", header: "Channel", render: (r) => <StatusBadge label={r.sourceChannel} variant="info" /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          <ActionButton size="sm" variant="primary" onClick={() => addBooking({ customerId: r.customerId, resource: `${r.interestedItem} ${r.interestedZone}`, price: r.budget })}>สร้างการจอง</ActionButton>
          <ActionButton size="sm" onClick={() => notify("Lead", `🔥 ${customers.find((c) => c.id === r.customerId)?.name} สนใจ ${r.interestedItem} ${r.interestedZone}`)}>แจ้งเจ้าของ</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => toast.success("เพิ่มเป้าหมายแคมเปญแล้ว")}>เพิ่มเป็นเป้าหมายแคมเปญ</ActionButton>
          <ActionButton size="sm" variant="danger" onClick={() => toast.success("ตั้งเป็น Hot Lead แล้ว")}>Hot Lead</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="Customer Preferences" description="ความสนใจของลูกค้าที่ AI จับได้ ใช้ทำการตลาดและจองได้ทันที">
      <DataTable columns={cols} data={prefs} />
    </PageContainer>
  );
}
