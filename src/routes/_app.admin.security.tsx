import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettingsPage } from "@/components/pages/SecuritySettingsPage";
export const Route = createFileRoute("/_app/admin/security")({ component: SecuritySettingsPage });
