import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    // Trigger one-time owner seed (idempotent)
    fetch("/api/public/seed-owner", { method: "POST" }).catch(() => {});
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("เข้าสู่ระบบสำเร็จ");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("สมัครสำเร็จ — กำลังเข้าสู่ระบบ");
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) throw e2;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error((err as Error).message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Omnichannel AI Business OS</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "signin" ? "เข้าสู่ระบบ Owner / Admin" : "สมัครบัญชี Owner ใหม่"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "กำลังดำเนินการ…" : mode === "signin" ? "เข้าสู่ระบบ" : "สมัครและเข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="hover:text-teal-400">
              ยังไม่มีบัญชี? สมัครใหม่
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="hover:text-teal-400">
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </button>
          )}
        </div>




        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300">← กลับหน้าแรก</Link>
        </div>
      </div>
    </div>
  );
}
