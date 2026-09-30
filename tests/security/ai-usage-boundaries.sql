SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SELECT test.expect_denied($cmd$SELECT public.increment_ai_replies_used('10000000-0000-4000-8000-000000000001')$cmd$);
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '20000000-0000-4000-8000-000000000001';
SELECT test.expect_denied($cmd$SELECT public.increment_ai_replies_used('10000000-0000-4000-8000-000000000001')$cmd$);
SELECT test.expect_denied($cmd$SELECT public.increment_ai_replies_used('10000000-0000-4000-8000-000000000002')$cmd$);
RESET ROLE;
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SELECT public.increment_ai_replies_used('10000000-0000-4000-8000-000000000001');
SELECT test.assert_true((SELECT ai_replies_used_this_month = 1 FROM public.organizations
  WHERE id = '10000000-0000-4000-8000-000000000001'), 'backend accounting works');
SELECT test.assert_true((SELECT COALESCE(ai_replies_used_this_month, 0) = 0 FROM public.organizations
  WHERE id = '10000000-0000-4000-8000-000000000002'), 'other tenant counter unchanged');
RESET ROLE;
