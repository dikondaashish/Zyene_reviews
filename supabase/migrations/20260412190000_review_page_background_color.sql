-- Public /r/[slug] page backdrop (behind the white review card)
ALTER TABLE public.businesses
    ADD COLUMN IF NOT EXISTS review_page_background_color text NOT NULL DEFAULT '#0f172a';

ALTER TABLE public.businesses
    DROP CONSTRAINT IF EXISTS businesses_review_page_background_color_check;
ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_review_page_background_color_check
    CHECK (review_page_background_color ~* '^#([0-9A-F]{3}|[0-9A-F]{6})$');
