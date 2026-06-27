import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { toast } from "sonner";
import { Lock, Shield } from "lucide-react";

export function LoginPreviewPage() {
  const [form, setForm] = useState({ email: "owner@shop.local", password: "", remember: true });
  const input = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";

  return (
    <PageContainer title="พรีวิวหน้าล็อกอิน (Login Portal Preview)" description="หน้าจอที่ผู้ใช้และทีมจะเห็นเมื่อเข้าสู่ระบบ">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-2xl p-8 shadow-2xl mt-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">เข้าสู่ระบบ AI Business OS</h2>
          <p className="text-xs text-muted-foreground mt-1">Workspace: Main Shop</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">อีเมล</label>
            <input className={input + " mt-1"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">รหัสผ่าน</label>
            <input type="password" className={input + " mt-1"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> จดจำฉัน</label>
            <button className="text-primary hover:underline" onClick={() => toast.info("ส่งลิงก์รีเซ็ตรหัสผ่าน (mock)")}>ลืมรหัสผ่าน?</button>
          </div>
          <ActionButton variant="primary" className="w-full justify-center py-2.5" onClick={() => toast.success("เข้าสู่ระบบ (mock) - ต้องผ่าน 2FA")}>เข้าสู่ระบบ</ActionButton>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 text-success" />
              <div>
                <div className="font-medium text-foreground">2FA Preview</div>
                เมื่อกดเข้าสู่ระบบ ระบบจะส่ง OTP ไปยังอีเมลและ LINE ที่ลงทะเบียน — เปิดใช้งานในหน้า Security Settings
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
