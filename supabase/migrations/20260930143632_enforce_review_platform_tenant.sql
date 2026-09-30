-- apply-plan: with-code - enforce new writes now; validate historical rows after a read-only consistency check.
-- The scalar platform_id FK does not prove that the platform belongs to the review tenant.
CREATE UNIQUE INDEX IF NOT EXISTS review_platforms_business_id_id_key
  ON public.review_platforms (business_id, id);

ALTER TABLE public.reviews ADD CONSTRAINT reviews_platform_tenant_fk
  FOREIGN KEY (business_id, platform_id)
  REFERENCES public.review_platforms (business_id, id)
  ON DELETE SET NULL (platform_id)
  NOT VALID;
