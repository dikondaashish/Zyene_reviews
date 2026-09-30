BEGIN;
SET request.jwt.claim.role='service_role';
INSERT INTO public.businesses (id,organization_id,name) VALUES
 ('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Sibling');
INSERT INTO public.organization_members VALUES
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000006','ORG_EMPLOYEE','active');
INSERT INTO public.business_members (business_id,user_id,role) VALUES
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000006','viewer');
INSERT INTO storage.objects (bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000001-123-logo.webp'),
 ('business-logos','30000000-0000-4000-8000-000000000002-123-logo.webp'),
 ('business-logos','30000000-0000-4000-8000-000000000003-123-logo.webp');
INSERT INTO public.aeo_samples VALUES
 ('90000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001/run-a/answer.json'),
 ('90000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001/run-sibling/answer.json'),
 ('90000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002/run-other/answer.json');
INSERT INTO public.crawl_pages VALUES
 ('91000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001/run-a/page.html'),
 ('91000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001/run-sibling/page.html');
INSERT INTO storage.objects (bucket_id,name) SELECT 'aeo-answers',answer_storage_path FROM public.aeo_samples;
INSERT INTO storage.objects (bucket_id,name) SELECT 'aeo-crawl-pages',content_storage_path FROM public.crawl_pages;
INSERT INTO storage.objects (bucket_id,name) VALUES
 ('aeo-answers','10000000-0000-4000-8000-000000000001/orphan/answer.json');
SET ROLE anon;
SET request.jwt.claim.role='anon';
SELECT test.assert_true((SELECT count(*)=3 FROM storage.objects), 'public logo display preserved; private evidence denied');
SELECT test.expect_denied($cmd$INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000001-456-logo.webp')$cmd$);
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role='authenticated';
SET request.jwt.claim.sub='20000000-0000-4000-8000-000000000006';
SELECT test.assert_true((SELECT count(*)=2 FROM storage.objects WHERE bucket_id<>'business-logos'),
 'viewer can read own evidence but not sibling, foreign or orphan objects');
SELECT test.expect_denied($cmd$INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000001-456-logo.webp')$cmd$);
UPDATE storage.objects SET metadata='{"forged":true}' WHERE bucket_id='business-logos';
DELETE FROM storage.objects WHERE bucket_id='business-logos';
SELECT test.assert_true((SELECT count(*)=3 FROM storage.objects WHERE bucket_id='business-logos' AND metadata='{}'),
 'viewer cannot overwrite or delete logos');
RESET ROLE;
SET request.jwt.claim.role='service_role';
UPDATE public.business_members SET role='member' WHERE user_id='20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role='authenticated';
INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000001-456-logo.webp'),
 ('business-logos','footer-30000000-0000-4000-8000-000000000001-456-footer.png');
SELECT test.expect_denied($cmd$INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000002-456-logo.webp')$cmd$);
SELECT test.expect_denied($cmd$INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000003-456-logo.webp')$cmd$);
SELECT test.expect_denied($cmd$UPDATE storage.objects SET name='30000000-0000-4000-8000-000000000002-789-logo.webp'
 WHERE name='30000000-0000-4000-8000-000000000001-456-logo.webp'$cmd$);
UPDATE storage.objects SET metadata='{"forged":true}' WHERE name='30000000-0000-4000-8000-000000000002-123-logo.webp';
SELECT test.assert_true((SELECT metadata='{}' FROM storage.objects
 WHERE name='30000000-0000-4000-8000-000000000002-123-logo.webp'), 'foreign logo unchanged');
DELETE FROM storage.objects WHERE name='30000000-0000-4000-8000-000000000001-456-logo.webp';
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM storage.objects
 WHERE name='30000000-0000-4000-8000-000000000001-456-logo.webp'), 'authorized cleanup works');
RESET ROLE;
SET request.jwt.claim.role='service_role';
UPDATE public.organization_members SET status='suspended' WHERE user_id='20000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SET request.jwt.claim.role='authenticated';
SELECT test.assert_true(NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id<>'business-logos'), 'suspended user loses evidence');
SELECT test.expect_denied($cmd$INSERT INTO storage.objects(bucket_id,name) VALUES
 ('business-logos','30000000-0000-4000-8000-000000000001-789-logo.webp')$cmd$);
SET request.jwt.claim.sub='20000000-0000-4000-8000-000000000001';
SELECT test.assert_true((SELECT count(*)=4 FROM storage.objects WHERE bucket_id<>'business-logos'), 'org owner retains own-business evidence only');
RESET ROLE;
ROLLBACK;
SET request.jwt.claim.role='';
