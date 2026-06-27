import { createFileRoute } from "@tanstack/react-router";
import { PaymentSlipReviewPage } from "@/components/pages/PaymentSlipReviewPage";
export const Route = createFileRoute("/_app/sales/slips")({ component: PaymentSlipReviewPage });
