import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

export function AIRoutePlannerPage() {
  const routes = useAppStore((s) => s.routes);
  const calculate = useAppStore((s) => s.calculateRoute);
  const [form, setForm] = useState({ origin: "สนามบินสุวรรณภูมิ", destination: "Main Shop", mode: "drive" as "drive" | "walk" | "bike", provider: "Google Maps Routes API" });
  const last = routes[0];

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary";

  return (
    <PageContainer title="AI Route Planner" description="คำนวณเส้นทาง ETA และผูกเข้ากับการจอง">
      <div className="bg-warning/10 border border-warning/30 text-warning rounded-xl p-3 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> AI ไม่ควรเดาระยะทาง/ETA — Production ต้องใช้ Routing API จริง
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">วางแผนเส้นทาง</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-[11px] text-muted-foreground">ต้นทาง</label><input className={inp} value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
            <div><label className="text-[11px] text-muted-foreground">ปลายทาง</label><input className={inp} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
            <div><label className="text-[11px] text-muted-foreground">โหมด</label>
              <select className={inp} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "drive" | "walk" | "bike" })}><option value="drive">รถยนต์</option><option value="walk">เดิน</option><option value="bike">จักรยาน</option></select>
            </div>
            <div><label className="text-[11px] text-muted-foreground">Provider</label>
              <select className={inp} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                {["Google Maps Routes API", "openrouteservice", "OSRM Self-host", "Custom Routing API"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <ActionButton variant="primary" icon={<Navigation className="w-3 h-3" />} onClick={() => calculate(form.origin, form.destination, form.provider, form.mode)}>คำนวณเส้นทาง</ActionButton>

          {last && (
            <div className="bg-background border border-border rounded-xl p-4 mt-3">
              <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">ผลลัพธ์ล่าสุด</span></div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><div className="text-muted-foreground text-[10px]">ระยะทาง</div><div className="text-lg font-bold text-primary">{last.distanceKm} km</div></div>
                <div><div className="text-muted-foreground text-[10px]">ETA</div><div className="text-lg font-bold">{last.etaMin} นาที</div></div>
                <div><div className="text-muted-foreground text-[10px]">Provider</div><div className="text-xs mt-1.5">{last.provider}</div></div>
              </div>
              <div className="flex gap-2 mt-3">
                <ActionButton size="sm" variant="primary" onClick={() => toast.success("ผูกเข้าการจอง B001 แล้ว")}>ผูกเข้าการจอง</ActionButton>
                <ActionButton size="sm" onClick={() => toast.success("แจ้งทีมงานแล้ว")}>แจ้งทีมงาน</ActionButton>
                <ActionButton size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(`${last.distanceKm} km, ${last.etaMin} min`); toast.success("คัดลอกสรุปแล้ว"); }}>Copy</ActionButton>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">ประวัติเส้นทาง</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {routes.map((r) => (
              <div key={r.id} className="bg-background border border-border rounded-lg p-2.5 text-xs">
                <div className="font-medium truncate">{r.origin} → {r.destination}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">{r.distanceKm} km / {r.etaMin} min</span>
                  <StatusBadge label={r.provider} variant="info" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
