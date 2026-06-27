import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useState } from "react";

export function ProductStockPage() {
  const products = useAppStore((s) => s.products);
  const updateStock = useAppStore((s) => s.updateStock);
  const linkCF = useAppStore((s) => s.linkCFKeyword);
  const [editing, setEditing] = useState<string | null>(null);

  const cols: Column<Product>[] = [
    { key: "name", header: "สินค้า", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "sku", header: "SKU", className: "font-mono text-xs" },
    { key: "price", header: "ราคา", render: (r) => r.price.toLocaleString() + " ฿" },
    {
      key: "stock",
      header: "Stock",
      render: (r) => (
        editing === r.id ? (
          <input type="number" autoFocus className="w-20 bg-background border border-border rounded px-2 py-1 text-xs" defaultValue={r.stock} onBlur={(e) => { updateStock(r.id, +e.target.value); setEditing(null); }} />
        ) : (
          <button className="text-primary" onClick={() => setEditing(r.id)}>{r.stock}</button>
        )
      ),
    },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "available" ? "success" : r.status === "low" ? "warning" : "danger"} /> },
    { key: "catalogId", header: "Catalog", render: (r) => r.catalogId ?? "—" },
    { key: "cfKeyword", header: "CF Keyword", render: (r) => <span className="font-mono">{r.cfKeyword ?? "—"}</span> },
    { key: "updated", header: "อัปเดต", render: (r) => fmtRelative(r.updatedAt) },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" onClick={() => { const kw = prompt("CF keyword:", r.cfKeyword ?? "NEW1"); if (kw) linkCF(r.id, kw); }}>ผูก CF</ActionButton>
          <ActionButton size="sm" variant="danger" onClick={() => updateStock(r.id, 0)}>หมด</ActionButton>
          <ActionButton size="sm" variant="ghost" onClick={() => toast.info("เปิด stock movement (mock)")}>Movement</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Product & Stock"
      description="สินค้า/ห้องและสต็อก เชื่อมโยงกับ Visual Catalog และ CF keyword"
      actions={<ActionButton variant="primary" onClick={() => toast.info("เปิดเพิ่มสินค้า (mock)")}>เพิ่มสินค้า</ActionButton>}
    >
      <DataTable columns={cols} data={products} />
    </PageContainer>
  );
}
