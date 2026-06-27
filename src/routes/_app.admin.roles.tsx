import { createFileRoute } from "@tanstack/react-router";
import { RolePermissionManagementPage } from "@/components/pages/RolePermissionManagementPage";
export const Route = createFileRoute("/_app/admin/roles")({ component: RolePermissionManagementPage });
