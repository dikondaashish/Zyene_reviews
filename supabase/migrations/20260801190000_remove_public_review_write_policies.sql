-- Public review flows write through validated server routes using the service role.
-- Direct anonymous table writes bypass those validation and rate-limit boundaries.

DROP POLICY IF EXISTS review_requests_anon_insert ON public.review_requests;
DROP POLICY IF EXISTS review_requests_anon_update ON public.review_requests;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.private_feedback;

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_feedback ENABLE ROW LEVEL SECURITY;
