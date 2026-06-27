import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Brain, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function AITrainingCenterPage() {
  const files = useAppStore((s) => s.uploadedKnowledgeFiles);
  const approve = useAppStore((s) => s.approveKnowledge);
  const reject = useAppStore((s) => s.rejectKnowledge);
  const upload = useAppStore((s) => s.uploadKnowledge);
  const [faq, setFaq] = useState({ q: "", a: "" });

  const [rules, setRules] = useState([
    "ห้ามให้ข้อมูลที่ไม่ผ่านการอนุมัติ",
    "ตอบเป็นภาษาไทยก่อน เว้นแต่ลูกค้าใช้ภาษาอื่น",
    "ถ้า confidence < 70% ให้แจ้งเจ้าของแทนการเดา",
    "ห้ามตอบเรื่องราคาส่วนลดโดยไม่มีอนุมัติ",
  ]);
  const [newRule, setNewRule] = useState("");

  return (
    <PageContainer title="AI Training Center" description="จัดการความรู้ที่ AI ใช้ตอบลูกค้า รวมถึงกฎและพฤติกรรม">
      <div className="bg-primary/10 border border-primary/30 text-primary rounded-xl p-3 text-xs flex items-center gap-2">
        <Brain className="w-4 h-4" /> AI จะใช้ได้เฉพาะความรู้ที่ผ่านการอนุมัติเท่านั้น
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">ความรู้ที่อนุมัติแล้ว ({files.filter((f) => f.status === "approved").length})</h3>
          <div className="space-y-1.5 text-xs">
            {files.filter((f) => f.status === "approved").map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                <span>{f.name}</span>
                <StatusBadge label={f.category} variant="info" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">รออนุมัติ ({files.filter((f) => f.status === "pending").length})</h3>
          <div className="space-y-1.5 text-xs">
            {files.filter((f) => f.status === "pending").map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                <span className="truncate">{f.name}</span>
                <div className="flex gap-1">
                  <ActionButton size="sm" variant="primary" onClick={() => approve(f.id)}>อนุมัติ</ActionButton>
                  <ActionButton size="sm" variant="danger" onClick={() => reject(f.id)}>ปฏิเสธ</ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> สอน AI ด้วยตนเอง (FAQ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="คำถาม" value={faq.q} onChange={(e) => setFaq({ ...faq, q: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="คำตอบ" value={faq.a} onChange={(e) => setFaq({ ...faq, a: e.target.value })} />
        </div>
        <div className="mt-3">
          <ActionButton variant="primary" onClick={() => { if (!faq.q || !faq.a) return toast.error("กรอกให้ครบ"); upload(`faq-${faq.q.slice(0,20)}.txt`, "FAQ"); setFaq({ q: "", a: "" }); }}>เพิ่มเข้า Pending</ActionButton>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> กฎการทำงานของ AI</h3>
        <ul className="space-y-1.5 text-xs">
          {rules.map((r, i) => (
            <li key={i} className="p-2 bg-background rounded-lg flex items-center justify-between">
              <span>• {r}</span>
              <button className="text-destructive text-[11px]" onClick={() => setRules(rules.filter((_, j) => j !== i))}>ลบ</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-3">
          <input className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="เพิ่มกฎใหม่..." value={newRule} onChange={(e) => setNewRule(e.target.value)} />
          <ActionButton variant="primary" onClick={() => { if (!newRule) return; setRules([...rules, newRule]); setNewRule(""); toast.success("บันทึกกฎแล้ว"); }}>บันทึกกฎ</ActionButton>
        </div>
      </div>
    </PageContainer>
  );
}
