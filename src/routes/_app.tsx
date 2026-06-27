import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: Gate,
});

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        กำลังตรวจสอบสิทธิ์…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return <AppLayout />;
}
