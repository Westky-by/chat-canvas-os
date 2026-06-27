import { Link, useRouterState } from "@tanstack/react-router";
import {
  Cpu, LayoutDashboard, Inbox, Users, Settings, UserPlus, LogIn,
  Sparkles, ImageIcon, FileText, BookOpen, MessageSquareWarning, Heart,
  Calendar, Package, ShoppingCart, Receipt, Megaphone, Map,
  Plug, MessageCircle, Webhook, Bell, KeyRound, ShieldCheck, Shield,
  HardDrive, Activity, BarChart3, AlertTriangle, ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/inbox", label: "Unified Inbox", icon: Inbox },
      { to: "/crm", label: "CRM", icon: Users },
    ],
  },
  {
    title: "Setup & Onboarding",
    items: [
      { to: "/setup/workspace", label: "Workspace Setup", icon: Settings },
      { to: "/setup/invite", label: "Invite Team Member", icon: UserPlus },
      { to: "/setup/login-preview", label: "Login Portal Preview", icon: LogIn },
    ],
  },
  {
    title: "AI Operations",
    items: [
      { to: "/ai/inquiries", label: "AI Inquiry Inbox", icon: Sparkles },
      { to: "/ai/visual-catalog", label: "Visual Catalog", icon: ImageIcon },
      { to: "/ai/knowledge-files", label: "File & Image Knowledge", icon: FileText },
      { to: "/ai/training", label: "AI Training Center", icon: BookOpen },
      { to: "/ai/feedback", label: "AI Feedback & Corrections", icon: MessageSquareWarning },
      { to: "/ai/preferences", label: "Customer Preferences", icon: Heart },
    ],
  },
  {
    title: "Sales & Booking",
    items: [
      { to: "/sales/bookings", label: "Booking Manager", icon: Calendar },
      { to: "/sales/products", label: "Product & Stock", icon: Package },
      { to: "/sales/orders", label: "Orders & Payments", icon: ShoppingCart },
      { to: "/sales/slips", label: "Payment Slip Review", icon: Receipt },
    ],
  },
  {
    title: "Campaign Automation",
    items: [{ to: "/campaigns", label: "Campaign Automation", icon: Megaphone }],
  },
  {
    title: "AI Route Planner",
    items: [{ to: "/route-planner", label: "AI Route Planner", icon: Map }],
  },
  {
    title: "Integrations",
    items: [
      { to: "/integrations/ai", label: "AI API Providers", icon: Plug },
      { to: "/integrations/chat", label: "Chat API Integrations", icon: MessageCircle },
      { to: "/integrations/webhook", label: "Webhook Tester", icon: Webhook },
      { to: "/integrations/notifications", label: "Owner Notifications", icon: Bell },
    ],
  },
  {
    title: "Admin & Security",
    items: [
      { to: "/admin/secrets", label: "Settings & Secrets Vault", icon: KeyRound },
      { to: "/admin/roles", label: "Role & Permission Management", icon: ShieldCheck },
      { to: "/admin/security", label: "Security Settings", icon: Shield },
      { to: "/admin/backup", label: "Backup & Export", icon: HardDrive },
    ],
  },
  {
    title: "Logs & Reports",
    items: [
      { to: "/logs/audit", label: "Audit Logs", icon: Activity },
      { to: "/logs/usage", label: "Usage Logs", icon: BarChart3 },
      { to: "/logs/errors", label: "Error Logs", icon: AlertTriangle },
    ],
  },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="w-72 bg-surface border-r border-border flex flex-col h-full overflow-hidden flex-shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-sm">AI Business OS</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
              Workspace: Main Shop
            </p>
          </div>
        </div>
        <button
          className="p-1.5 hover:bg-surface-hover rounded-lg text-muted-foreground transition"
          onClick={() => toast.success("สลับเวิร์กสเปซสำเร็จ")}
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
              {g.title}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition ${
                      active
                        ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                        : "text-foreground/70 hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
