import { PageContainer } from "@/components/layout/PageContainer";
import { IntegrationCard } from "@/components/common/IntegrationCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { MessageCircle, Zap, Copy, Settings } from "lucide-react";
import { toast } from "sonner";

export function ChatIntegrationsPage() {
  const items = useAppStore((s) => s.chatIntegrations);
  const test = useAppStore((s) => s.testChatWebhook);
  const toggle = useAppStore((s) => s.toggleChannelConnection);

  return (
    <PageContainer title="Chat API Integrations" description="จัดการ LINE, Telegram, Meta, WhatsApp และเว็บแชท">
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
                <ActionButton size="sm" variant="ghost" icon={<Settings className="w-3 h-3" />} onClick={() => toast.info("เปิดแก้ไข Token (mock)")}>แก้ไข Token</ActionButton>
              </>
            }
          />
        ))}
      </div>
    </PageContainer>
  );
}
