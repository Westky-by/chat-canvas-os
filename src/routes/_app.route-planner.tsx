import { createFileRoute } from "@tanstack/react-router";
import { AIRoutePlannerPage } from "@/components/pages/AIRoutePlannerPage";
export const Route = createFileRoute("/_app/route-planner")({ component: AIRoutePlannerPage });
