import { createFileRoute } from "@tanstack/react-router";
import { UnifiedInboxPage } from "@/components/pages/UnifiedInboxPage";
export const Route = createFileRoute("/_app/inbox")({ component: UnifiedInboxPage });
