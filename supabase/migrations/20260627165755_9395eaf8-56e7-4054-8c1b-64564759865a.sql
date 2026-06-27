ALTER TABLE public.inbox_messages
  ADD COLUMN IF NOT EXISTS sender text NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'received';

UPDATE public.inbox_messages
SET sender = 'customer'
WHERE sender IS NULL OR sender = '';

GRANT SELECT ON public.inbox_messages TO authenticated;
GRANT ALL ON public.inbox_messages TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inbox_messages_sender_check'
  ) THEN
    ALTER TABLE public.inbox_messages
      ADD CONSTRAINT inbox_messages_sender_check CHECK (sender IN ('customer', 'ai', 'admin', 'system'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inbox_messages_delivery_status_check'
  ) THEN
    ALTER TABLE public.inbox_messages
      ADD CONSTRAINT inbox_messages_delivery_status_check CHECK (delivery_status IN ('received', 'sent', 'failed', 'skipped'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS inbox_messages_thread_time_idx
  ON public.inbox_messages (channel, external_user_id, received_at, created_at);