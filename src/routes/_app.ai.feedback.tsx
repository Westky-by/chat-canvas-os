import { createFileRoute } from "@tanstack/react-router";
import { AIFeedbackCorrectionsPage } from "@/components/pages/AIFeedbackCorrectionsPage";
export const Route = createFileRoute("/_app/ai/feedback")({ component: AIFeedbackCorrectionsPage });
