import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { fmtRelative } from "@/utils/formatters";
import type { User } from "@/types";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

const allPermissions = ["inbox.read", "inbox.write", "booking.write", "product.write", "ai.train", "report.read", "payment.write", "integration.write", "webhook.test"];

export function RolePermissionManagementPage() {
  const users = useAppStore((s) => s.users);
  const roles = useAppStore((s) => s.roles);
  const togglePerm = useAppStore((s) => s.togglePermission);
  const suspend = useAppStore((s) => s.suspendUser);

  const userCols: Column<User>[] = [
    { key: "name", header: "ชื่อ" },
    { key: "email", header: "อีเมล" },
    { key: "role", header: "บทบาท", render: (r) => <StatusBadge label={roles.find((rl) => rl.id === r.roleId)?.name ?? r.roleId} variant="info" /> },
    { key: "status", header: "สถานะ", render: (r) => <StatusBadge label={r.status} variant={r.status === "active" ? "success" : r.status === "suspended" ? "danger" : "warning"} /> },
    { key: "lastLogin", header: "Login ล่าสุด", render: (r) => r.lastLogin ? fmtRelative(r.lastLogin) : "—" },
    { key: "actions", header: "Actions", render: (r) => <ActionButton size="sm" variant="danger" onClick={() => suspend(r.id)}>{r.status === "suspended" ? "ปลดระงับ" : "ระงับ"}</ActionButton> },
  ];

  return (
    <PageContainer title="Role & Permission Management" description="ผู้ใช้ บทบาท และเมทริกซ์สิทธิ์">
      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" /> Owner ลบไม่ได้ • ผู้ใช้ไม่สามารถเลื่อนสิทธิ์ตัวเอง • Raw API secrets ไม่ถูกแสดงต่อใครทั้งสิ้น
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">ผู้ใช้</h3>
        <DataTable columns={userCols} data={users} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">บทบาท</h3>
          <ActionButton variant="primary" onClick={() => toast.info("สร้าง custom role (mock)")}>สร้าง Custom Role</ActionButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="font-semibold text-sm">{r.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{r.description}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.permissions.map((p) => <StatusBadge key={p} label={p} variant="primary" />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Permission Matrix</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-[11px]">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase tracking-wider text-[10px]">Permission</th>
                {roles.map((r) => <th key={r.id} className="px-3 py-2 text-muted-foreground uppercase tracking-wider text-[10px]">{r.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((perm) => (
                <tr key={perm} className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">{perm}</td>
                  {roles.map((r) => {
                    const has = r.permissions.includes("*") || r.permissions.includes(perm);
                    return (
                      <td key={r.id} className="px-3 py-1.5 text-center">
                        <button onClick={() => togglePerm(r.id, perm)} className={`w-5 h-5 rounded ${has ? "bg-primary text-primary-foreground" : "bg-surface-elevated"}`}>{has ? "✓" : ""}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
