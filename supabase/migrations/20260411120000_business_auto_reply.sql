-- Auto-reply to new Google reviews (high ratings) using AI + GBP reply API
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS auto_reply_min_rating INT NOT NULL DEFAULT 4
  CHECK (auto_reply_min_rating IN (3, 4, 5));

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS auto_reply_tone VARCHAR(20) NOT NULL DEFAULT 'professional'
  CHECK (auto_reply_tone IN ('professional', 'friendly', 'concise'));

COMMENT ON COLUMN public.businesses.auto_reply_enabled IS 'When true, eligible new Google reviews get an AI draft posted automatically.';
COMMENT ON COLUMN public.businesses.auto_reply_min_rating IS 'Minimum star rating (3–5). 3 = 3★ and up, 4 = 4★ and up, 5 = 5★ only.';
COMMENT ON COLUMN public.businesses.auto_reply_tone IS 'Tone for auto-generated replies: professional | friendly | concise.';
