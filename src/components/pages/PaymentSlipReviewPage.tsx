import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Check, X, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PaymentSlipReviewPage() {
  const slips = useAppStore((s) => s.paymentSlips);
  const customers = useAppStore((s) => s.customers);
  const approve = useAppStore((s) => s.approvePaymentSlip);
  const reject = useAppStore((s) => s.rejectPaymentSlip);

  return (
    <PageContainer title="Payment Slip Review" description="ตรวจสอบและอนุมัติสลิปโอนเงินจากลูกค้า">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slips.map((s) => {
          const cust = customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center text-muted-foreground text-xs">
                [Slip Image Placeholder]
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{s.id}</div>
                  <StatusBadge label={s.status} variant={s.status === "approved" ? "success" : s.status === "rejected" ? "danger" : "warning"} />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">ลูกค้า</span><span>{cust?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span>{s.orderId ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ยอด</span><span className="text-primary font-semibold">{s.amount.toLocaleString()} ฿</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">อัปโหลด</span><span>{<RelativeTime iso={s.uploadedAt} />}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ผู้ตรวจ</span><span>{s.reviewer ?? "—"}</span></div>
                </div>
                <div className="flex gap-1 pt-2 border-t border-border flex-wrap">
                  {s.status === "pending" && <>
                    <ActionButton size="sm" variant="primary" icon={<Check className="w-3 h-3" />} onClick={() => approve(s.id)}>อนุมัติ</ActionButton>
                    <ActionButton size="sm" variant="danger" icon={<X className="w-3 h-3" />} onClick={() => reject(s.id)}>ปฏิเสธ</ActionButton>
                    <ActionButton size="sm" icon={<RotateCcw className="w-3 h-3" />} onClick={() => toast.info("ขอสลิปใหม่จากลูกค้า (mock)")}>ขอสลิปใหม่</ActionButton>
                  </>}
                  <ActionButton size="sm" variant="ghost" icon={<ExternalLink className="w-3 h-3" />} onClick={() => toast.info("เปิด order " + s.orderId)}>เปิด Order</ActionButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
