import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { IntegrationCard } from "@/components/common/IntegrationCard";
import { ActionButton } from "@/components/common/ActionButton";
import { Modal } from "@/components/common/Modal";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { MessageCircle, Zap, Copy, Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ChatIntegration } from "@/types";

type FormState = {
  id?: string;
  name: ChatIntegration["name"];
  status: ChatIntegration["status"];
  webhookUrl: string;
  rawToken: string;
  error?: string;
};

const NAMES: ChatIntegration["name"][] = [
  "LINE OA", "Telegram", "Facebook Messenger", "Instagram DM",
  "WhatsApp Business", "Website Live Chat", "Custom Webhook",
];

const empty = (): FormState => ({
  name: "LINE OA", status: "disconnected", webhookUrl: "", rawToken: "",
});

export function ChatIntegrationsPage() {
  const items = useAppStore((s) => s.chatIntegrations);
  const test = useAppStore((s) => s.testChatWebhook);
  const toggle = useAppStore((s) => s.toggleChannelConnection);
  const update = useAppStore((s) => s.updateChatIntegration);
  const add = useAppStore((s) => s.addChatIntegration);
  const remove = useAppStore((s) => s.deleteChatIntegration);

  const [form, setForm] = useState<FormState | null>(null);

  const openEdit = (i: ChatIntegration) =>
    setForm({ id: i.id, name: i.name, status: i.status, webhookUrl: i.webhookUrl, rawToken: "", error: i.error });

  const submit = () => {
    if (!form) return;
    if (!form.webhookUrl.trim()) return toast.error("กรอก Webhook URL");
    if (form.id) {
      update(form.id, {
        name: form.name, status: form.status, webhookUrl: form.webhookUrl, error: form.error,
        ...(form.rawToken ? ({ rawToken: form.rawToken } as Partial<ChatIntegration>) : {}),
      });
    } else {
      add({
        name: form.name, status: form.status, webhookUrl: form.webhookUrl,
        ...(form.rawToken ? ({ rawToken: form.rawToken } as Partial<ChatIntegration>) : {}),
      });
    }
    setForm(null);
  };

  return (
    <PageContainer
      title="Chat API Integrations"
      description="จัดการ LINE, Telegram, Meta, WhatsApp และเว็บแชท"
      actions={<ActionButton variant="primary" icon={<Plus className="w-3 h-3" />} onClick={() => setForm(empty())}>เพิ่ม Channel</ActionButton>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <IntegrationCard
            key={i.id}
            name={i.name}
            status={i.status}
            webhookUrl={i.webhookUrl}
            maskedToken={i.maskedToken}
            lastSync={i.lastSync ? <RelativeTime iso={i.lastSync} /> : undefined}
            lastMessage={i.lastMessage ? <RelativeTime iso={i.lastMessage} /> : undefined}
            error={i.error}
            icon={<MessageCircle className="w-4 h-4" />}
            actions={
              <>
                <ActionButton size="sm" variant="primary" onClick={() => toggle(i.id)}>{i.status === "connected" ? "ตัดการเชื่อม" : "เชื่อมต่อ"}</ActionButton>
                <ActionButton size="sm" icon={<Zap className="w-3 h-3" />} onClick={() => test(i.id)}>Test Webhook</ActionButton>
                <ActionButton size="sm" variant="ghost" icon={<Copy className="w-3 h-3" />} onClick={() => { navigator.clipboard?.writeText(i.webhookUrl); toast.success("คัดลอก URL แล้ว"); }}>Copy URL</ActionButton>
                <ActionButton size="sm" variant="ghost" icon={<Settings className="w-3 h-3" />} onClick={() => openEdit(i)}>แก้ไข</ActionButton>
                <ActionButton size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => { if (confirm(`ลบ ${i.name}?`)) remove(i.id); }}>ลบ</ActionButton>
              </>
            }
          />
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? `แก้ไข: ${form.name}` : "เพิ่ม Channel ใหม่"}
        footer={
          <>
            <ActionButton onClick={() => setForm(null)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={submit}>บันทึก</ActionButton>
          </>
        }
      >
        {form && (
          <div className="space-y-3 text-xs">
            <Field label="Channel">
              <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value as ChatIntegration["name"] })}>
                {NAMES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Webhook URL">
              <input className="w-full bg-background border border-border rounded-lg px-3 py-2"
                value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                placeholder="https://api.example.com/webhook/..." />
            </Field>
            <Field label={form.id ? "Access Token (เว้นว่างถ้าไม่เปลี่ยน)" : "Access Token"}>
              <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono"
                value={form.rawToken} onChange={(e) => setForm({ ...form, rawToken: e.target.value })}
                placeholder="••••••••••••" />
              <p className="text-[10px] text-muted-foreground mt-1">เก็บแบบ mask • ค่าจริงจะส่งไป server เท่านั้น (mock)</p>
            </Field>
            <Field label="สถานะ">
              <select className="w-full bg-background border border-border rounded-lg px-3 py-2"
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ChatIntegration["status"] })}>
                <option value="connected">connected</option>
                <option value="disconnected">disconnected</option>
                <option value="error">error</option>
              </select>
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
