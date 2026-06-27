import { createFileRoute } from "@tanstack/react-router";
import { OwnerNotificationsPage } from "@/components/pages/OwnerNotificationsPage";
export const Route = createFileRoute("/_app/integrations/notifications")({ component: OwnerNotificationsPage });
