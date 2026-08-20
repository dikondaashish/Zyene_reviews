-- Persist review milestone progress per business and make customer identity
-- writes transactional across normalized email OR phone matches.

CREATE TABLE public.business_milestones (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  last_milestone_reached integer NOT NULL DEFAULT 0 CHECK (last_milestone_reached >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_milestones_select
ON public.business_milestones
FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids()));

CREATE INDEX business_milestones_updated_at_idx
ON public.business_milestones(updated_at DESC);

-- Seed from the same visible-review definition used by dashboard metrics. This
-- intentionally stores the observed count (for example 1,380), not merely the
-- nearest configured threshold, so old milestones can never replay later.
INSERT INTO public.business_milestones (business_id, last_milestone_reached)
SELECT
  b.id,
  count(r.id)::integer
FROM public.businesses b
LEFT JOIN public.reviews r
  ON r.business_id = b.id
 AND r.is_visible = true
GROUP BY b.id;

CREATE OR REPLACE FUNCTION public.claim_review_milestone(p_business_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_count integer;
  v_last_count integer;
  v_claimed integer;
  v_inserted integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND p_business_id NOT IN (SELECT public.get_user_business_ids()) THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('review-milestone:' || p_business_id::text, 0));

  SELECT count(*)::integer
  INTO v_current_count
  FROM public.reviews
  WHERE business_id = p_business_id
    AND is_visible = true;

  INSERT INTO public.business_milestones (business_id, last_milestone_reached)
  VALUES (p_business_id, v_current_count)
  ON CONFLICT (business_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  -- A newly observed business is seeded silently at its current count.
  IF v_inserted = 1 THEN
    RETURN NULL;
  END IF;

  SELECT last_milestone_reached
  INTO v_last_count
  FROM public.business_milestones
  WHERE business_id = p_business_id
  FOR UPDATE;

  SELECT max(milestone)
  INTO v_claimed
  FROM unnest(ARRAY[10, 25, 50, 100, 250, 500, 1000, 2500]) AS milestone
  WHERE milestone > v_last_count
    AND milestone <= v_current_count;

  IF v_current_count > v_last_count THEN
    UPDATE public.business_milestones
    SET last_milestone_reached = v_current_count,
        updated_at = now()
    WHERE business_id = p_business_id;
  END IF;

  RETURN v_claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_customer_email(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT nullif(lower(btrim(value)), '');
$$;

CREATE OR REPLACE FUNCTION public.normalize_customer_phone(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN nullif(regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g'), '') IS NULL THEN NULL
    WHEN length(regexp_replace(value, '[^0-9]', '', 'g')) = 10
      THEN '+1' || regexp_replace(value, '[^0-9]', '', 'g')
    ELSE '+' || regexp_replace(value, '[^0-9]', '', 'g')
  END;
$$;

ALTER TABLE public.customers
  ADD COLUMN normalized_email text
    GENERATED ALWAYS AS (public.normalize_customer_email(email)) STORED,
  ADD COLUMN normalized_phone text
    GENERATED ALWAYS AS (public.normalize_customer_phone(phone)) STORED;

-- Customer writes now go through the authorized transactional functions below.
-- Removing direct authenticated INSERT prevents callers from bypassing the
-- normalized OR-identity lock through PostgREST.
DROP POLICY IF EXISTS "Users can access customers of their businesses" ON public.customers;

CREATE POLICY customers_select_for_business_members
ON public.customers FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids()));

CREATE POLICY customers_update_for_business_members
ON public.customers FOR UPDATE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT public.get_user_business_ids()));

CREATE POLICY customers_delete_for_business_members
ON public.customers FOR DELETE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids()));

CREATE INDEX customers_business_normalized_email_idx
ON public.customers(business_id, normalized_email)
WHERE normalized_email IS NOT NULL;

