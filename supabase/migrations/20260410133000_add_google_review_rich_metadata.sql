-- Rich Google review metadata for UI parity with Google's review panel.
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS review_photo_urls TEXT[] NULL,
ADD COLUMN IF NOT EXISTS google_attribute_chips TEXT[] NULL,
ADD COLUMN IF NOT EXISTS google_place_context TEXT[] NULL;

