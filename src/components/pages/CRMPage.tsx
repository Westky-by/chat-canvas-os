import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import { toast } from "sonner";
import { MessageSquare, Heart, StickyNote } from "lucide-react";
import type { Customer } from "@/types";

export function CRMPage() {
  const customers = useAppStore((s) => s.customers);

  const cols: Column<Customer>[] = [
    { key: "id", header: "Customer ID" },
    { key: "name", header: "ชื่อ", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "channel", header: "Channel", render: (r) => <StatusBadge label={r.channel} variant="info" /> },
    { key: "phone", header: "เบอร์" },
    { key: "tier", header: "Tier", render: (r) => <StatusBadge label={r.tier} variant={r.tier === "VIP" ? "primary" : "muted"} /> },
    { key: "tags", header: "Tags", render: (r) => <div className="flex gap-1 flex-wrap">{r.tags.map((t) => <span key={t} className="text-[10px] bg-surface-elevated border border-border px-1.5 py-0.5 rounded">{t}</span>)}</div> },
    { key: "lastActivity", header: "Last Activity", render: (r) => fmtRelative(r.lastActivity) },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" icon={<MessageSquare className="w-3 h-3" />} onClick={() => toast.success(`เปิด conversation ของ ${r.name}`)}>เปิดแชท</ActionButton>
          <ActionButton size="sm" variant="ghost" icon={<Heart className="w-3 h-3" />} onClick={() => toast.info(`ดู preferences ของ ${r.name}`)}>Preferences</ActionButton>
          <ActionButton size="sm" variant="ghost" icon={<StickyNote className="w-3 h-3" />} onClick={() => toast.success("เพิ่มโน้ตแล้ว (mock)")}>โน้ต</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="CRM • ฐานข้อมูลลูกค้า" description="รวมลูกค้าจากทุกช่องทาง พร้อม tier, tags และ activity ล่าสุด">
      <DataTable columns={cols} data={customers} />
    </PageContainer>
  );
}
