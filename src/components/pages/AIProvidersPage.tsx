import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProviderCard } from "@/components/common/ProviderCard";
import { ActionButton } from "@/components/common/ActionButton";
import { Modal } from "@/components/common/Modal";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Sparkles, Key, ShieldAlert, Zap, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AIProvider } from "@/types";

const NAMES: AIProvider["name"][] = ["Gemini", "OpenAI", "Claude", "Grok", "Vertex AI", "OpenAI-Compatible", "Custom"];

type FormState = {
  id?: string;
  name: AIProvider["name"];
  model: string;
  role: AIProvider["role"];
  status: AIProvider["status"];
  costLimit: number;
  rawKey: string;
};

const empty = (): FormState => ({
  name: "Gemini", model: "gemini-2.5-flash", role: "manual", status: "disabled", costLimit: 1000, rawKey: "",
});

export function AIProvidersPage() {
  const providers = useAppStore((s) => s.aiProviders);
  const test = useAppStore((s) => s.testAIProvider);
  const rotate = useAppStore((s) => s.rotateAIKey);
  const toggle = useAppStore((s) => s.toggleAIProvider);
  const setPrimary = useAppStore((s) => s.setPrimaryAI);
  const update = useAppStore((s) => s.updateAIProvider);
  const add = useAppStore((s) => s.addAIProvider);
  const remove = useAppStore((s) => s.deleteAIProvider);

  const [form, setForm] = useState<FormState | null>(null);

  const openEdit = (p: AIProvider) =>
    setForm({ id: p.id, name: p.name, model: p.model, role: p.role, status: p.status, costLimit: p.costLimit, rawKey: "" });

  const submit = () => {
    if (!form) return;
    if (!form.model.trim()) return toast.error("กรอกชื่อโมเดล");
    const payload: Partial<AIProvider> = {
      name: form.name, model: form.model, role: form.role, status: form.status, costLimit: form.costLimit,
    };
    if (form.rawKey) (payload as Partial<AIProvider> & { rawKey?: string }).rawKey = form.rawKey;
    if (form.id) update(form.id, payload);
    else add(payload);
    setForm(null);
  };

  return (
    <PageContainer
      title="AI API Providers"
      description="จัดการ Provider AI (Gemini, OpenAI, Claude ฯลฯ) และเลือก primary/fallback"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => setForm(empty())}>เพิ่ม Provider</ActionButton>}
    >
      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> Secrets จะถูกเก็บที่ฝั่ง server เท่านั้น เมื่อบันทึกแล้วจะไม่สามารถดูค่าจริงได้อีก
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => (
          <ProviderCard
            key={p.id}
            name={p.name}
            status={p.status}
            model={p.model}
            maskedKey={p.maskedKey}
            role={p.role}
            lastTested={p.lastTested ? <RelativeTime iso={p.lastTested} /> : undefined}
            costLimit={p.costLimit}
            icon={<Sparkles className="w-4 h-4" />}
            actions={
              <>
                <ActionButton size="sm" variant="primary" icon={<Zap className="w-3 h-3" />} onClick={() => test(p.id)}>ทดสอบ</ActionButton>
                <ActionButton size="sm" icon={<Key className="w-3 h-3" />} onClick={() => rotate(p.id)}>Rotate Key</ActionButton>
                <ActionButton size="sm" variant="ghost" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(p)}>แก้ไข</ActionButton>
                <ActionButton size="sm" variant="ghost" onClick={() => setPrimary(p.id)}>ตั้งเป็น Primary</ActionButton>
                <ActionButton size="sm" variant={p.status === "active" ? "danger" : "outline"} onClick={() => toggle(p.id)}>{p.status === "active" ? "ปิด" : "เปิด"}</ActionButton>
                <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm(`ลบ ${p.name}?`)) remove(p.id); }}>ลบ</ActionButton>
              </>
            }
          />
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? `แก้ไข: ${form.name}` : "เพิ่ม AI Provider"}
        footer={
          <>
            <ActionButton onClick={() => setForm(null)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={submit}>บันทึก</ActionButton>
          </>
        }
      >
        {form && (
          <div className="space-y-3 text-xs">
            <Field label="Provider">
              <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value as AIProvider["name"] })}>
                {NAMES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Model">
              <input className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono"
                value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="เช่น gemini-2.5-flash" />
            </Field>
            <Field label={form.id ? "API Key (เว้นว่างถ้าไม่เปลี่ยน)" : "API Key"}>
              <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono"
                value={form.rawKey} onChange={(e) => setForm({ ...form, rawKey: e.target.value })}
                placeholder="sk-..." />
              <p className="text-[10px] text-muted-foreground mt-1">เก็บแบบ mask • ค่าจริงจะถูกส่งไป server เท่านั้น (mock)</p>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="บทบาท">
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AIProvider["role"] })}>
                  <option value="primary">primary</option>
                  <option value="fallback">fallback</option>
                  <option value="manual">manual</option>
                </select>
              </Field>
              <Field label="สถานะ">
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AIProvider["status"] })}>
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </Field>
            </div>
            <Field label="วงเงิน (บาท/เดือน)">
              <input type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2"
                value={form.costLimit} onChange={(e) => setForm({ ...form, costLimit: +e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
