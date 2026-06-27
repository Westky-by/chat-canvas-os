import { Bell, Search, HelpCircle, User, LogOut } from "lucide-react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";


export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const title = labelFor(pathname);

  async function handleLogout() {
    await signOut();
    toast.success("ออกจากระบบแล้ว");
    navigate({ to: "/auth" });
  }




  return (
    <header className="h-14 border-b border-border bg-surface/60 backdrop-blur flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-[11px] text-muted-foreground">โหมดทดสอบ Mock Data • ไม่มีการเรียก API จริง</p>
      </div>
      <div className="relative max-w-xs hidden md:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="ค้นหา (mock)…"
          className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs w-64 focus:outline-none focus:border-primary"
        />
      </div>
      <button onClick={handleReset} className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground" title="รีเซ็ตข้อมูลทั้งหมดเป็นค่าเริ่มต้น"><RotateCcw className="w-4 h-4" /></button>
      <button className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground"><HelpCircle className="w-4 h-4" /></button>
      <button className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
      </button>
      <div className="flex items-center gap-2 pl-3 border-l border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="text-xs">
          <div className="font-medium">Owner</div>
          <div className="text-muted-foreground text-[10px]">{user?.email ?? "—"}</div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 p-2 hover:bg-surface-hover rounded-lg text-muted-foreground"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}


function labelFor(path: string): string {
  const map: Record<string, string> = {
    "/": "Dashboard",
    "/inbox": "Unified Inbox",
    "/crm": "CRM",
    "/setup/workspace": "Workspace Setup",
    "/setup/invite": "Invite Team Member",
    "/setup/login-preview": "Login Portal Preview",
    "/ai/inquiries": "AI Inquiry Inbox",
    "/ai/visual-catalog": "Visual Catalog",
    "/ai/knowledge-files": "File & Image Knowledge",
    "/ai/training": "AI Training Center",
    "/ai/feedback": "AI Feedback & Corrections",
    "/ai/preferences": "Customer Preferences",
    "/sales/bookings": "Booking Manager",
    "/sales/products": "Product & Stock",
    "/sales/orders": "Orders & Payments",
    "/sales/slips": "Payment Slip Review",
    "/campaigns": "Campaign Automation",
    "/route-planner": "AI Route Planner",
    "/integrations/ai": "AI API Providers",
    "/integrations/chat": "Chat API Integrations",
    "/integrations/webhook": "Webhook Tester",
    "/integrations/notifications": "Owner Notifications",
    "/admin/secrets": "Settings & Secrets Vault",
    "/admin/roles": "Role & Permission Management",
    "/admin/security": "Security Settings",
    "/admin/backup": "Backup & Export",
    "/logs/audit": "Audit Logs",
    "/logs/usage": "Usage Logs",
    "/logs/errors": "Error Logs",
  };
  return map[path] ?? "AI Business OS";
}
