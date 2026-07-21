-- Claim lock so payment.created + payment.updated cannot both send.

ALTER TABLE square_payment_events
  DROP CONSTRAINT IF EXISTS square_payment_events_status_check;
ALTER TABLE square_payment_events
  ADD CONSTRAINT square_payment_events_status_check
  CHECK (status IN (
    'received',
    'sending',
    'resolved',
    'skipped_no_contact',
    'skipped_disabled',
    'skipped_guard',
    'sent',
    'send_failed',
    'error'
  ));
