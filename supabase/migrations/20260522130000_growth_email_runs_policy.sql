-- Deny client access to growth_email_runs (service role only)

CREATE POLICY "Service role only growth_email_runs"
    ON growth_email_runs
    FOR ALL
    USING (false)
    WITH CHECK (false);
