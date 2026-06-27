import { createFileRoute } from "@tanstack/react-router";
import { AIInquiryInboxPage } from "@/components/pages/AIInquiryInboxPage";
export const Route = createFileRoute("/_app/ai/inquiries")({ component: AIInquiryInboxPage });
