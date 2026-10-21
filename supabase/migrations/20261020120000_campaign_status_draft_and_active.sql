-- Campaign status lifecycle fixes.
--
-- 1. 20260304202800_audit_schema_fixes.sql re-created campaigns_status_check without 'draft',
--    so "Save as draft" in the campaign builder violated the constraint. Restore 'draft' and
--    allow 'archived' (both accepted by the API schema).
-- 2. Sends used to flip campaigns to 'processing' and nothing set them back, so the follow-up
--    cron (which only reads 'active') never ran their reminders. Sends no longer do this;
--    move stuck campaigns back to 'active'. 'processing' stays valid for legacy reads.

ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'processing', 'completed', 'archived'));

UPDATE public.campaigns SET status = 'active' WHERE status = 'processing';
