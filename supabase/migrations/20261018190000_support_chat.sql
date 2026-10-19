-- apply-plan: with-code — the website chat degrades gracefully (no history, feedback or takeover) until applied; safe to apply before or after deploy.
--
-- Website chat (Natalie): anonymous conversations, per-reply feedback, captured
-- leads, and Slack live-takeover state. Visitors never touch these tables
-- directly; every read and write goes through server routes using the service role.
-- No IP address or user agent is stored. Rows older than 180 days are purged by
-- the weekly report job.

CREATE TABLE public.support_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Random per-browser id generated client-side; not linked to any account.
  session_id text NOT NULL UNIQUE CHECK (session_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  first_page_path text,
  lead_name text,
  lead_email text,
  -- Slack thread that mirrors this conversation once a lead or handoff happens.
  slack_channel_id text,
  slack_thread_ts text,
  -- Set when a team member replies in Slack; the AI stays quiet until it lapses.
  human_agent_name text,
  human_takeover_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX support_chat_conversations_slack_thread_idx
  ON public.support_chat_conversations (slack_channel_id, slack_thread_ts)
  WHERE slack_thread_ts IS NOT NULL;
CREATE INDEX support_chat_conversations_last_message_idx
  ON public.support_chat_conversations (last_message_at);

CREATE TABLE public.support_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.support_chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'agent')),
  content text NOT NULL CHECK (char_length(content) <= 4000),
  intent text CHECK (intent IN ('answer', 'handoff', 'off_topic')),
  -- False when Natalie said the knowledge did not cover the question.
  answered boolean,
  agent_name text,
  -- 1 = thumbs up, -1 = thumbs down, set by the visitor on assistant replies.
  feedback smallint CHECK (feedback IN (-1, 1)),
  feedback_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX support_chat_messages_conversation_idx
  ON public.support_chat_messages (conversation_id, created_at);
CREATE INDEX support_chat_messages_report_idx
  ON public.support_chat_messages (created_at)
  WHERE role = 'assistant' AND (answered = false OR feedback = -1);

CREATE TABLE public.support_chat_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.support_chat_conversations(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_type text,
  reason text NOT NULL CHECK (reason IN ('question_limit', 'human_request', 'demo_booking')),
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX support_chat_leads_created_idx ON public.support_chat_leads (created_at);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['support_chat_conversations', 'support_chat_messages', 'support_chat_leads'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_backend', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      t || '_no_client_access', t);
  END LOOP;
END $$;