CREATE INDEX customers_business_normalized_phone_idx
ON public.customers(business_id, normalized_phone)
WHERE normalized_phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.merge_customers(
  p_business_id uuid,
  p_primary_customer_id uuid,
  p_duplicate_customer_id uuid
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_primary public.customers;
  v_duplicate public.customers;
  v_result public.customers;
BEGIN
  IF auth.role() <> 'service_role'
     AND p_business_id NOT IN (SELECT public.get_user_business_ids()) THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;
  IF p_primary_customer_id = p_duplicate_customer_id THEN
    RAISE EXCEPTION 'Customers must be different' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('customer-identity:' || p_business_id::text, 0));

  SELECT * INTO v_primary
  FROM public.customers
  WHERE id = p_primary_customer_id AND business_id = p_business_id
  FOR UPDATE;
  SELECT * INTO v_duplicate
  FROM public.customers
  WHERE id = p_duplicate_customer_id AND business_id = p_business_id
  FOR UPDATE;

  IF v_primary.id IS NULL OR v_duplicate.id IS NULL THEN
    RAISE EXCEPTION 'Customer not found in this business' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.customers WHERE id = v_duplicate.id;

  UPDATE public.customers
  SET first_name = coalesce(first_name, v_duplicate.first_name),
      last_name = coalesce(last_name, v_duplicate.last_name),
      email = coalesce(email, v_duplicate.email),
      phone = coalesce(phone, v_duplicate.phone),
      tags = ARRAY(
        SELECT DISTINCT tag
        FROM unnest(coalesce(tags, ARRAY[]::text[]) || coalesce(v_duplicate.tags, ARRAY[]::text[])) tag
      ),
      notes = CASE
        WHEN nullif(btrim(notes), '') IS NULL THEN v_duplicate.notes
        WHEN nullif(btrim(v_duplicate.notes), '') IS NULL OR notes = v_duplicate.notes THEN notes
        ELSE notes || E'\n\n' || v_duplicate.notes
      END,
      is_opted_out = is_opted_out OR v_duplicate.is_opted_out,
      total_requests_sent = coalesce(total_requests_sent, 0) + coalesce(v_duplicate.total_requests_sent, 0),
      visit_count = coalesce(visit_count, 0) + coalesce(v_duplicate.visit_count, 0),
      total_spend_cents = coalesce(total_spend_cents, 0) + coalesce(v_duplicate.total_spend_cents, 0),
      last_request_sent_at = greatest(last_request_sent_at, v_duplicate.last_request_sent_at),
      last_visit_at = greatest(last_visit_at, v_duplicate.last_visit_at),
      created_at = least(created_at, v_duplicate.created_at),
      updated_at = now()
  WHERE id = v_primary.id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_customer_by_identity(
  p_business_id uuid,
  p_customer_id uuid DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_increment_requests integer DEFAULT 0,
  p_last_request_sent_at timestamptz DEFAULT NULL
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text := public.normalize_customer_email(p_email);
  v_phone text := public.normalize_customer_phone(p_phone);
  v_target_id uuid;
  v_match_id uuid;
  v_result public.customers;
BEGIN
  IF auth.role() <> 'service_role'
     AND p_business_id NOT IN (SELECT public.get_user_business_ids()) THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;
  IF p_increment_requests < 0 THEN
    RAISE EXCEPTION 'Request increment cannot be negative' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('customer-identity:' || p_business_id::text, 0));

  SELECT id INTO v_target_id
  FROM public.customers
  WHERE business_id = p_business_id
    AND (
      (p_customer_id IS NOT NULL AND id = p_customer_id)
      OR (v_email IS NOT NULL AND normalized_email = v_email)
      OR (v_phone IS NOT NULL AND normalized_phone = v_phone)
    )
  ORDER BY CASE WHEN id = p_customer_id THEN 0 ELSE 1 END, created_at, id
  LIMIT 1
  FOR UPDATE;

  IF p_customer_id IS NOT NULL AND v_target_id IS NULL THEN
    RAISE EXCEPTION 'Customer not found in this business' USING ERRCODE = 'P0002';
  END IF;

  IF v_target_id IS NULL THEN
    INSERT INTO public.customers (
      id, business_id, first_name, last_name, email, phone, tags, notes,
      total_requests_sent, last_request_sent_at
    ) VALUES (
      coalesce(p_customer_id, gen_random_uuid()), p_business_id,
      nullif(btrim(p_first_name), ''), nullif(btrim(p_last_name), ''),
      v_email, v_phone, coalesce(p_tags, ARRAY[]::text[]), nullif(btrim(p_notes), ''),
      p_increment_requests, p_last_request_sent_at
    )
    RETURNING * INTO v_result;
    RETURN v_result;
  END IF;

  FOR v_match_id IN
    SELECT id
    FROM public.customers
    WHERE business_id = p_business_id
      AND id <> v_target_id
      AND (
        (v_email IS NOT NULL AND normalized_email = v_email)
        OR (v_phone IS NOT NULL AND normalized_phone = v_phone)
      )
    ORDER BY created_at, id
  LOOP
    SELECT * INTO v_result
    FROM public.merge_customers(p_business_id, v_target_id, v_match_id);
  END LOOP;

  UPDATE public.customers
  SET first_name = coalesce(nullif(btrim(p_first_name), ''), first_name),
      last_name = coalesce(nullif(btrim(p_last_name), ''), last_name),
      email = coalesce(v_email, email),
      phone = coalesce(v_phone, phone),
      tags = ARRAY(
        SELECT DISTINCT tag
        FROM unnest(coalesce(tags, ARRAY[]::text[]) || coalesce(p_tags, ARRAY[]::text[])) tag
      ),
      notes = coalesce(nullif(btrim(p_notes), ''), notes),
      total_requests_sent = coalesce(total_requests_sent, 0) + p_increment_requests,
      last_request_sent_at = greatest(last_request_sent_at, p_last_request_sent_at),
      updated_at = now()
  WHERE id = v_target_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.import_customers_by_identity(
  p_business_id uuid,
  p_customers jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer jsonb;
  v_count integer := 0;
BEGIN
  IF auth.role() <> 'service_role'
     AND p_business_id NOT IN (SELECT public.get_user_business_ids()) THEN
    RAISE EXCEPTION 'Not authorized for this business' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_customers) <> 'array' OR jsonb_array_length(p_customers) > 5000 THEN
    RAISE EXCEPTION 'Customers must be an array of at most 5000 rows' USING ERRCODE = '22023';
  END IF;

  FOR v_customer IN SELECT value FROM jsonb_array_elements(p_customers)
  LOOP
    PERFORM public.upsert_customer_by_identity(
      p_business_id,
      NULL,
      v_customer->>'first_name',
      v_customer->>'last_name',
      v_customer->>'email',
      v_customer->>'phone'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_customer_identity_duplicate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.email IS NOT DISTINCT FROM OLD.email
     AND NEW.phone IS NOT DISTINCT FROM OLD.phone THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.customers existing
    WHERE existing.business_id = NEW.business_id
      AND existing.id <> NEW.id
      AND (
        (public.normalize_customer_email(NEW.email) IS NOT NULL
          AND existing.normalized_email = public.normalize_customer_email(NEW.email))
        OR (public.normalize_customer_phone(NEW.phone) IS NOT NULL
          AND existing.normalized_phone = public.normalize_customer_phone(NEW.phone))
      )
  ) THEN
    RAISE EXCEPTION 'A customer with this email or phone already exists; use the identity upsert or merge flow'
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_prevent_identity_duplicates
BEFORE INSERT OR UPDATE OF email, phone ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.prevent_customer_identity_duplicate();

REVOKE ALL ON TABLE public.business_milestones FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_review_milestone(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.merge_customers(uuid, uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_by_identity(uuid, uuid, text, text, text, text, text[], text, integer, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.import_customers_by_identity(uuid, jsonb) FROM PUBLIC, anon;

GRANT SELECT ON TABLE public.business_milestones TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_review_milestone(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.merge_customers(uuid, uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_customer_by_identity(uuid, uuid, text, text, text, text, text[], text, integer, timestamptz) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.import_customers_by_identity(uuid, jsonb) TO authenticated, service_role;
