import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import { Upload, FileText, CheckCircle, X, Archive, Eye, AlertTriangle } from "lucide-react";

export function FileImageKnowledgePage() {
  const files = useAppStore((s) => s.uploadedKnowledgeFiles);
  const upload = useAppStore((s) => s.uploadKnowledge);
  const approve = useAppStore((s) => s.approveKnowledge);
  const reject = useAppStore((s) => s.rejectKnowledge);
  const archive = useAppStore((s) => s.archiveKnowledge);

  const pending = files.filter((f) => f.status === "pending");
  const approved = files.filter((f) => f.status === "approved");
  const other = files.filter((f) => f.status === "rejected" || f.status === "archived");

  const Section = ({ title, items, variant }: { title: string; items: typeof files; variant: "warning" | "success" | "muted" }) => (
    <div>
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        {title} <StatusBadge label={`${items.length}`} variant={variant} />
      </h3>
      <div className="space-y-2">
        {items.map((f) => (
          <div key={f.id} className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{f.name}</div>
              <div className="text-[11px] text-muted-foreground">{f.category} • {f.uploadedBy} • {fmtRelative(f.uploadedAt)}</div>
            </div>
            <StatusBadge label={f.usedByAI ? "AI ใช้อยู่" : "ยังไม่ใช้"} variant={f.usedByAI ? "success" : "muted"} />
            <div className="flex gap-1">
              <ActionButton size="sm" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => alert(`Preview: ${f.name}`)}>ดู</ActionButton>
              {f.status === "pending" && <ActionButton size="sm" variant="primary" icon={<CheckCircle className="w-3 h-3" />} onClick={() => approve(f.id)}>อนุมัติ</ActionButton>}
              {f.status === "pending" && <ActionButton size="sm" variant="danger" icon={<X className="w-3 h-3" />} onClick={() => reject(f.id)}>ปฏิเสธ</ActionButton>}
              {f.status !== "archived" && <ActionButton size="sm" variant="ghost" icon={<Archive className="w-3 h-3" />} onClick={() => archive(f.id)}>เก็บเข้าคลัง</ActionButton>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PageContainer title="คลังเอกสาร & รูปภาพ (File & Image Knowledge)" description="อัปโหลดเอกสารและรูปให้ AI เรียนรู้ — ต้องผ่านการอนุมัติก่อนใช้งาน">
      <div className="bg-warning/10 border border-warning/30 text-warning rounded-xl p-3 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        ไฟล์ที่อัปโหลดจะยังไม่ถูก AI ใช้งานจนกว่า Admin จะกดอนุมัติ (Uploaded files are not used by AI until an admin approves them.)
      </div>

      <div className="bg-surface border border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2">
        <Upload className="w-8 h-8 text-muted-foreground" />
        <div className="text-sm font-medium">ลากไฟล์มาวางหรือคลิกเพื่ออัปโหลด</div>
        <div className="text-[11px] text-muted-foreground">รองรับ PDF, DOC, รูปภาพ, CSV</div>
        <ActionButton variant="primary" icon={<Upload className="w-3 h-3" />} onClick={() => upload(`upload-${Date.now()}.pdf`, "เอกสารใหม่")}>อัปโหลดไฟล์ตัวอย่าง</ActionButton>
      </div>

      <Section title="รออนุมัติ" items={pending} variant="warning" />
      <Section title="อนุมัติแล้ว (AI ใช้ได้)" items={approved} variant="success" />
      <Section title="ปฏิเสธ / คลังเก็บ" items={other} variant="muted" />
    </PageContainer>
  );
}
