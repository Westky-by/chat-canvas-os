import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { Modal } from "@/components/common/Modal";
import { Plus, Copy, Send, Pencil } from "lucide-react";
import { toast } from "sonner";

export function VisualCatalogPage() {
  const catalog = useAppStore((s) => s.catalog);
  const add = useAppStore((s) => s.addCatalogItemFromCopilot);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", price: 0, cfKeyword: "" });

  const submit = () => {
    if (!form.title) return toast.error("กรอกชื่อ");
    add({ title: form.title, price: form.price, cfKeyword: form.cfKeyword || "NEW1" });
    setOpen(false);
    setForm({ title: "", price: 0, cfKeyword: "" });
  };

  return (
    <PageContainer
      title="Visual Catalog • คลังรูปสินค้า/ห้อง"
      description="รูปและข้อมูลที่ AI จะใช้ตอบลูกค้าแบบ Visual Reply"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => setOpen(true)}>เพิ่มรายการ</ActionButton>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {catalog.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="relative aspect-video bg-surface-elevated overflow-hidden">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                <StatusBadge label={c.aiUsable ? "AI ใช้ได้" : "ปิดใช้ AI"} variant={c.aiUsable ? "success" : "muted"} />
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-2">
              <div>
                <div className="font-semibold text-sm">{c.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{c.description}</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-semibold">{c.price.toLocaleString()} ฿</span>
                <span className="text-muted-foreground">Stock: {c.stock}</span>
              </div>
              <div className="text-[11px] flex items-center gap-2 text-muted-foreground">
                CF: <span className="font-mono text-foreground">{c.cfKeyword}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-border">
                <ActionButton size="sm" variant="ghost" icon={<Pencil className="w-3 h-3" />} onClick={() => toast.info("เปิดแก้ไข (mock)")}>แก้ไข</ActionButton>
                <ActionButton size="sm" variant="ghost" icon={<Copy className="w-3 h-3" />} onClick={() => { navigator.clipboard?.writeText(c.cfKeyword); toast.success("คัดลอก CF keyword แล้ว"); }}>Copy CF</ActionButton>
                <ActionButton size="sm" variant="primary" icon={<Send className="w-3 h-3" />} onClick={() => toast.success(`ส่ง ${c.title} เป็น AI Visual Reply (mock)`)}>ส่งเป็น AI Reply</ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่ม Catalog Item"
        footer={
          <>
            <ActionButton onClick={() => setOpen(false)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={submit}>บันทึก</ActionButton>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div><label className="text-muted-foreground">ชื่อ</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="text-muted-foreground">ราคา (บาท)</label><input type="number" className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
          <div><label className="text-muted-foreground">CF Keyword</label><input className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2" value={form.cfKeyword} onChange={(e) => setForm({ ...form, cfKeyword: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}
