import { createFileRoute } from "@tanstack/react-router";
import { CampaignAutomationPage } from "@/components/pages/CampaignAutomationPage";
export const Route = createFileRoute("/_app/campaigns")({ component: CampaignAutomationPage });
