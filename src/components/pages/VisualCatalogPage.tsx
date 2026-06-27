import { useState, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { Modal } from "@/components/common/Modal";
import { Plus, Copy, Send, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { CatalogItem } from "@/types";

type FormState = {
  title: string;
  price: number;
  cfKeyword: string;
  stock: number;
  description: string;
  image: string;
  aiUsable: boolean;
};

const empty: FormState = { title: "", price: 0, cfKeyword: "", stock: 1, description: "", image: "", aiUsable: true };

export function VisualCatalogPage() {
  const catalog = useAppStore((s) => s.catalog);
  const add = useAppStore((s) => s.addCatalogItem);
  const update = useAppStore((s) => s.updateCatalogItem);
  const remove = useAppStore((s) => s.deleteCatalogItem);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (c: CatalogItem) => {
    setEditingId(c.id);
    setForm({ title: c.title, price: c.price, cfKeyword: c.cfKeyword, stock: c.stock, description: c.description, image: c.image, aiUsable: c.aiUsable });
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
    if (!form.title.trim()) return toast.error("กรอกชื่อรายการ");
    if (editingId) update(editingId, form);
    else add(form);
    setOpen(false);
    setForm(empty);
    setEditingId(null);
  };

  return (
    <PageContainer
      title="Visual Catalog • คลังรูปสินค้า/ห้อง"
      description="รูปและข้อมูลที่ AI จะใช้ตอบลูกค้าแบบ Visual Reply"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={openCreate}>เพิ่มรายการ</ActionButton>}
    >
      {catalog.length === 0 && (
        <div className="bg-surface border border-dashed border-border rounded-xl p-10 text-center text-xs text-muted-foreground">
          ยังไม่มีรายการ — กด "เพิ่มรายการ" เพื่อเริ่ม
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {catalog.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="relative aspect-video bg-surface-elevated overflow-hidden">
              {c.image ? <img src={c.image} alt={c.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">ไม่มีรูป</div>}
              <div className="absolute top-2 right-2">
                <StatusBadge label={c.aiUsable ? "AI ใช้ได้" : "ปิดใช้ AI"} variant={c.aiUsable ? "success" : "muted"} />
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-2">
              <div>
                <div className="font-semibold text-sm">{c.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{c.description}</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-semibold">{c.price.toLocaleString()} ฿</span>
                <span className="text-muted-foreground">Stock: {c.stock}</span>
              </div>
              <div className="text-[11px] flex items-center gap-2 text-muted-foreground">
                CF: <span className="font-mono text-foreground">{c.cfKeyword}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-border">
                <ActionButton size="sm" variant="secondary" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(c)}>แก้ไข</ActionButton>
                <ActionButton size="sm" variant="ghost" icon={<Copy className="w-3 h-3" />} onClick={() => { navigator.clipboard?.writeText(c.cfKeyword); toast.success("คัดลอก CF keyword แล้ว"); }}>Copy CF</ActionButton>
                <ActionButton size="sm" variant="primary" icon={<Send className="w-3 h-3" />} onClick={() => toast.success(`ส่ง ${c.title} เป็น AI Visual Reply`)}>ส่ง</ActionButton>
                <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm(`ลบ ${c.title}?`)) remove(c.id); }}>ลบ</ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "แก้ไข Catalog Item" : "เพิ่ม Catalog Item"}
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
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="หรือวาง URL รูป" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
          </div>
          <div><label className="text-muted-foreground">ชื่อ</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="text-muted-foreground">รายละเอียด</label><textarea rows={3} className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-muted-foreground">ราคา (฿)</label><input type="number" className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
            <div><label className="text-muted-foreground">Stock</label><input type="number" className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
            <div><label className="text-muted-foreground">CF Keyword</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.cfKeyword} onChange={(e) => setForm({ ...form, cfKeyword: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={form.aiUsable} onChange={(e) => setForm({ ...form, aiUsable: e.target.checked })} />
            <span>เปิดให้ AI ใช้รายการนี้ในการตอบ</span>
          </label>
        </div>
      </Modal>
    </PageContainer>
  );
}
