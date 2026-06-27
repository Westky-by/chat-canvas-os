import { createFileRoute } from "@tanstack/react-router";
import { UsageLogsPage } from "@/components/pages/UsageLogsPage";
export const Route = createFileRoute("/_app/logs/usage")({ component: UsageLogsPage });
