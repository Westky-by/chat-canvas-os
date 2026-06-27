import { createFileRoute } from "@tanstack/react-router";
import { OrdersPaymentsPage } from "@/components/pages/OrdersPaymentsPage";
export const Route = createFileRoute("/_app/sales/orders")({ component: OrdersPaymentsPage });
