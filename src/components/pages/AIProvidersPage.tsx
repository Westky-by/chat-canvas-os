import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Zap, Save, Plus, Trash2, ShieldAlert, Bell } from "lucide-react";
import { toast } from "sonner";
import type { AIProvider } from "@/types";

const PROVIDER_OPTIONS = [
  { value: "Lovable AI / Google Gemini API", group: "Lovable AI Gateway + Gemini" },
  { value: "OpenAI", group: "OpenAI direct" },
  { value: "Claude (Anthropic)", group: "Anthropic" },
  { value: "Grok (xAI)", group: "xAI" },
  { value: "OpenAI-Compatible", group: "Self-hosted / OpenRouter / Together" },
  { value: "Custom", group: "Custom REST" },
] as const;

const MODEL_OPTIONS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "anthropic/claude-3-5-sonnet",
  "anthropic/claude-3-5-haiku",
  "xai/grok-2-latest",
];

export function AIProvidersPage() {
  const providers = useAppStore((s) => s.aiProviders);
  const update = useAppStore((s) => s.updateAIProvider);
  const add = useAppStore((s) => s.addAIProvider);
  const remove = useAppStore((s) => s.deleteAIProvider);
  const test = useAppStore((s) => s.testAIProvider);
  const setPrimary = useAppStore((s) => s.setPrimaryAI);

  const addNew = () => {
    add({
      name: "Gemini",
      providerLabel: "Lovable AI / Google Gemini API",
      model: "google/gemini-2.5-flash-lite",
      status: "active",
      role: providers.length === 0 ? "primary" : "fallback",
      costLimit: 1000,
      systemPrompt: "",
    });
  };

  return (
    <PageContainer
      title="AI API Providers"
      description="กำหนด Provider ที่ใช้ตอบลูกค้าอัตโนมัติ – ใช้ Lovable AI Gateway ได้ฟรีโดยไม่ต้องใส่ key หรือใส่ Google Gemini API key ของคุณเองเพื่อใช้เครดิตตัวเอง"
      actions={
        <ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={addNew}>
          เพิ่ม Provider
        </ActionButton>
      }
    >
      <div className="bg-primary/10 border border-primary/30 text-primary-foreground/90 rounded-xl p-3 text-xs flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <div>
          API Key ของคุณจะถูกเก็บใน localStorage ของเบราว์เซอร์เครื่องนี้เท่านั้น (ไม่ส่งไปเก็บที่ฐานข้อมูล) — ถ้าเว้นว่างไว้ ระบบจะใช้ Lovable AI Gateway ของแอปแทน
        </div>
      </div>

      <div className="space-y-4">
        {providers.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12 border border-dashed border-border rounded-2xl">
            ยังไม่มี Provider — กด "เพิ่ม Provider" เพื่อเริ่มต้น
          </div>
        )}
        {providers.map((p) => (
          <ProviderForm key={p.id} provider={p} onSave={update} onTest={test} onDelete={remove} onPrimary={setPrimary} />
        ))}
      </div>
    </PageContainer>
  );
}

function ProviderForm({
  provider,
  onSave,
  onTest,
  onDelete,
  onPrimary,
}: {
  provider: AIProvider;
  onSave: (id: string, patch: Partial<AIProvider>) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  onPrimary: (id: string) => void;
}) {
  const [providerLabel, setProviderLabel] = useState(provider.providerLabel ?? "Lovable AI / Google Gemini API");
  const [model, setModel] = useState(provider.model);
  const [rawKey, setRawKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(provider.systemPrompt ?? "");
  const [ownerLineId, setOwnerLineId] = useState(provider.ownerLineId ?? "");

  const notifyOwner = useAppStore((s) => s.notifyOwner);

  useEffect(() => { setModel(provider.model); }, [provider.model]);
  useEffect(() => { setSystemPrompt(provider.systemPrompt ?? ""); }, [provider.systemPrompt]);
  useEffect(() => { setOwnerLineId(provider.ownerLineId ?? ""); }, [provider.ownerLineId]);

  const save = () => {
    const patch: Partial<AIProvider> = { providerLabel, model, systemPrompt, ownerLineId };
    if (rawKey) (patch as { rawKey: string }).rawKey = rawKey;
    onSave(provider.id, patch);
    setRawKey("");
    toast.success("บันทึก Provider แล้ว");
  };

  const testNotify = () => {
    if (!ownerLineId.trim()) return toast.error("กรอก LINE ID ของเจ้าของก่อน");
    notifyOwner(
      `ai_handoff:${provider.name}`,
      `🔔 ทดสอบ: AI (${provider.name}) จะแจ้ง Owner LINE ID ${ownerLineId} เมื่อมีลูกค้าต้องการติดต่อ`,
      "LINE",
    );
  };


  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary grid place-items-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{provider.name}</div>
            <div className="text-[11px] text-muted-foreground">
              role: <span className="text-primary">{provider.role}</span> · status: {provider.status} · key: <span className="font-mono">{provider.maskedKey}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => onTest(provider.id)}>ทดสอบ</ActionButton>
          {provider.role !== "primary" && (
            <ActionButton size="sm" variant="ghost" onClick={() => onPrimary(provider.id)}>ตั้ง Primary</ActionButton>
          )}
          <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm(`ลบ ${provider.name}?`)) onDelete(provider.id); }}>ลบ</ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground">Provider</label>
          <select
            value={providerLabel}
            onChange={(e) => setProviderLabel(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs"
          >
            {PROVIDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
          >
            {MODEL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground">Google Gemini API Key (ไม่บังคับ)</label>
        <input
          type="password"
          value={rawKey}
          onChange={(e) => setRawKey(e.target.value)}
          placeholder={provider.maskedKey && provider.maskedKey !== "—" ? `เช่น AIza... (กรอกเมื่อต้องการเปลี่ยน key, ปัจจุบัน: ${provider.maskedKey})` : "เช่น AIza... (กรอกเมื่อต้องการเปลี่ยน key)"}
          className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          ถ้ากรอก ระบบจะเรียก Gemini API ของคุณโดยตรง · ปล่อยว่างไว้จะใช้ key เดิมที่บันทึกแล้ว หรือใช้เครดิตในแอปถ้าไม่เคยบันทึก key
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          placeholder="อธิบายตัวตนของผู้ช่วย AI เช่น ชื่อร้าน เมนู เวลาเปิด-ปิด ที่อยู่ ฯลฯ"
          className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono leading-relaxed"
        />
      </div>

      <div className="flex justify-end">
        <ActionButton variant="primary" icon={<Save className="w-3 h-3" />} onClick={save}>บันทึก</ActionButton>
      </div>
    </div>
  );
}
