import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";

export const Route = createFileRoute("/_app")({
  component: () => <AppLayout />,
});

// Outlet imported above so future inline children compile.
export const _unused = Outlet;
