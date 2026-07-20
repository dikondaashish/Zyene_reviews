-- Square Phase 2: expand payment event statuses + link to review_requests
-- trigger_source pos_square already allowed via clover Phase 2 migration.

ALTER TABLE square_payment_events
  DROP CONSTRAINT IF EXISTS square_payment_events_status_check;
ALTER TABLE square_payment_events
  ADD CONSTRAINT square_payment_events_status_check
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

ALTER TABLE square_payment_events
  ADD COLUMN IF NOT EXISTS review_request_id UUID
    REFERENCES review_requests(id) ON DELETE SET NULL;
