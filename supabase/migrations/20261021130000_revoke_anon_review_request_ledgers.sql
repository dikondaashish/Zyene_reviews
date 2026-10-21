-- Defence in depth: logged-out (anon) clients have no business reading the review-request
-- message ledger or email unsubscribes. RLS already returns no rows for anon (no policy);
-- this also removes the table privilege, matching the other automation tables.
REVOKE ALL ON public.review_request_messages, public.review_request_email_unsubscribes FROM anon;
