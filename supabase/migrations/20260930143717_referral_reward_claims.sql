-- Stripe side effects need a durable claim and frozen idempotency payload.
-- Apply before the referral worker; reconcile legacy converted rows before replay.
ALTER TABLE public.referral_conversions
  ADD COLUMN reward_customer_id text,
  ADD COLUMN reward_cents bigint,
  ADD COLUMN reward_key text UNIQUE,
  ADD COLUMN reward_claim_token uuid,
  ADD COLUMN reward_started_at timestamptz,
  ADD COLUMN reward_lease_until timestamptz;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.referral_conversions FROM PUBLIC, anon, authenticated;
DO $$
DECLARE v_columns text;
BEGIN
  SELECT string_agg(quote_ident(attname), ',') INTO v_columns FROM pg_attribute
    WHERE attrelid = 'public.referral_conversions'::regclass AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE ALL (%s) ON public.referral_conversions FROM PUBLIC, anon, authenticated', v_columns);
END;
$$;
CREATE POLICY referral_client_denial ON public.referral_conversions AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
GRANT ALL ON public.referral_conversions TO service_role;

-- The old handler could credit Stripe without recording success. Never guess
-- whether those converted rows should be paid again: reconcile them privately.
UPDATE public.referral_conversions SET reward_started_at = now() - interval '25 hours'
  WHERE status = 'converted';

CREATE FUNCTION public.claim_referral_conversion_reward(p_referee_id uuid, p_reward_cents bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_org public.organizations%ROWTYPE;
  v_row public.referral_conversions%ROWTYPE;
  v_customer text;
  v_claim uuid := gen_random_uuid();
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;
  IF p_reward_cents IS NULL OR p_reward_cents < 1 OR p_reward_cents > 100000 THEN
    RAISE EXCEPTION 'Invalid referral reward amount' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_org FROM public.organizations WHERE id = p_referee_id FOR UPDATE;
  IF NOT FOUND OR v_org.referred_by_user_id IS NULL OR v_org.plan_status IS DISTINCT FROM 'active'
    OR v_org.plan IS NULL OR v_org.plan = 'free' OR v_org.stripe_subscription_id IS NULL
    OR v_org.stripe_customer_id IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.referral_conversions(referrer_user_id, referee_organization_id)
    VALUES (v_org.referred_by_user_id, p_referee_id) ON CONFLICT (referee_organization_id) DO NOTHING;
  SELECT * INTO v_row FROM public.referral_conversions
    WHERE referee_organization_id = p_referee_id FOR UPDATE;
  IF v_row.status = 'rewarded' THEN RETURN NULL; END IF;
  IF v_row.referrer_user_id IS DISTINCT FROM v_org.referred_by_user_id THEN
    RAISE EXCEPTION 'Referral identity changed' USING ERRCODE = '42501';
  END IF;
  -- Stripe retains idempotency keys for at least 24 hours. Stop well before
  -- that deadline instead of risking a second charge after an ambiguous result.
  IF v_row.reward_started_at <= now() - interval '23 hours' THEN
    RAISE EXCEPTION 'Referral reward requires Stripe reconciliation' USING ERRCODE = '55000';
  END IF;
  IF v_row.reward_lease_until > now() THEN
    RAISE EXCEPTION 'Referral reward is already processing' USING ERRCODE = '40001';
  END IF;
  IF v_row.reward_started_at IS NULL THEN
    SELECT o.stripe_customer_id INTO v_customer
      FROM public.organization_members m JOIN public.organizations o ON o.id = m.organization_id
      WHERE m.user_id = v_row.referrer_user_id AND m.role IN ('owner', 'ORG_OWNER')
        AND m.status = 'active' AND o.id <> p_referee_id
        AND o.stripe_customer_id IS NOT NULL AND o.stripe_customer_id <> v_org.stripe_customer_id
      ORDER BY o.id LIMIT 1;
    IF v_customer IS NULL THEN RETURN NULL; END IF;
    UPDATE public.referral_conversions SET status = 'converted', converted_at = now(),
      reward_customer_id = v_customer, reward_cents = p_reward_cents,
      reward_key = 'referral-reward:' || id::text, reward_started_at = now()
      WHERE id = v_row.id RETURNING * INTO v_row;
  END IF;
  IF v_row.reward_customer_id IS NULL OR v_row.reward_cents IS NULL OR v_row.reward_key IS NULL THEN
    RAISE EXCEPTION 'Incomplete referral reward requires reconciliation' USING ERRCODE = '55000';
  END IF;
  UPDATE public.referral_conversions SET reward_claim_token = v_claim,
    reward_lease_until = now() + interval '5 minutes' WHERE id = v_row.id;
  RETURN jsonb_build_object('customerId', v_row.reward_customer_id, 'cents', v_row.reward_cents,
    'referrerUserId', v_row.referrer_user_id, 'claimToken', v_claim, 'idempotencyKey', v_row.reward_key);
END;
$$;

CREATE FUNCTION public.finish_referral_conversion_reward(p_referee_id uuid, p_claim_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service role required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.referral_conversions SET status = 'rewarded', rewarded_at = now(), reward_lease_until = NULL
    WHERE referee_organization_id = p_referee_id AND reward_claim_token = p_claim_token AND status = 'converted';
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_referral_conversion_reward(uuid,bigint),
  public.finish_referral_conversion_reward(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_conversion_reward(uuid,bigint),
  public.finish_referral_conversion_reward(uuid,uuid) TO service_role;
