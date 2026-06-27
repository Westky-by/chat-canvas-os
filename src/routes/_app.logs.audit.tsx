import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsPage } from "@/components/pages/AuditLogsPage";
export const Route = createFileRoute("/_app/logs/audit")({ component: AuditLogsPage });
