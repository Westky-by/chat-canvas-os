CREATE TABLE public.inbox_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  user_name TEXT,
  text TEXT NOT NULL DEFAULT '',
  raw JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inbox_messages TO authenticated;
GRANT ALL ON public.inbox_messages TO service_role;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read inbox" ON public.inbox_messages FOR SELECT TO authenticated USING (true);
CREATE INDEX inbox_messages_received_at_idx ON public.inbox_messages (received_at DESC);
CREATE INDEX inbox_messages_channel_idx ON public.inbox_messages (channel);