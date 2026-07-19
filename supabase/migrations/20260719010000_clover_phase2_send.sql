-- Clover Phase 2: allow pos_clover sends + expand payment event statuses

ALTER TABLE public.review_requests
  DROP CONSTRAINT IF EXISTS review_requests_trigger_source_check;
ALTER TABLE public.review_requests
  ADD CONSTRAINT review_requests_trigger_source_check
  CHECK (trigger_source IN (
    'manual', 'campaign', 'pos_square', 'zapier', 'public_link', 'pos_clover'
  ));

ALTER TABLE clover_payment_events
  DROP CONSTRAINT IF EXISTS clover_payment_events_status_check;
ALTER TABLE clover_payment_events
  ADD CONSTRAINT clover_payment_events_status_check
  CHECK (status IN (
    'received',
    'resolved',
    'skipped_no_contact',
    'skipped_disabled',
    'skipped_guard',
    'sent',
    'send_failed',
    'error'
  ));

ALTER TABLE clover_payment_events
  ADD COLUMN IF NOT EXISTS review_request_id UUID
    REFERENCES review_requests(id) ON DELETE SET NULL;
