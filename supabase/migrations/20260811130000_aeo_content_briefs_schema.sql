-- apply-plan: with-code — read and written by the F6 content-brief module
--   (src/services/aeo/content-briefs/) landing in the same commit.
--
-- F6.1/F6.2/F6.4/F6.5: one row per generated brief. `target_page_url` is
-- null when no existing page owns the prompt (PRD-7's "recommend a new
-- page" edge case) — has_owning_page disambiguates that from a future
-- nullable-for-other-reasons case, so a reader never has to guess why it's
-- empty. Generated server-side only (admin client, after the calling
-- action's own authorization check) — no client INSERT policy, matching
-- every other AEO write path this phase.

CREATE TABLE public.aeo_content_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.aeo_prompts(id) ON DELETE SET NULL,
  target_page_url TEXT,
  has_owning_page BOOLEAN NOT NULL,
  edit_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_json_ld TEXT NOT NULL,
  faq_html TEXT NOT NULL,
  schema_patch_json_ld TEXT NOT NULL,
  -- True when the schema patch contains an {{...}} placeholder — the UI
  -- must disclose this, never present a patch with placeholders as ready
  -- to paste verbatim.
  schema_patch_has_placeholders BOOLEAN NOT NULL,
  -- 'low' when every cited source failed to fetch (paywalled/blocked) —
  -- PRD-7's own edge case for generating from the prompt alone.
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'low')),
  cited_source_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_content_briefs_business_created_idx ON public.aeo_content_briefs (business_id, created_at DESC);
CREATE INDEX aeo_content_briefs_prompt_idx ON public.aeo_content_briefs (prompt_id);

ALTER TABLE public.aeo_content_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY aeo_content_briefs_select_own_org
  ON public.aeo_content_briefs FOR SELECT
  USING (business_id IN (
    SELECT id FROM public.businesses
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));
