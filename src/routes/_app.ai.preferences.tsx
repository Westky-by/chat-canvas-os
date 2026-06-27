import { createFileRoute } from "@tanstack/react-router";
import { CustomerPreferencesPage } from "@/components/pages/CustomerPreferencesPage";
export const Route = createFileRoute("/_app/ai/preferences")({ component: CustomerPreferencesPage });
