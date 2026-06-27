import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/common/MetricCard";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Sparkles, Calendar, DollarSign, Brain, Bell, Play } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { fmtTHB } from "@/utils/formatters";
import { RelativeTime } from "@/components/common/RelativeTime";

export function DashboardPage() {
  const inquiries = useAppStore((s) => s.inquiries);
  const bookings = useAppStore((s) => s.bookings);
  const orders = useAppStore((s) => s.orders);
  const notif = useAppStore((s) => s.ownerNotificationLogs);
  const addCatalog = useAppStore((s) => s.addCatalogItemFromCopilot);
  const notifyOwner = useAppStore((s) => s.notifyOwner);
  const addMessage = useAppStore((s) => s.addMessage);
  const conv = useAppStore((s) => s.conversations[0]);

  const revenue = orders.filter((o) => o.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);

  return (
    <PageContainer
      title="ภาพรวมระบบ (Dashboard)"
      description="สรุปการทำงาน AI, การจอง, ยอดขาย และการแจ้งเตือนเจ้าของแบบเรียลไทม์"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="AI Inquiries วันนี้" value={inquiries.length} hint="จากทุกช่องทาง" icon={<Sparkles className="w-4 h-4" />} trend={{ value: "+12% เทียบเมื่อวาน", positive: true }} />
        <MetricCard label="การจองที่รอ" value={bookings.filter((b) => b.status === "pending").length} hint="ต้องการการยืนยัน" icon={<Calendar className="w-4 h-4" />} />
        <MetricCard label="ยอดขายรวม" value={fmtTHB(revenue)} hint="จาก orders ที่ชำระแล้ว" icon={<DollarSign className="w-4 h-4" />} trend={{ value: "+8.4% week-on-week", positive: true }} />
        <MetricCard label="AI Accuracy" value="92.4%" hint="confidence เฉลี่ย 30 วัน" icon={<Brain className="w-4 h-4" />} trend={{ value: "+1.2%", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Demo Flow แบบครบวงจร</h3>
              <p className="text-xs text-muted-foreground mt-1">รันสถานการณ์จำลองเพื่อดูระบบทำงานข้ามหน้า</p>
            </div>
            <StatusBadge label="Mock Mode" variant="primary" />
          </div>
          <div className="space-y-2">
            <DemoStep
              n={1}
              text='ลูกค้าถาม "มีห้องแบบไหนบ้าง"'
              onRun={() => conv && addMessage(conv.id, "มีห้องแบบไหนบ้างคะ", "customer")}
            />
            <DemoStep n={2} text="AI ส่งรูปห้อง 3 แบบ (Visual Catalog Reply)" onRun={() => conv && addMessage(conv.id, "ทางเรามีห้องดีลักซ์ A, สวีท B, สแตนดาร์ด C ค่ะ [ส่งรูป 3 รายการ]", "ai")} />
            <DemoStep n={3} text='ลูกค้าเลือก "Zone A"' onRun={() => conv && addMessage(conv.id, "สนใจ Zone A ค่ะ", "customer")} />
            <DemoStep n={4} text="AI บันทึก preference ของลูกค้า" onRun={() => conv && addMessage(conv.id, "บันทึกความสนใจ Zone A เรียบร้อยค่ะ", "ai")} />
            <DemoStep n={5} text="AI แจ้งเจ้าของผ่าน LINE/Telegram" onRun={() => notifyOwner("ลูกค้าเลือก Zone A", "🛏️ ลูกค้าสนใจห้องดีลักซ์ Zone A ตอบกลับด่วน")} />
            <DemoStep n={6} text="Admin สร้างการจอง" onRun={() => useAppStore.getState().addBooking({ resource: "ห้องดีลักซ์ Zone A", price: 2500 })} />
            <div className="mt-3 pt-3 border-t border-border">
              <ActionButton variant="primary" icon={<Play className="w-3 h-3" />} onClick={() => addCatalog({ title: "Pool Suite Demo", price: 5500, cfKeyword: "DEMO" })}>
                ทดสอบ Copilot เพิ่มห้องอัตโนมัติ
              </ActionButton>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Owner Notifications ล่าสุด</h3>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {notif.slice(0, 8).map((n) => (
              <div key={n.id} className="border-l-2 border-primary/40 pl-3">
                <div className="text-xs">{n.message}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                  <StatusBadge label={n.channel} variant="info" />
                  {<RelativeTime iso={n.at} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DemoStep({ n, text, onRun }: { n: number; text: string; onRun: () => void }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border">
      <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center">{n}</div>
      <div className="flex-1 text-xs">{text}</div>
      <ActionButton size="sm" variant="primary" onClick={onRun} icon={<Play className="w-3 h-3" />}>รัน</ActionButton>
    </div>
  );
}
