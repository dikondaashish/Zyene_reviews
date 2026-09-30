-- apply-plan: before-code - required by webhook and lazy billing reconciliation.
-- Serialize billing state and dependent feature shutdown with the current
-- customer/subscription binding, including compare-and-swap checkout replacement.
ALTER TABLE public.organizations ADD COLUMN stripe_subscription_observed_at timestamptz;
CREATE FUNCTION public.apply_stripe_subscription_projection(
  p_customer_id text, p_subscription_id text, p_projection jsonb,
  p_clear boolean DEFAULT false, p_bind_organization_id uuid DEFAULT NULL,
  p_expected_subscription_id text DEFAULT NULL, p_observed_at timestamptz DEFAULT now()
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE org public.organizations%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Billing projection denied' USING ERRCODE = '42501';
  END IF;
  IF NULLIF(p_customer_id, '') IS NULL OR NULLIF(p_subscription_id, '') IS NULL
    OR p_projection->>'plan_status' IS NULL
    OR p_projection->>'plan_status' NOT IN ('active', 'trialing', 'past_due', 'none', 'canceled')
    OR NULLIF(p_projection->>'plan', '') IS NULL
    OR (p_clear AND p_projection->>'plan_status' <> 'canceled') THEN
    RAISE EXCEPTION 'Invalid billing projection';
  END IF;
  IF p_bind_organization_id IS NOT NULL THEN
    SELECT * INTO org FROM public.organizations WHERE id = p_bind_organization_id FOR UPDATE;
    IF NOT FOUND OR org.stripe_customer_id IS DISTINCT FROM p_customer_id THEN
      RAISE EXCEPTION 'Checkout customer binding mismatch' USING ERRCODE = '42501';
    END IF;
    IF org.stripe_subscription_id IS DISTINCT FROM p_expected_subscription_id THEN
      RAISE EXCEPTION 'Checkout binding changed; retry' USING ERRCODE = '40001';
    END IF;
  ELSE
    SELECT * INTO org FROM public.organizations WHERE stripe_customer_id = p_customer_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Subscription organization not found'; END IF;
    IF org.stripe_subscription_id IS DISTINCT FROM p_subscription_id THEN RETURN NULL; END IF;
  END IF;
  IF NOT p_clear AND org.stripe_subscription_observed_at > p_observed_at THEN
    IF p_bind_organization_id IS NOT NULL THEN
      RAISE EXCEPTION 'Checkout projection changed; retry' USING ERRCODE = '40001';
    END IF;
    RETURN NULL;
  END IF;
  UPDATE public.organizations SET
    stripe_subscription_observed_at = p_observed_at,
    stripe_subscription_id = CASE WHEN p_clear THEN NULL ELSE p_subscription_id END,
    plan = p_projection->>'plan', plan_status = p_projection->>'plan_status',
    trial_ends_at = (p_projection->>'trial_ends_at')::timestamptz,
    max_businesses = (p_projection->>'max_businesses')::integer,
    max_team_members = (p_projection->>'max_team_members')::integer,
    max_review_requests_per_month = (p_projection->>'max_review_requests_per_month')::integer,
    max_ai_replies_per_month = (p_projection->>'max_ai_replies_per_month')::integer,
    max_email_requests_per_month = (p_projection->>'max_email_requests_per_month')::integer,
    max_sms_requests_per_month = (p_projection->>'max_sms_requests_per_month')::integer,
    max_link_requests_per_month = (p_projection->>'max_link_requests_per_month')::integer,
    updated_at = now() WHERE id = org.id;
  IF p_projection->>'plan_status' IN ('none', 'canceled') THEN
    UPDATE public.businesses SET auto_reply_enabled = false, auto_reply_enabled_at = NULL
      WHERE organization_id = org.id;
  END IF;
  RETURN org.id;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_stripe_subscription_projection(text, text, jsonb, boolean, uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_subscription_projection(text, text, jsonb, boolean, uuid, text, timestamptz)
  TO service_role;
