import { useMemo, useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/common/MetricCard";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { Sparkles, Calendar, DollarSign, Brain, Bell, Play, Plus, Pencil, Trash2, FileDown, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { fmtTHB } from "@/utils/formatters";
import { RelativeTime } from "@/components/common/RelativeTime";

type RangeKey = "today" | "7d" | "30d" | "custom";
type DemoActionType = "customer" | "ai" | "notify" | "booking" | "catalog";

interface DemoStepDef {
  id: string;
  text: string;
  action: DemoActionType;
  payload: string;
}

const DEFAULT_STEPS: DemoStepDef[] = [
  { id: "s1", text: 'ลูกค้าถาม "มีห้องแบบไหนบ้าง"', action: "customer", payload: "มีห้องแบบไหนบ้างคะ" },
  { id: "s2", text: "AI ส่งรูปห้อง 3 แบบ (Visual Catalog Reply)", action: "ai", payload: "ทางเรามีห้องดีลักซ์ A, สวีท B, สแตนดาร์ด C ค่ะ [ส่งรูป 3 รายการ]" },
  { id: "s3", text: 'ลูกค้าเลือก "Zone A"', action: "customer", payload: "สนใจ Zone A ค่ะ" },
  { id: "s4", text: "AI บันทึก preference ของลูกค้า", action: "ai", payload: "บันทึกความสนใจ Zone A เรียบร้อยค่ะ" },
  { id: "s5", text: "AI แจ้งเจ้าของผ่าน LINE/Telegram", action: "notify", payload: "🛏️ ลูกค้าสนใจห้องดีลักซ์ Zone A ตอบกลับด่วน" },
  { id: "s6", text: "Admin สร้างการจอง", action: "booking", payload: "ห้องดีลักซ์ Zone A|2500" },
];

const STORAGE_KEY = "dashboard.demoSteps.v1";

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

  // ===== Date range =====
  const [range, setRange] = useState<RangeKey>("today");
  const [fromDate, setFromDate] = useState<string>(() => new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const { startMs, endMs, prevStartMs, prevEndMs, rangeLabel } = useMemo(() => {
    const end = new Date(); end.setHours(23, 59, 59, 999);
    let start = new Date(); start.setHours(0, 0, 0, 0);
    let label = "วันนี้";
    if (range === "7d") { start = new Date(Date.now() - 6 * 86400000); start.setHours(0,0,0,0); label = "7 วันล่าสุด"; }
    else if (range === "30d") { start = new Date(Date.now() - 29 * 86400000); start.setHours(0,0,0,0); label = "30 วันล่าสุด"; }
    else if (range === "custom") {
      start = new Date(fromDate + "T00:00:00");
      end.setTime(new Date(toDate + "T23:59:59").getTime());
      label = `${fromDate} → ${toDate}`;
    }
    const span = end.getTime() - start.getTime();
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
      prevStartMs: start.getTime() - span - 1,
      prevEndMs: start.getTime() - 1,
      rangeLabel: label,
    };
  }, [range, fromDate, toDate]);

  const inRange = (iso: string, s = startMs, e = endMs) => {
    const t = new Date(iso).getTime();
    return t >= s && t <= e;
  };
  const pct = (cur: number, prev: number) => prev === 0 ? (cur === 0 ? 0 : 100) : ((cur - prev) / prev) * 100;
  const fmtDelta = (p: number, suffix: string) => `${p >= 0 ? "+" : ""}${p.toFixed(1)}% ${suffix}`;

  const inqCur = inquiries.filter((i) => inRange(i.createdAt)).length;
  const inqPrev = inquiries.filter((i) => inRange(i.createdAt, prevStartMs, prevEndMs)).length;
  const inqDelta = pct(inqCur, inqPrev);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const revCur = paidOrders.filter((o) => inRange(o.createdAt)).reduce((a, b) => a + b.amount, 0);
  const revPrev = paidOrders.filter((o) => inRange(o.createdAt, prevStartMs, prevEndMs)).reduce((a, b) => a + b.amount, 0);
  const revDelta = pct(revCur, revPrev);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const bookingsInRange = bookings.filter((b) => inRange(b.date || new Date().toISOString())).length;

  const scoped = aiFeedback.filter((f) => inRange(f.createdAt));
  const scored = scoped.filter((f) => f.status === "correct" || f.status === "wrong");
  const avgConfidence = scored.length ? (scored.reduce((a, f) => a + f.confidence, 0) / scored.length) * 100 : 0;
  const correctRate = scored.length ? (scored.filter((f) => f.status === "correct").length / scored.length) * 100 : 0;

  // ===== Demo Flow (editable, persisted) =====
  const [steps, setSteps] = useState<DemoStepDef[]>(DEFAULT_STEPS);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSteps(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);
  const saveSteps = (next: DemoStepDef[]) => {
    setSteps(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const [editing, setEditing] = useState<DemoStepDef | null>(null);
  const [openEditor, setOpenEditor] = useState(false);

  const runStep = (st: DemoStepDef) => {
    switch (st.action) {
      case "customer": conv && addMessage(conv.id, st.payload, "customer"); break;
      case "ai": conv && addMessage(conv.id, st.payload, "ai"); break;
      case "notify": notifyOwner("Demo Flow", st.payload); break;
      case "booking": {
        const [resource, priceStr] = st.payload.split("|");
        useAppStore.getState().addBooking({ resource: resource || "ห้องตัวอย่าง", price: Number(priceStr) || 0 });
        break;
      }
      case "catalog": {
        const [title, priceStr, kw] = st.payload.split("|");
        addCatalog({ title: title || "Demo Item", price: Number(priceStr) || 0, cfKeyword: kw || "DEMO" });
        break;
      }
    }
  };

  const openNew = () => { setEditing({ id: `s${Date.now()}`, text: "", action: "customer", payload: "" }); setOpenEditor(true); };
  const openEdit = (st: DemoStepDef) => { setEditing({ ...st }); setOpenEditor(true); };
  const saveEditor = () => {
    if (!editing) return;
    const exists = steps.find((x) => x.id === editing.id);
    saveSteps(exists ? steps.map((x) => x.id === editing.id ? editing : x) : [...steps, editing]);
    setOpenEditor(false); setEditing(null);
  };
  const removeStep = (id: string) => saveSteps(steps.filter((x) => x.id !== id));

  // ===== Export =====
  const buildReport = () => {
    const inqRows = inquiries.filter((i) => inRange(i.createdAt));
    const bookRows = bookings.filter((b) => inRange(b.date || new Date().toISOString()));
    const orderRows = paidOrders.filter((o) => inRange(o.createdAt));
    const notifRows = notif.filter((n) => inRange(n.at));
    return { inqRows, bookRows, orderRows, notifRows };
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const csvEscape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportCSV = () => {
    const { inqRows, bookRows, orderRows, notifRows } = buildReport();
    const lines: string[] = [];
    lines.push(`Dashboard Report,${rangeLabel}`);
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push("");
    lines.push("Summary");
    lines.push("Metric,Current,Previous");
    lines.push(`AI Inquiries,${inqCur},${inqPrev}`);
    lines.push(`Revenue (THB),${revCur},${revPrev}`);
    lines.push(`Bookings in range,${bookingsInRange},`);
    lines.push(`Pending Bookings,${pendingBookings},`);
    lines.push(`AI Accuracy %,${correctRate.toFixed(1)},`);
    lines.push(`AI Avg Confidence %,${avgConfidence.toFixed(1)},`);
    lines.push("");
    lines.push("Inquiries");
    lines.push("id,channel,createdAt,message");
    inqRows.forEach((i: any) => lines.push([i.id, i.channel, i.createdAt, i.message ?? i.text ?? ""].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Bookings");
    lines.push("id,resource,date,status,price");
    bookRows.forEach((b: any) => lines.push([b.id, b.resource, b.date, b.status, b.price].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Orders (paid)");
    lines.push("id,amount,createdAt,customer");
    orderRows.forEach((o: any) => lines.push([o.id, o.amount, o.createdAt, o.customer ?? ""].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Owner Notifications");
    lines.push("id,channel,at,message");
    notifRows.forEach((n) => lines.push([n.id, n.channel, n.at, n.message].map(csvEscape).join(",")));
    downloadFile(`dashboard_${rangeLabel.replace(/\s+/g, "_")}.csv`, "\uFEFF" + lines.join("\n"), "text/csv;charset=utf-8");
  };

  const exportPDF = () => {
    const { inqRows, bookRows, orderRows, notifRows } = buildReport();
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
    const tableRows = (rows: any[], cols: string[]) =>
      rows.length === 0
        ? `<tr><td colspan="${cols.length}" style="text-align:center;color:#888;padding:8px">— ไม่มีข้อมูล —</td></tr>`
        : rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join("")}</tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Dashboard ${esc(rangeLabel)}</title>
<style>
body{font-family:-apple-system,Segoe UI,Tahoma,sans-serif;color:#111;margin:24px;font-size:12px}
h1{font-size:20px;margin:0 0 4px} h2{font-size:14px;margin:18px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}
.meta{color:#666;font-size:11px;margin-bottom:12px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
.card{border:1px solid #ddd;border-radius:6px;padding:8px}.card .l{color:#666;font-size:10px}.card .v{font-size:16px;font-weight:700;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-top:4px}th,td{border:1px solid #ddd;padding:5px 6px;text-align:left;font-size:11px}th{background:#f4f4f4}
@media print{.noprint{display:none}}
</style></head><body>
<h1>Dashboard Report</h1>
<div class="meta">ช่วงเวลา: ${esc(rangeLabel)} • สร้างเมื่อ ${new Date().toLocaleString("th-TH")}</div>
<div class="cards">
<div class="card"><div class="l">AI Inquiries</div><div class="v">${inqCur}</div><div class="l">ก่อนหน้า ${inqPrev}</div></div>
<div class="card"><div class="l">การจอง</div><div class="v">${bookingsInRange}</div><div class="l">รอยืนยัน ${pendingBookings}</div></div>
<div class="card"><div class="l">ยอดขาย (THB)</div><div class="v">${revCur.toLocaleString()}</div><div class="l">ก่อนหน้า ${revPrev.toLocaleString()}</div></div>
<div class="card"><div class="l">AI Accuracy</div><div class="v">${scored.length ? correctRate.toFixed(1) + "%" : "—"}</div><div class="l">conf ${avgConfidence.toFixed(1)}%</div></div>
</div>
<h2>Inquiries (${inqRows.length})</h2><table><thead><tr><th>ID</th><th>Channel</th><th>Created</th><th>Message</th></tr></thead><tbody>${tableRows(inqRows.map((i:any)=>({id:i.id,channel:i.channel,createdAt:i.createdAt,message:i.message??i.text??""})),["id","channel","createdAt","message"])}</tbody></table>
<h2>Bookings (${bookRows.length})</h2><table><thead><tr><th>ID</th><th>Resource</th><th>Date</th><th>Status</th><th>Price</th></tr></thead><tbody>${tableRows(bookRows,["id","resource","date","status","price"])}</tbody></table>
<h2>Orders – Paid (${orderRows.length})</h2><table><thead><tr><th>ID</th><th>Amount</th><th>Created</th><th>Customer</th></tr></thead><tbody>${tableRows(orderRows,["id","amount","createdAt","customer"])}</tbody></table>
<h2>Owner Notifications (${notifRows.length})</h2><table><thead><tr><th>ID</th><th>Channel</th><th>At</th><th>Message</th></tr></thead><tbody>${tableRows(notifRows,["id","channel","at","message"])}</tbody></table>
<div class="noprint" style="margin-top:18px;text-align:center"><button onclick="window.print()" style="padding:8px 16px;font-size:13px">พิมพ์ / บันทึกเป็น PDF</button></div>
<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),300));</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("กรุณาอนุญาต popup เพื่อ export PDF"); return; }
    w.document.write(html); w.document.close();
  };

  return (
    <PageContainer
      title="ภาพรวมระบบ (Dashboard)"
      description="สรุปการทำงาน AI, การจอง, ยอดขาย และการแจ้งเตือนเจ้าของแบบเรียลไทม์"
    >
      {/* Date range bar */}
      <div className="bg-surface border border-border rounded-xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">ช่วงเวลา:</span>
        {([
          { k: "today", l: "วันนี้" },
          { k: "7d", l: "7 วัน" },
          { k: "30d", l: "30 วัน" },
          { k: "custom", l: "กำหนดเอง" },
        ] as { k: RangeKey; l: string }[]).map((opt) => (
          <button
            key={opt.k}
            onClick={() => setRange(opt.k)}
            className={`px-3 py-1.5 rounded-md text-xs border transition ${range === opt.k ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
          >
            {opt.l}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-xs" />
            <span className="text-xs text-muted-foreground">ถึง</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-xs" />
          </div>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">แสดงผล: {rangeLabel}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="AI Inquiries"
          value={inqCur}
          hint={`ช่วงก่อนหน้า ${inqPrev} รายการ`}
          icon={<Sparkles className="w-4 h-4" />}
          trend={inquiries.length ? { value: fmtDelta(inqDelta, "vs ช่วงก่อน"), positive: inqDelta >= 0 } : undefined}
        />
        <MetricCard
          label="การจอง (ในช่วง)"
          value={bookingsInRange}
          hint={`รอยืนยัน ${pendingBookings} • รวมทั้งหมด ${bookings.length}`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <MetricCard
          label="ยอดขาย (ในช่วง)"
          value={fmtTHB(revCur)}
          hint={`ช่วงก่อนหน้า ${fmtTHB(revPrev)}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={paidOrders.length ? { value: fmtDelta(revDelta, "vs ช่วงก่อน"), positive: revDelta >= 0 } : undefined}
        />
        <MetricCard
          label="AI Accuracy"
          value={scored.length ? `${correctRate.toFixed(1)}%` : "—"}
          hint={scored.length ? `confidence เฉลี่ย ${avgConfidence.toFixed(1)}% • ${scored.length} ฟีดแบ็ก` : "ยังไม่มีฟีดแบ็กในช่วงนี้"}
          icon={<Brain className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Demo Flow แบบครบวงจร</h3>
              <p className="text-xs text-muted-foreground mt-1">รันสถานการณ์จำลอง — แก้ไข/เพิ่ม/ลบขั้นตอนได้</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge label="Editable" variant="primary" />
              <ActionButton size="sm" variant="primary" icon={<Plus className="w-3 h-3" />} onClick={openNew}>เพิ่มขั้นตอน</ActionButton>
            </div>
          </div>
          <div className="space-y-2">
            {steps.map((st, idx) => (
              <div key={st.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center">{idx + 1}</div>
                <div className="flex-1 text-xs">
                  <div>{st.text || <span className="text-muted-foreground italic">(ไม่มีคำอธิบาย)</span>}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">action: {st.action}</div>
                </div>
                <ActionButton size="sm" variant="primary" onClick={() => runStep(st)} icon={<Play className="w-3 h-3" />}>รัน</ActionButton>
                <button onClick={() => openEdit(st)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="แก้ไข"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeStep(st.id)} className="p-1.5 rounded hover:bg-destructive/15 text-destructive" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {steps.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-6">ยังไม่มีขั้นตอน — กด "เพิ่มขั้นตอน"</div>
            )}
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
                  <RelativeTime iso={n.at} />
                </div>
              </div>
            ))}
            {notif.length === 0 && <div className="text-xs text-muted-foreground">ยังไม่มีแจ้งเตือน</div>}
          </div>
        </div>
      </div>

      <Modal open={openEditor} onClose={() => { setOpenEditor(false); setEditing(null); }} title={editing && steps.find(x => x.id === editing.id) ? "แก้ไขขั้นตอน" : "เพิ่มขั้นตอน"}>
        {editing && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">คำอธิบาย</label>
              <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder='เช่น ลูกค้าถาม "มีห้องแบบไหนบ้าง"' />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ประเภท Action</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" value={editing.action} onChange={(e) => setEditing({ ...editing, action: e.target.value as DemoActionType })}>
                <option value="customer">customer — ส่งข้อความจากลูกค้า</option>
                <option value="ai">ai — ส่งข้อความจาก AI</option>
                <option value="notify">notify — แจ้งเตือนเจ้าของ</option>
                <option value="booking">booking — สร้างการจอง (รูปแบบ: ชื่อ|ราคา)</option>
                <option value="catalog">catalog — เพิ่มแคตาล็อก (รูปแบบ: ชื่อ|ราคา|CFKW)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ข้อมูล / ข้อความ</label>
              <textarea rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" value={editing.payload} onChange={(e) => setEditing({ ...editing, payload: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <ActionButton variant="ghost" onClick={() => { setOpenEditor(false); setEditing(null); }}>ยกเลิก</ActionButton>
              <ActionButton variant="primary" onClick={saveEditor}>บันทึก</ActionButton>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
