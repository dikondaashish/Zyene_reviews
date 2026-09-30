-- apply-plan: with-code - compatible with existing business-scoped upload keys and backend evidence writers.
-- Public logo reads are intentional; mutations require live writable membership.
-- Keep both deployed key conventions: UUID-timestamp-logo and footer-UUID-...
CREATE FUNCTION public.can_write_business_logo(object_name TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.authorized_business_ids(true) AS allowed(business_id)
    WHERE object_name ~ ('^(footer-)?' || allowed.business_id::text || '-[0-9]+-[^/]+$'));
$$;
REVOKE ALL ON FUNCTION public.can_write_business_logo(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_write_business_logo(TEXT) TO authenticated, service_role;

CREATE POLICY business_logo_insert_guard ON storage.objects AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id <> 'business-logos' OR public.can_write_business_logo(name));
CREATE POLICY business_logo_update_guard ON storage.objects AS RESTRICTIVE
  FOR UPDATE TO authenticated USING (
    bucket_id <> 'business-logos' OR public.can_write_business_logo(name))
  WITH CHECK (bucket_id <> 'business-logos' OR public.can_write_business_logo(name));
CREATE POLICY business_logo_delete_guard ON storage.objects AS RESTRICTIVE
  FOR DELETE TO authenticated USING (
    bucket_id <> 'business-logos' OR public.can_write_business_logo(name));
CREATE POLICY business_logo_authorized_delete ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'business-logos' AND public.can_write_business_logo(name));

-- Org-prefix policies alone let employees read sibling businesses' evidence.
-- Match the actual published object pointer and its authorized business row.
CREATE POLICY business_private_storage_read_guard ON storage.objects AS RESTRICTIVE
  FOR SELECT TO authenticated USING (
    bucket_id NOT IN ('aeo-answers', 'aeo-crawl-pages')
    OR (bucket_id = 'aeo-answers' AND EXISTS (
      SELECT 1 FROM public.aeo_samples s WHERE s.answer_storage_path = storage.objects.name
        AND s.business_id IN (SELECT public.authorized_business_ids())))
    OR (bucket_id = 'aeo-crawl-pages' AND EXISTS (
      SELECT 1 FROM public.crawl_pages p WHERE p.content_storage_path = storage.objects.name
        AND p.business_id IN (SELECT public.authorized_business_ids())))
  );
