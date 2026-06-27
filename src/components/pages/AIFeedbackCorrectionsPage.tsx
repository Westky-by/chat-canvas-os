import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import type { AIFeedback } from "@/types";
import { Check, X, Save } from "lucide-react";
import { Modal } from "@/components/common/Modal";

export function AIFeedbackCorrectionsPage() {
  const feedback = useAppStore((s) => s.aiFeedback);
  const save = useAppStore((s) => s.saveAIFeedback);
  const [editing, setEditing] = useState<AIFeedback | null>(null);
  const [text, setText] = useState("");

  const cols: Column<AIFeedback>[] = [
    { key: "question", header: "คำถาม", className: "max-w-[200px]" },
    { key: "aiAnswer", header: "AI ตอบ", className: "max-w-[200px] text-muted-foreground" },
    { key: "correction", header: "การแก้ไข", render: (r) => r.correction ?? "—" },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "correct" ? "success" : r.status === "wrong" ? "danger" : r.status === "saved" ? "primary" : "warning"} /> },
    { key: "confidence", header: "Conf.", render: (r) => `${(r.confidence * 100).toFixed(0)}%` },
    { key: "createdAt", header: "เมื่อ", render: (r) => fmtRelative(r.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <ActionButton size="sm" variant="primary" icon={<Check className="w-3 h-3" />} onClick={() => save(r.id, "correct")}>ถูก</ActionButton>
          <ActionButton size="sm" variant="danger" icon={<X className="w-3 h-3" />} onClick={() => save(r.id, "wrong")}>ผิด</ActionButton>
          <ActionButton size="sm" icon={<Save className="w-3 h-3" />} onClick={() => { setEditing(r); setText(r.correction ?? ""); }}>แก้ไข+บันทึกเข้าความรู้</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="AI Feedback & Corrections" description="ตรวจสอบคำตอบของ AI และบันทึกคำตอบที่ถูกต้องกลับเข้าความรู้">
      <DataTable columns={cols} data={feedback} />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="แก้ไขคำตอบของ AI"
        footer={
          <>
            <ActionButton onClick={() => setEditing(null)}>ยกเลิก</ActionButton>
            <ActionButton variant="primary" onClick={() => { if (editing) save(editing.id, "saved", text); setEditing(null); }}>บันทึกเข้าความรู้</ActionButton>
          </>
        }
      >
        <div className="text-xs space-y-2">
          <div><span className="text-muted-foreground">คำถาม:</span> {editing?.question}</div>
          <div><span className="text-muted-foreground">AI ตอบ:</span> {editing?.aiAnswer}</div>
          <textarea className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-xs min-h-[100px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="คำตอบที่ถูกต้อง" />
        </div>
      </Modal>
    </PageContainer>
  );
}
