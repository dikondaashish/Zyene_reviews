-- Review-automation migrations: data repair, counters, constraints and tenant isolation.
-- Business A = 30..01 (owner 20..01, manager 20..02, viewer 20..03); Business B = 30..02 (owner 20..04).

-- 1. Status repair + draft/archived ------------------------------------------------------
SELECT test.assert_true((SELECT status FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = 'active',
  'stuck processing campaign repaired to active');
SELECT test.assert_true((SELECT status FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000002') = 'paused',
  'paused campaign untouched by repair');
INSERT INTO public.campaigns (business_id, status) VALUES ('30000000-0000-4000-8000-000000000001', 'draft'), ('30000000-0000-4000-8000-000000000001', 'archived');
-- Repair changes no historical send facts.
SELECT test.assert_true((SELECT count(*) FROM public.review_requests WHERE sent_at IS NOT NULL) = 2, 'repair did not touch sent facts');

-- 2. Backfilled counters: 2 sent, 1 clicked (failed request is not counted as sent) ------
SELECT test.assert_true((SELECT total_sent = 2 AND total_clicked = 1 AND total_opened = 1 AND total_completed = 0 AND total_reviews_received = 0
  FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001'), 'counters backfilled from requests');

-- 3. Counters follow inserts, status changes, confirmations, moves and deletes -----------
INSERT INTO public.review_requests (id, business_id, campaign_id, status, sent_at)
  VALUES ('70000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'sent', now());
SELECT test.assert_true((SELECT total_sent FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = 3, 'insert counted');
UPDATE public.review_requests SET status = 'completed', completed_at = now() WHERE id = '70000000-0000-4000-8000-000000000010';
SELECT test.assert_true((SELECT total_completed = 1 AND total_clicked = 2 AND total_reviews_received = 0 FROM public.campaigns
  WHERE id = '50000000-0000-4000-8000-000000000001'), 'finishing the page is not a confirmed review');
UPDATE public.review_requests SET review_confirmed_at = now(), review_confirmation_source = 'manual' WHERE id = '70000000-0000-4000-8000-000000000010';
SELECT test.assert_true((SELECT total_reviews_received FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = 1, 'confirmed review counted separately');
UPDATE public.review_requests SET status = 'failed' WHERE id = '70000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT total_sent FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = 3,
  'a later failure keeps the historical sent fact');
UPDATE public.review_requests SET campaign_id = '50000000-0000-4000-8000-000000000002' WHERE id = '70000000-0000-4000-8000-000000000010';
SELECT test.assert_true((SELECT total_sent FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = 2
  AND (SELECT total_sent FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000002') = 1, 'moving a request updates both campaigns');
DELETE FROM public.review_requests WHERE id = '70000000-0000-4000-8000-000000000010';
SELECT test.assert_true((SELECT total_sent + total_reviews_received FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000002') = 0, 'delete decrements');
-- No recount (no write to campaigns) for updates that do not touch a funnel field.
UPDATE public.campaigns SET updated_at = '2000-01-01' WHERE id = '50000000-0000-4000-8000-000000000001';
UPDATE public.review_requests SET error_message = 'retry note' WHERE id = '70000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT updated_at FROM public.campaigns WHERE id = '50000000-0000-4000-8000-000000000001') = '2000-01-01',
  'unrelated column updates skip the recount');

-- 4. Channel switch repair and constraints -----------------------------------------------
SELECT test.assert_true((SELECT bool_and(review_request_email_enabled) FROM public.businesses), 'email switch backfilled to on');
INSERT INTO public.businesses (id, organization_id, name) VALUES ('30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', 'New');
SELECT test.assert_true((SELECT review_request_email_enabled AND NOT review_request_quiet_hours_enabled FROM public.businesses
  WHERE id = '30000000-0000-4000-8000-000000000009'), 'new businesses: email on, quiet hours off');
DELETE FROM public.businesses WHERE id = '30000000-0000-4000-8000-000000000009';
UPDATE public.review_requests SET sms_status = 'delivered', email_status = 'bounced' WHERE id = '70000000-0000-4000-8000-000000000002';
UPDATE public.review_requests SET drip_terminated_reason = 'unsubscribed' WHERE id = '70000000-0000-4000-8000-000000000002';

-- 5. One claim per message ---------------------------------------------------------------
INSERT INTO public.review_request_messages (review_request_id, business_id, step, channel)
  VALUES ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 1, 'sms');
DO $$ BEGIN
  INSERT INTO public.review_request_messages (review_request_id, business_id, step, channel)
    VALUES ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 1, 'sms');
  RAISE EXCEPTION 'duplicate message claim was allowed';
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

-- 6. Reply rules / drafts / enrollment / inbound seed (service role) ----------------------
INSERT INTO public.reviews VALUES ('80000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000001', NULL),
  ('80000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000002', NULL);
INSERT INTO public.review_reply_rules (business_id, rating) VALUES ('30000000-0000-4000-8000-000000000002', 1);
SELECT test.assert_true((SELECT action FROM public.review_reply_rules WHERE business_id = '30000000-0000-4000-8000-000000000002') = 'approval',
  'new reply rules default to approval');
INSERT INTO public.review_reply_drafts (business_id, review_id, draft_text, source) VALUES
  ('30000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000101', 'Thanks', 'ai'),
  ('30000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000102', 'Thanks B', 'ai');
DO $$ BEGIN
  INSERT INTO public.review_reply_drafts (business_id, review_id, draft_text, source)
    VALUES ('30000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000101', 'Again', 'ai');
  RAISE EXCEPTION 'second draft for one review was allowed';
EXCEPTION WHEN unique_violation THEN NULL;
END $$;
INSERT INTO public.review_reply_templates (id, business_id, name, body) VALUES
  ('90000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'B template', 'Thanks!');
DO $$ BEGIN
  -- A rule cannot point at another business's template.
  INSERT INTO public.review_reply_rules (business_id, rating, action, template_id)
    VALUES ('30000000-0000-4000-8000-000000000001', 5, 'template', '90000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'cross-business template reference was allowed';
EXCEPTION WHEN foreign_key_violation THEN NULL;
END $$;
INSERT INTO public.enrollment_imports (id, business_id, campaign_id) VALUES
  ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001');
INSERT INTO public.enrollment_import_rows (import_id, business_id, row_number, email, identity_key) VALUES
  ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 1, 'x@example.test', 'x@example.test');
DO $$ BEGIN
  INSERT INTO public.enrollment_import_rows (import_id, business_id, row_number, email, identity_key)
    VALUES ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 2, 'x@example.test', 'x@example.test');
  RAISE EXCEPTION 'same contact queued twice in one import';
EXCEPTION WHEN unique_violation THEN NULL;
END $$;
DO $$ BEGIN
  INSERT INTO public.business_inbound_addresses (business_id, address_token) VALUES ('30000000-0000-4000-8000-000000000001', 'BAD TOKEN');
  RAISE EXCEPTION 'unsafe inbound token accepted';
EXCEPTION WHEN check_violation THEN NULL;
END $$;
INSERT INTO public.inbound_email_events (provider_event_id, business_id, status) VALUES ('evt-1', '30000000-0000-4000-8000-000000000002', 'enrolled');

-- 7. Tenant isolation and write permissions ----------------------------------------------
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001'; -- owner of A
SELECT test.assert_true((SELECT count(*) FROM public.review_request_messages) = 1, 'owner A reads own message ledger');
SELECT test.assert_true((SELECT count(*) FROM public.review_reply_drafts) = 1, 'owner A sees only A drafts');
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.review_reply_rules), 'owner A cannot read B rules');
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.inbound_email_events), 'owner A cannot read B inbound events');
SELECT test.assert_true((SELECT count(*) FROM public.enrollment_import_rows) = 1, 'owner A reads own import rows');
INSERT INTO public.review_reply_rules (business_id, rating, action) VALUES ('30000000-0000-4000-8000-000000000001', 5, 'auto');
SELECT test.expect_denied($cmd$INSERT INTO public.review_reply_rules (business_id, rating) VALUES ('30000000-0000-4000-8000-000000000002', 5)$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.review_request_messages (review_request_id, business_id, channel)
  VALUES ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'email')$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.review_reply_drafts SET status = 'posted'$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO public.review_request_email_unsubscribes (business_id, email, source)
  VALUES ('30000000-0000-4000-8000-000000000001', 'z@example.test', 'manual')$cmd$);
SELECT test.expect_denied($cmd$UPDATE public.enrollment_import_rows SET status = 'enrolled'$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000003'; -- viewer of A
SELECT test.assert_true((SELECT count(*) FROM public.review_reply_rules) = 1, 'viewer can read rules');
SELECT test.expect_denied($cmd$INSERT INTO public.review_reply_rules (business_id, rating) VALUES ('30000000-0000-4000-8000-000000000001', 4)$cmd$);
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000004'; -- owner of B
SELECT test.assert_true(NOT EXISTS (SELECT 1 FROM public.review_request_messages), 'owner B cannot read A ledger');
SELECT test.assert_true((SELECT count(*) FROM public.review_reply_drafts) = 1, 'owner B sees only B drafts');
RESET ROLE;
SET ROLE anon;
SELECT test.expect_denied($cmd$SELECT * FROM public.review_reply_drafts$cmd$);
SELECT test.expect_denied($cmd$SELECT * FROM public.review_request_messages$cmd$);
SELECT test.expect_denied($cmd$SELECT * FROM public.review_request_email_unsubscribes$cmd$);
RESET ROLE;
