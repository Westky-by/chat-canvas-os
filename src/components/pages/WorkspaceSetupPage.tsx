import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { toast } from "sonner";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</label>
    {children}
  </div>
);

const input = "w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary";

export function WorkspaceSetupPage() {
  const [form, setForm] = useState({
    name: "Main Shop",
    type: "โรงแรม / ที่พัก",
    lang: "ไทย",
    tz: "Asia/Bangkok",
    email: "support@shop.local",
    tone: "เป็นกันเอง สุภาพ",
    hours: "08:00 - 22:00 ทุกวัน",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <PageContainer
      title="ตั้งค่าเวิร์กสเปซ (Workspace Setup)"
      description="กำหนดข้อมูลธุรกิจ ภาษา โซนเวลา และโทนการตอบของ AI"
      actions={<ActionButton variant="primary" onClick={() => toast.success("บันทึกการตั้งค่าเรียบร้อย")}>บันทึก</ActionButton>}
    >
      <div className="bg-surface border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <Field label="ชื่อธุรกิจ"><input className={input} value={form.name} onChange={set("name")} /></Field>
        <Field label="ประเภทธุรกิจ">
          <select className={input} value={form.type} onChange={set("type")}>
            <option>โรงแรม / ที่พัก</option><option>ร้านอาหาร</option><option>ร้านค้าออนไลน์</option>
            <option>คลินิก</option><option>บริการ</option>
          </select>
        </Field>
        <Field label="ภาษาเริ่มต้น">
          <select className={input} value={form.lang} onChange={set("lang")}><option>ไทย</option><option>English</option></select>
        </Field>
        <Field label="Timezone"><input className={input} value={form.tz} onChange={set("tz")} /></Field>
        <Field label="อีเมลซัพพอร์ต"><input className={input} value={form.email} onChange={set("email")} /></Field>
        <Field label="โทนการตอบของแบรนด์"><input className={input} value={form.tone} onChange={set("tone")} /></Field>
        <Field label="เวลาทำการ"><input className={input} value={form.hours} onChange={set("hours")} /></Field>
      </div>
    </PageContainer>
  );
}
