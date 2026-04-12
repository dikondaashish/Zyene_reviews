-- Default public review page backdrop seed matches product reference (royal blue → deep navy gradient).
-- Does not rewrite existing rows; only affects new businesses and explicit resets to default.

ALTER TABLE public.businesses
    ALTER COLUMN review_page_background_color SET DEFAULT '#1a2b5a';
