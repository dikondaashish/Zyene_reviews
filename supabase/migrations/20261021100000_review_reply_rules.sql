-- Reply rules by star rating, saved reply templates, designated approvers, and an approval
-- queue for AI drafts.
--
-- Rules only apply when businesses.reply_rules_enabled is TRUE. Until an owner turns them
-- on, the existing auto-reply settings (auto_reply_enabled / auto_reply_min_rating) keep
-- working exactly as before. New rules default to 'approval' (safe default: nothing is
-- posted without a person approving it). Low ratings are never reported for removal.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS reply_rules_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reply_rules_enabled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.review_reply_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4096),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, id)
);

CREATE TABLE IF NOT EXISTS public.review_reply_rules (
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  action      TEXT NOT NULL DEFAULT 'approval' CHECK (action IN ('approval', 'auto', 'template', 'ignore')),
  template_id UUID,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (business_id, rating),
  -- A rule can only point at a template of the same business.
  -- Deleting a template clears it; a 'template' rule without one falls back to approval.
  FOREIGN KEY (business_id, template_id) REFERENCES public.review_reply_templates (business_id, id) ON DELETE SET NULL (template_id)
);

CREATE TABLE IF NOT EXISTS public.review_reply_approvers (
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.review_reply_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  review_id   UUID NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
  rating      SMALLINT,
  draft_text  TEXT NOT NULL CHECK (char_length(draft_text) <= 4096),
  source      TEXT NOT NULL CHECK (source IN ('ai', 'template')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posting', 'posted', 'rejected', 'failed', 'superseded')),
  error       TEXT,
  decided_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at  TIMESTAMPTZ,
  posted_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_reply_drafts_pending ON public.review_reply_drafts (business_id, created_at DESC) WHERE status IN ('pending', 'failed');

ALTER TABLE public.review_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reply_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reply_drafts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['review_reply_templates', 'review_reply_rules', 'review_reply_approvers', 'review_reply_drafts'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (business_id IN (SELECT public.authorized_business_ids()))', t || '_member_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_backend', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t || '_backend', t);
  END LOOP;
  -- Owners / admins / managers configure rules, templates and approvers.
  FOREACH t IN ARRAY ARRAY['review_reply_templates', 'review_reply_rules', 'review_reply_approvers'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_manager_write', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (business_id IN (SELECT public.authorized_business_ids(true, true))) WITH CHECK (business_id IN (SELECT public.authorized_business_ids(true, true)))', t || '_manager_write', t);
  END LOOP;
END $$;
-- Drafts are written only by the server after its own permission checks (approver rules).
REVOKE INSERT, UPDATE, DELETE ON public.review_reply_drafts FROM anon, authenticated;
REVOKE ALL ON public.review_reply_templates, public.review_reply_rules, public.review_reply_approvers, public.review_reply_drafts FROM anon;
