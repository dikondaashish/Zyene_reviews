-- Keep campaigns.total_* counters in sync with review_requests.
--
-- Nothing in app code ever incremented these columns, so every campaign list/funnel showed 0.
-- Counts are recomputed from review_requests (self-correcting, idempotent) whenever a campaign
-- request is inserted, deleted, or changes a funnel field. Funnel stages are cumulative:
-- a click implies an open, a completion implies a click.

CREATE OR REPLACE FUNCTION public.refresh_campaign_stats(p_campaign_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.campaigns c
  SET
    total_sent      = s.sent,
    total_opened    = s.opened,
    total_clicked   = s.clicked,
    total_completed = s.completed,
    updated_at      = now()
  FROM (
    SELECT
      count(*) FILTER (WHERE rr.sent_at IS NOT NULL)::int AS sent,
      count(*) FILTER (WHERE rr.opened_at IS NOT NULL OR rr.clicked_at IS NOT NULL
                          OR rr.completed_at IS NOT NULL)::int AS opened,
      count(*) FILTER (WHERE rr.clicked_at IS NOT NULL OR rr.completed_at IS NOT NULL)::int AS clicked,
      count(*) FILTER (WHERE rr.completed_at IS NOT NULL OR rr.review_left IS TRUE
                          OR rr.status IN ('completed', 'review_left', 'feedback_left',
                                           'rated_positive', 'rated_negative'))::int AS completed
    FROM public.review_requests rr
    WHERE rr.campaign_id = p_campaign_id
  ) s
  WHERE c.id = p_campaign_id;
$$;

REVOKE ALL ON FUNCTION public.refresh_campaign_stats(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.review_requests_refresh_campaign_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.campaign_id IS NOT NULL THEN
    PERFORM public.refresh_campaign_stats(OLD.campaign_id);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.campaign_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.campaign_id IS DISTINCT FROM OLD.campaign_id) THEN
    PERFORM public.refresh_campaign_stats(NEW.campaign_id);
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.review_requests_refresh_campaign_stats() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS review_requests_campaign_stats ON public.review_requests;
CREATE TRIGGER review_requests_campaign_stats
  AFTER INSERT OR DELETE OR UPDATE OF campaign_id, status, sent_at, opened_at, clicked_at, completed_at, review_left
  ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.review_requests_refresh_campaign_stats();

-- Backfill existing campaigns.
SELECT public.refresh_campaign_stats(id) FROM public.campaigns;
