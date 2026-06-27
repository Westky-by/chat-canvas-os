import { createFileRoute } from "@tanstack/react-router";
import { WebhookTesterPage } from "@/components/pages/WebhookTesterPage";
export const Route = createFileRoute("/_app/integrations/webhook")({ component: WebhookTesterPage });
