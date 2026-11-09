-- apply-plan: with-code — apply BEFORE (or with) the deploy that ships
-- prompt-enrollment-history.ts: the hourly aeo-run-scheduler filters on
-- businesses.aeo_prompt_choice_at and the enrollment worker reads it. Until it
-- is applied the scheduler skips default enrollment (it does not fail the run
-- fan-out).
--
-- Durable "the owner has made an AEO prompt choice" marker. Default prompt
-- auto-enrollment must never restart paid sampling an owner switched off, and
-- the old signals could not express that: a hard-deleted manual prompt left no
-- row behind, and the enrollment worker's own half-written suggestions looked
-- the same as an owner's library. The trigger stamps the business once, on the
-- first owner-visible change: a prompt that is not an inert suggestion is
-- inserted, any prompt is switched on or off, or any prompt is deleted. Inert
-- suggestion inserts (source 'suggested', inactive) do not count, so a retried
-- enrollment can still finish. The worker's own successful activation stamps
-- it too, which makes enrollment one-time.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS aeo_prompt_choice_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.mark_aeo_prompt_choice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_business_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_business_id := OLD.business_id;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.source = 'suggested' AND NOT NEW.is_active THEN
      RETURN NULL;
    END IF;
    v_business_id := NEW.business_id;
  ELSE
    IF NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN
      RETURN NULL;
    END IF;
    v_business_id := NEW.business_id;
  END IF;

  UPDATE public.businesses
  SET aeo_prompt_choice_at = now()
  WHERE id = v_business_id
    AND aeo_prompt_choice_at IS NULL;
  RETURN NULL;
END;
$fn$;

REVOKE ALL ON FUNCTION public.mark_aeo_prompt_choice()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS mark_aeo_prompt_choice ON public.aeo_prompts;
CREATE TRIGGER mark_aeo_prompt_choice
  AFTER INSERT OR DELETE OR UPDATE OF is_active ON public.aeo_prompts
  FOR EACH ROW EXECUTE FUNCTION public.mark_aeo_prompt_choice();

-- Backfill: any business that already has a library, a past run, or clusters
-- left behind by deleted prompts has made a choice. Conservative on purpose:
-- wrongly skipping enrollment costs the owner nothing; wrongly enrolling
-- restarts paid sampling.
UPDATE public.businesses b
SET aeo_prompt_choice_at = now()
WHERE b.aeo_prompt_choice_at IS NULL
  AND (
    EXISTS (SELECT 1 FROM public.aeo_prompts p WHERE p.business_id = b.id)
    OR EXISTS (SELECT 1 FROM public.aeo_prompt_clusters c WHERE c.business_id = b.id)
    OR EXISTS (SELECT 1 FROM public.aeo_runs r WHERE r.business_id = b.id)
  );

-- The scheduler reads only businesses that still have no choice.
CREATE INDEX IF NOT EXISTS idx_businesses_aeo_prompt_choice_pending
  ON public.businesses (organization_id, id)
  WHERE aeo_prompt_choice_at IS NULL;
