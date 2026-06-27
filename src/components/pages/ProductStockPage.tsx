import { useState, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { Modal } from "@/components/common/Modal";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import type { Product } from "@/types";

type FormState = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  cfKeyword: string;
  image: string;
  description: string;
};

const empty: FormState = { name: "", sku: "", price: 0, stock: 0, cfKeyword: "", image: "", description: "" };

export function ProductStockPage() {
  const products = useAppStore((s) => s.products);
  const add = useAppStore((s) => s.addProduct);
  const update = useAppStore((s) => s.updateProduct);
  const remove = useAppStore((s) => s.deleteProduct);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, sku: p.sku, price: p.price, stock: p.stock, cfKeyword: p.cfKeyword ?? "", image: p.image ?? "", description: p.description ?? "" });
    setOpen(true);
  };
  const onPickImage = (file?: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast.error("ไฟล์ใหญ่เกิน 4MB");
    const r = new FileReader();
    r.onload = () => setForm((f) => ({ ...f, image: String(r.result) }));
    r.readAsDataURL(file);
  };
  const submit = () => {
    if (!form.name.trim()) return toast.error("กรอกชื่อสินค้า");
    if (editingId) update(editingId, form);
    else add(form);
    setOpen(false);
  };

  const cols: Column<Product>[] = [
    {
      key: "image", header: "รูป", render: (r) => (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-surface-elevated flex items-center justify-center">
          {r.image ? <img src={r.image} alt={r.name} className="w-full h-full object-cover" /> : <span className="text-[10px] text-muted-foreground">—</span>}
        </div>
      ),
    },
    { key: "name", header: "สินค้า", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "sku", header: "SKU", className: "font-mono text-xs" },
    { key: "price", header: "ราคา", render: (r) => r.price.toLocaleString() + " ฿" },
    { key: "stock", header: "Stock" },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "available" ? "success" : r.status === "low" ? "warning" : "danger"} /> },
    { key: "cfKeyword", header: "CF", render: (r) => <span className="font-mono">{r.cfKeyword ?? "—"}</span> },
    { key: "updated", header: "อัปเดต", render: (r) => <RelativeTime iso={r.updatedAt} /> },
    {
      key: "actions", header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" variant="secondary" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(r)}>แก้ไข</ActionButton>
          <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm(`ลบ ${r.name}?`)) remove(r.id); }}>ลบ</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Product & Stock"
      description="สินค้า/ห้องและสต็อก เชื่อมโยงกับ Visual Catalog และ CF keyword"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={openCreate}>เพิ่มสินค้า</ActionButton>}
    >
      <DataTable columns={cols} data={products} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        footer={
          <>
            <ActionButton onClick={() => setOpen(false)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={submit}>บันทึก</ActionButton>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground">รูปภาพ</label>
            <div className="mt-1 flex gap-3 items-start">
              <div className="w-28 h-20 bg-background border border-border rounded-lg overflow-hidden flex items-center justify-center">
                {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : <span className="text-muted-foreground">ไม่มีรูป</span>}
              </div>
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickImage(e.target.files?.[0])} />
                <ActionButton type="button" icon={<Upload className="w-3 h-3" />} onClick={() => fileRef.current?.click()}>อัปโหลดรูป</ActionButton>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="หรือ URL รูป" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-muted-foreground">ชื่อสินค้า</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-muted-foreground">SKU</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 font-mono" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          </div>
          <div><label className="text-muted-foreground">รายละเอียด</label><textarea rows={2} className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-muted-foreground">ราคา (฿)</label><input type="number" className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
            <div><label className="text-muted-foreground">Stock</label><input type="number" className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
            <div><label className="text-muted-foreground">CF Keyword</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 font-mono" value={form.cfKeyword} onChange={(e) => setForm({ ...form, cfKeyword: e.target.value })} /></div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
