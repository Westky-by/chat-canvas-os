import { createFileRoute } from "@tanstack/react-router";
import { ChatIntegrationsPage } from "@/components/pages/ChatIntegrationsPage";
export const Route = createFileRoute("/_app/integrations/chat")({ component: ChatIntegrationsPage });
