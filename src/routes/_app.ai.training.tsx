import { createFileRoute } from "@tanstack/react-router";
import { AITrainingCenterPage } from "@/components/pages/AITrainingCenterPage";
export const Route = createFileRoute("/_app/ai/training")({ component: AITrainingCenterPage });
