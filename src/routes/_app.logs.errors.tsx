import { createFileRoute } from "@tanstack/react-router";
import { ErrorLogsPage } from "@/components/pages/ErrorLogsPage";
export const Route = createFileRoute("/_app/logs/errors")({ component: ErrorLogsPage });
