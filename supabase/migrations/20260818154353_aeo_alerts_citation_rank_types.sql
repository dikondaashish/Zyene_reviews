-- F8.2 (citation gained/lost per URL) and F8.3 (rank movement) alert types.
--
-- 20260811120000_aeo_alerts_schema.sql shipped four alert types covering F8.1
-- and F8.4. F8.2 and F8.3 are Phase 1 scope under PRD-9 and had no type to be
-- stored as, so the detectors could not be written until this constraint was
-- widened.
--
-- Three new values, not two: a lost citation and a gained citation carry
-- opposite severities and opposite recommended actions, so collapsing them into
-- one "citation_changed" type would make the cooldown window suppress a
-- recovery notice because a loss had just fired.
--
-- `page_url` is added because a citation alert is ABOUT a URL. The existing
-- prompt_id/engine_id columns cannot identify it, and the dedup index keys on
-- those columns — without a URL column, two different pages losing citations in
-- the same window would collide and the second would be silently swallowed.

ALTER TABLE public.aeo_alerts
  DROP CONSTRAINT IF EXISTS aeo_alerts_alert_type_check;

ALTER TABLE public.aeo_alerts
  ADD CONSTRAINT aeo_alerts_alert_type_check CHECK (alert_type IN (
    'visibility_drop', 'visibility_gain', 'technical_blocker', 'run_failure',
    'citation_lost', 'citation_gained', 'rank_drop'
  ));

-- Null for every alert type that is not about one page.
ALTER TABLE public.aeo_alerts
  ADD COLUMN IF NOT EXISTS page_url TEXT;

-- Mirrors aeo_alerts_dedup_idx, extended with page_url so per-URL citation
-- alerts dedup per URL rather than per business.
DROP INDEX IF EXISTS aeo_alerts_dedup_idx;
CREATE INDEX aeo_alerts_dedup_idx
  ON public.aeo_alerts (business_id, alert_type, prompt_id, engine_id, page_url, created_at DESC);
