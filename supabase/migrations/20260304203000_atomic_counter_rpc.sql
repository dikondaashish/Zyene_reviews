-- ============================================================
-- FIX 4.3: Atomic Counter Increment for Customer Requests
-- Eliminates race condition in read-modify-write pattern
-- ============================================================

CREATE OR REPLACE FUNCTION increment_customer_requests(
    p_business_id UUID,
    p_phone TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Try to update existing record atomically
    UPDATE customers
    SET total_requests_sent = total_requests_sent + 1,
        last_request_sent_at = NOW(),
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        updated_at = NOW()
    WHERE business_id = p_business_id AND phone = p_phone;

    -- If no rows updated, insert a new record
    IF NOT FOUND THEN
        INSERT INTO customers (business_id, phone, first_name, last_name, total_requests_sent, last_request_sent_at, updated_at)
        VALUES (p_business_id, p_phone, p_first_name, p_last_name, 1, NOW(), NOW())
        ON CONFLICT (business_id, phone) DO UPDATE
        SET total_requests_sent = customers.total_requests_sent + 1,
            last_request_sent_at = NOW(),
            first_name = COALESCE(EXCLUDED.first_name, customers.first_name),
            last_name = COALESCE(EXCLUDED.last_name, customers.last_name),
            updated_at = NOW();
    END IF;
END;
$$;
