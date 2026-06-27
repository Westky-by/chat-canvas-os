
-- ============================================================
-- ROLES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-grant owner role to wesaa521@gmail.com if they exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::public.app_role FROM auth.users WHERE email = 'wesaa521@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger to auto-grant owner on signup for that email
CREATE OR REPLACE FUNCTION public.handle_new_user_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'wesaa521@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_owner();

-- ============================================================
-- updated_at helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text NOT NULL,
  external_id text,
  phone text,
  email text,
  tier text NOT NULL DEFAULT 'New',
  tags text[] NOT NULL DEFAULT '{}',
  note text,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel, external_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read customers" ON public.customers;
CREATE POLICY "Authenticated read customers" ON public.customers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owners manage customers" ON public.customers;
CREATE POLICY "Owners manage customers" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS customers_set_updated_at ON public.customers;
CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS customers_channel_external_idx ON public.customers (channel, external_id);
CREATE INDEX IF NOT EXISTS customers_last_activity_idx ON public.customers (last_activity DESC);

-- ============================================================
-- CUSTOMER NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read notes" ON public.customer_notes;
CREATE POLICY "Authenticated read notes" ON public.customer_notes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated insert notes" ON public.customer_notes;
CREATE POLICY "Authenticated insert notes" ON public.customer_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Authors or owners modify notes" ON public.customer_notes;
CREATE POLICY "Authors or owners modify notes" ON public.customer_notes FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'owner'));
DROP POLICY IF EXISTS "Authors or owners delete notes" ON public.customer_notes;
CREATE POLICY "Authors or owners delete notes" ON public.customer_notes FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'owner'));

CREATE INDEX IF NOT EXISTS customer_notes_customer_idx ON public.customer_notes (customer_id, created_at DESC);

-- ============================================================
-- CHAT INTEGRATIONS (server-side tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL UNIQUE,
  name text NOT NULL,
  inbound_path text NOT NULL,
  send_endpoint text NOT NULL DEFAULT '',
  raw_token text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'disconnected',
  last_sync timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_integrations TO authenticated;
GRANT ALL ON public.chat_integrations TO service_role;
ALTER TABLE public.chat_integrations ENABLE ROW LEVEL SECURITY;

-- Only owners can read raw tokens via Data API
DROP POLICY IF EXISTS "Owners manage chat integrations" ON public.chat_integrations;
CREATE POLICY "Owners manage chat integrations" ON public.chat_integrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP TRIGGER IF EXISTS chat_integrations_set_updated_at ON public.chat_integrations;
CREATE TRIGGER chat_integrations_set_updated_at BEFORE UPDATE ON public.chat_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default rows for known channels
INSERT INTO public.chat_integrations (channel_type, name, inbound_path, send_endpoint) VALUES
  ('LINE',      'LINE OA',             '/api/public/webhook/line',      'https://api.line.me/v2/bot/message/reply'),
  ('TELEGRAM',  'Telegram',            '/api/public/webhook/telegram',  ''),
  ('MESSENGER', 'Facebook Messenger',  '/api/public/webhook/messenger', 'https://graph.facebook.com/v20.0/me/messages'),
  ('INSTAGRAM', 'Instagram DM',        '/api/public/webhook/instagram', 'https://graph.facebook.com/v20.0/me/messages'),
  ('WHATSAPP',  'WhatsApp Business',   '/api/public/webhook/whatsapp',  ''),
  ('WEB',       'Website Live Chat',   '/api/public/webhook/web',       ''),
  ('CUSTOM',    'Custom Webhook',      '/api/public/webhook/custom',    '')
ON CONFLICT (channel_type) DO NOTHING;

-- ============================================================
-- AUTO-LINK inbox_messages → customers
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_customer_from_inbox()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  display_name text;
BEGIN
  display_name := COALESCE(NULLIF(NEW.user_name, ''), NEW.channel || ' ' || RIGHT(NEW.external_user_id, 6));
  INSERT INTO public.customers (name, channel, external_id, last_activity, tags)
    VALUES (display_name, NEW.channel, NEW.external_user_id, NEW.received_at, ARRAY[NEW.channel])
  ON CONFLICT (channel, external_id) DO UPDATE
    SET last_activity = EXCLUDED.last_activity,
        name = CASE WHEN public.customers.name LIKE NEW.channel || ' %' THEN EXCLUDED.name ELSE public.customers.name END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS inbox_messages_upsert_customer ON public.inbox_messages;
CREATE TRIGGER inbox_messages_upsert_customer
  AFTER INSERT ON public.inbox_messages
  FOR EACH ROW EXECUTE FUNCTION public.upsert_customer_from_inbox();

-- Backfill existing inbox messages → customers
INSERT INTO public.customers (name, channel, external_id, last_activity, tags)
SELECT
  COALESCE(NULLIF(MAX(user_name), ''), channel || ' ' || RIGHT(external_user_id, 6)) AS name,
  channel,
  external_user_id,
  MAX(received_at),
  ARRAY[channel]
FROM public.inbox_messages
GROUP BY channel, external_user_id
ON CONFLICT (channel, external_id) DO UPDATE SET last_activity = EXCLUDED.last_activity;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.customer_notes REPLICA IDENTITY FULL;
ALTER TABLE public.inbox_messages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_notes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
