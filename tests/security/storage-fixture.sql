CREATE SCHEMA storage;
CREATE TABLE storage.buckets (id TEXT PRIMARY KEY, name TEXT, public BOOLEAN,
  file_size_limit BIGINT, allowed_mime_types TEXT[]);
CREATE TABLE storage.objects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id TEXT REFERENCES storage.buckets,
  name TEXT, metadata JSONB DEFAULT '{}'::jsonb, UNIQUE(bucket_id,name));
CREATE FUNCTION storage.foldername(name TEXT) RETURNS TEXT[] LANGUAGE sql IMMUTABLE AS $$
  SELECT (string_to_array(name, '/'))[1:cardinality(string_to_array(name, '/'))-1];
$$;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated, service_role;
ALTER TABLE public.aeo_samples ADD COLUMN business_id UUID REFERENCES public.businesses,
  ADD COLUMN answer_storage_path TEXT;
CREATE TABLE public.crawl_pages (id UUID PRIMARY KEY, business_id UUID REFERENCES public.businesses,
  content_storage_path TEXT);
ALTER TABLE public.aeo_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY sample_org_read ON public.aeo_samples FOR SELECT TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
CREATE POLICY crawl_org_read ON public.crawl_pages FOR SELECT TO authenticated USING (
  business_id IN (SELECT id FROM public.businesses WHERE organization_id IN (SELECT public.get_user_org_ids())));
INSERT INTO storage.buckets VALUES ('aeo-crawl-pages','aeo-crawl-pages',false,5242880,ARRAY['text/html']);
CREATE POLICY aeo_crawl_pages_read_own_org ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='aeo-crawl-pages' AND (storage.foldername(name))[1] IN (SELECT public.get_user_org_ids()::text));
