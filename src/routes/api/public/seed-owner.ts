import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-owner")({
  server: {
    handlers: {
      POST: async () => {
        const email = process.env.OWNER_SEED_EMAIL;
        const password = process.env.OWNER_SEED_PASSWORD;
        if (!email || !password) {
          return new Response(JSON.stringify({ ok: false, error: "missing env" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // Idempotent: list users, skip if exists
          const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
          const exists = list?.users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (exists) {
            return new Response(JSON.stringify({ ok: true, status: "exists" }), {
              headers: { "content-type": "application/json" },
            });
          }
          const { error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: "owner", seeded: true },
          });
          if (error) throw error;
          return new Response(JSON.stringify({ ok: true, status: "created" }), {
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
