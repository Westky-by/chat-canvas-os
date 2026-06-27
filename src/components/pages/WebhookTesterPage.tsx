import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { Send } from "lucide-react";
import { fmtRelative } from "@/utils/formatters";

const eventTypes = [
  "customer_message", "live_cf_comment", "booking_request", "payment_slip_upload",
  "low_ai_confidence", "owner_notification", "complaint_detected", "customer_selected_zone_a",
  "ai_visual_catalog_reply", "payment_confirmation_required", "booking_slot_conflict",
];

const samplePayload = (e: string) => JSON.stringify({ event: e, at: new Date().toISOString(), data: { sample: true } }, null, 2);

export function WebhookTesterPage() {
  const logs = useAppStore((s) => s.webhookTestLogs);
  const send = useAppStore((s) => s.sendWebhookEvent);
  const [event, setEvent] = useState(eventTypes[0]);
  const [payload, setPayload] = useState(samplePayload(eventTypes[0]));
  const [response, setResponse] = useState<string>("");

  const fire = () => {
    send(event, payload);
    setResponse(`200 OK\n\n{ "received": true, "event": "${event}", "at": "${new Date().toISOString()}" }`);
  };

  return (
    <PageContainer title="Webhook Tester" description="ทดสอบ event ที่ระบบต้องตอบรับ พร้อมตัวอย่าง payload">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground">ประเภท Event</label>
            <select className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-xs" value={event} onChange={(e) => { setEvent(e.target.value); setPayload(samplePayload(e.target.value)); }}>
              {eventTypes.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Payload (JSON)</label>
            <textarea className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-[11px] font-mono min-h-[200px]" value={payload} onChange={(e) => setPayload(e.target.value)} />
          </div>
          <ActionButton variant="primary" icon={<Send className="w-3 h-3" />} onClick={fire}>Send Test Event</ActionButton>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-sm font-semibold mb-2">Response</div>
          <pre className="bg-background border border-border rounded-lg p-3 text-[11px] font-mono min-h-[260px] overflow-auto">{response || "// กด Send เพื่อทดสอบ"}</pre>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Recent Webhook Logs</h3>
        <div className="space-y-1.5 text-xs">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
              <div className="flex items-center gap-2">
                <StatusBadge label={l.status} variant={l.status === "ok" ? "success" : "danger"} />
                <span className="font-mono">{l.event}</span>
              </div>
              <span className="text-muted-foreground">{fmtRelative(l.at)}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
