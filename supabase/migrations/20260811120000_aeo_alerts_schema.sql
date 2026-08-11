-- apply-plan: with-code — read and written by the F8 alerting module
--   (src/services/aeo/alerting/) landing in the same commit.
--
-- F8: alerts, gated by the significance test in significance.ts (F8.8).
-- `prompt_id`/`engine_id` are set for visibility alerts, null for technical
-- and run-failure alerts (business-wide, not tied to one prompt).
--
-- `digest_sent_at` and `muted_at` are the two states PRD-9's edge cases need:
-- an alert is created the moment it's detected (so nothing is lost if the
-- digest send fails), and is included in exactly one digest — the cron marks
-- digest_sent_at right after a successful send, never before.

CREATE TABLE public.aeo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'visibility_drop', 'visibility_gain', 'technical_blocker', 'run_failure'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  -- Set only for visibility_drop/visibility_gain; null (site-wide) for the others.
  prompt_id UUID REFERENCES public.aeo_prompts(id) ON DELETE SET NULL,
  engine_id TEXT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  -- p-value, sample sizes, rates — the "evidence link" PRD-9's output spec requires.
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  digest_sent_at TIMESTAMPTZ,
  muted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aeo_alerts_business_created_idx ON public.aeo_alerts (business_id, created_at DESC);
-- Cooldown / dedup lookups: "has this exact alert fired recently".
CREATE INDEX aeo_alerts_dedup_idx ON public.aeo_alerts (business_id, alert_type, prompt_id, engine_id, created_at DESC);
-- Digest fan-out: "what's unsent for this business right now".
CREATE INDEX aeo_alerts_undigested_idx ON public.aeo_alerts (business_id) WHERE digest_sent_at IS NULL;

ALTER TABLE public.aeo_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY aeo_alerts_select_own_org
  ON public.aeo_alerts FOR SELECT
  USING (business_id IN (
    SELECT id FROM public.businesses
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

-- No blanket UPDATE policy: a client-writable USING/WITH CHECK scoped only by
-- business_id would let any org member PATCH title/severity/evidence, not
-- just mute — the narrow RPC below is the only write surface a signed-in
-- user gets, matching this repo's SECURITY DEFINER hardening pattern
-- (search_path pinned, EXECUTE revoked from PUBLIC/anon).
CREATE OR REPLACE FUNCTION public.mute_aeo_alert(p_alert_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.aeo_alerts
  SET muted_at = now()
  WHERE id = p_alert_id
    AND business_id IN (
      SELECT id FROM public.businesses
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    );
END;
$$;

REVOKE ALL ON FUNCTION public.mute_aeo_alert(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mute_aeo_alert(UUID) TO authenticated;
