import { createFileRoute } from "@tanstack/react-router";
import { BookingManagerPage } from "@/components/pages/BookingManagerPage";
export const Route = createFileRoute("/_app/sales/bookings")({ component: BookingManagerPage });
