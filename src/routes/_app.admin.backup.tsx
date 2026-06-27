import { createFileRoute } from "@tanstack/react-router";
import { BackupExportPage } from "@/components/pages/BackupExportPage";
export const Route = createFileRoute("/_app/admin/backup")({ component: BackupExportPage });
