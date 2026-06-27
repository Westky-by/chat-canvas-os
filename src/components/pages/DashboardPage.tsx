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
  const aiFeedback = useAppStore((s) => s.aiFeedback);
  const notif = useAppStore((s) => s.ownerNotificationLogs);
  const addCatalog = useAppStore((s) => s.addCatalogItemFromCopilot);
  const notifyOwner = useAppStore((s) => s.notifyOwner);
  const addMessage = useAppStore((s) => s.addMessage);
  const conv = useAppStore((s) => s.conversations[0]);

  // ===== Real metrics (computed from actual store data) =====
  const now = Date.now();
  const DAY = 86_400_000;
  const WEEK = 7 * DAY;
  const inDay = (iso: string, offset = 0) => {
    const t = new Date(iso).getTime();
    return t >= now - (offset + 1) * DAY && t < now - offset * DAY;
  };
  const inWeek = (iso: string, offset = 0) => {
    const t = new Date(iso).getTime();
    return t >= now - (offset + 1) * WEEK && t < now - offset * WEEK;
  };
  const pct = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return ((cur - prev) / prev) * 100;
  };
  const fmtDelta = (p: number, suffix: string) =>
    `${p >= 0 ? "+" : ""}${p.toFixed(1)}% ${suffix}`;

  const inqToday = inquiries.filter((i) => inDay(i.createdAt, 0)).length;
  const inqYday = inquiries.filter((i) => inDay(i.createdAt, 1)).length;
  const inqDelta = pct(inqToday, inqYday);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paidOrders.reduce((a, b) => a + b.amount, 0);
  const revThisWeek = paidOrders.filter((o) => inWeek(o.createdAt, 0)).reduce((a, b) => a + b.amount, 0);
  const revLastWeek = paidOrders.filter((o) => inWeek(o.createdAt, 1)).reduce((a, b) => a + b.amount, 0);
  const revDelta = pct(revThisWeek, revLastWeek);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  // AI Accuracy = ค่าเฉลี่ย confidence จาก feedback ที่ผ่านการตรวจสอบ
  const scored = aiFeedback.filter((f) => f.status === "correct" || f.status === "wrong");
  const avgConfidence = scored.length
    ? (scored.reduce((a, f) => a + f.confidence, 0) / scored.length) * 100
    : 0;
  const correctRate = scored.length
    ? (scored.filter((f) => f.status === "correct").length / scored.length) * 100
    : 0;

  return (
    <PageContainer
      title="ภาพรวมระบบ (Dashboard)"
      description="สรุปการทำงาน AI, การจอง, ยอดขาย และการแจ้งเตือนเจ้าของแบบเรียลไทม์"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="AI Inquiries วันนี้"
          value={inqToday}
          hint={`เมื่อวาน ${inqYday} รายการ`}
          icon={<Sparkles className="w-4 h-4" />}
          trend={inquiries.length ? { value: fmtDelta(inqDelta, "เทียบเมื่อวาน"), positive: inqDelta >= 0 } : undefined}
        />
        <MetricCard
          label="การจองที่รอ"
          value={pendingBookings}
          hint={`จากทั้งหมด ${bookings.length} รายการ`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <MetricCard
          label="ยอดขายรวม"
          value={fmtTHB(revenue)}
          hint={`สัปดาห์นี้ ${fmtTHB(revThisWeek)}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={paidOrders.length ? { value: fmtDelta(revDelta, "week-on-week"), positive: revDelta >= 0 } : undefined}
        />
        <MetricCard
          label="AI Accuracy"
          value={scored.length ? `${correctRate.toFixed(1)}%` : "—"}
          hint={scored.length ? `confidence เฉลี่ย ${avgConfidence.toFixed(1)}% จาก ${scored.length} ฟีดแบ็ก` : "ยังไม่มีฟีดแบ็ก"}
          icon={<Brain className="w-4 h-4" />}
        />
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
