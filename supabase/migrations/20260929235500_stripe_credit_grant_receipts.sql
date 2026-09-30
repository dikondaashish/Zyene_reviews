-- apply-plan: before-code - credit grants become retryable, monotonic and atomic.
CREATE TABLE public.stripe_credit_grant_receipts (
  receipt_id text PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id text NOT NULL, period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stripe_credit_grant_receipts_org_period
  ON public.stripe_credit_grant_receipts (organization_id, period_end DESC);
ALTER TABLE public.stripe_credit_grant_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_credit_grant_receipts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.stripe_credit_grant_receipts TO service_role;

CREATE FUNCTION public.apply_stripe_credit_grant(
  p_receipt_id text, p_organization_id uuid, p_customer_id text,
  p_subscription_id text, p_plan_id text, p_period_end timestamptz, p_granted_micro_usd bigint
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org public.organizations%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Credit grant denied' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(p_receipt_id, '') IS NULL OR p_period_end IS NULL
    OR p_granted_micro_usd IS NULL OR p_granted_micro_usd < 0 THEN
    RAISE EXCEPTION 'Invalid credit grant';
  END IF;
  SELECT * INTO org FROM public.organizations WHERE id = p_organization_id FOR UPDATE;
  IF NOT FOUND OR org.stripe_customer_id IS DISTINCT FROM p_customer_id
    OR org.stripe_subscription_id IS DISTINCT FROM p_subscription_id
    OR org.plan IS DISTINCT FROM p_plan_id OR org.plan_status NOT IN ('active', 'trialing') THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.stripe_credit_grant_receipts WHERE receipt_id = p_receipt_id)
    OR EXISTS (SELECT 1 FROM public.stripe_credit_grant_receipts
      WHERE organization_id = org.id AND period_end >= p_period_end) THEN RETURN false; END IF;
  PERFORM public.aeo_reset_credit_grant(org.id, p_granted_micro_usd);
  INSERT INTO public.stripe_credit_grant_receipts (receipt_id, organization_id, subscription_id, period_end)
    VALUES (p_receipt_id, org.id, p_subscription_id, p_period_end);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_stripe_credit_grant(text, uuid, text, text, text, timestamptz, bigint)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_credit_grant(text, uuid, text, text, text, timestamptz, bigint)
  TO service_role;
