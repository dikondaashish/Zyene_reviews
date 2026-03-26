-- Phase 2: Google Q&A + Place Action Links

CREATE TABLE IF NOT EXISTS public.gbp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_platform_id UUID NOT NULL REFERENCES public.review_platforms(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_question_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  author_display_name TEXT,
  author_type TEXT,
  upvote_count INT NOT NULL DEFAULT 0,
  google_create_time TIMESTAMPTZ,
  google_update_time TIMESTAMPTZ,
  total_answer_count INT NOT NULL DEFAULT 0,
  has_merchant_answer BOOLEAN NOT NULL DEFAULT FALSE,
  top_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_platform_id, google_question_name)
);

CREATE INDEX IF NOT EXISTS idx_gbp_questions_business_unanswered
  ON public.gbp_questions (business_id)
  WHERE has_merchant_answer = FALSE;

CREATE INDEX IF NOT EXISTS idx_gbp_questions_business_updated
  ON public.gbp_questions (business_id, google_update_time DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS public.gbp_place_action_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_platform_id UUID NOT NULL REFERENCES public.review_platforms(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_link_name TEXT NOT NULL,
  place_action_type TEXT NOT NULL,
  uri TEXT NOT NULL,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  is_broken BOOLEAN NOT NULL DEFAULT FALSE,
  last_link_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_platform_id, google_link_name)
);

CREATE INDEX IF NOT EXISTS idx_gbp_place_actions_business
  ON public.gbp_place_action_links (business_id);

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_qa_synced_at TIMESTAMPTZ;

ALTER TABLE public.review_platforms
  ADD COLUMN IF NOT EXISTS google_place_actions_synced_at TIMESTAMPTZ;

ALTER TABLE public.gbp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gbp_place_action_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gbp_questions_select_own_org"
  ON public.gbp_questions FOR SELECT
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b
      INNER JOIN public.organization_members om ON om.organization_id = b.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

CREATE POLICY "gbp_place_action_links_select_own_org"
  ON public.gbp_place_action_links FOR SELECT
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b
      INNER JOIN public.organization_members om ON om.organization_id = b.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

COMMENT ON TABLE public.gbp_questions IS 'Google Business Profile Q&A questions (My Business Q&A API)';
COMMENT ON TABLE public.gbp_place_action_links IS 'Google Place Action Links (order online, appointments, etc.)';
