import { createFileRoute } from "@tanstack/react-router";
import { AIProvidersPage } from "@/components/pages/AIProvidersPage";
export const Route = createFileRoute("/_app/integrations/ai")({ component: AIProvidersPage });
