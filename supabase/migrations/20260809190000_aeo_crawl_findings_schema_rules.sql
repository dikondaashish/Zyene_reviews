-- apply-plan: with-code — the new rule values are written by schemaFindings()
--   in crawl-findings.ts, landing in the same commit as this migration.
--
-- F5.4: extends crawl_findings.rule to carry schema/JSON-LD validation
-- findings alongside the existing F5.2/F5.3 rules. Postgres has no ALTER for
-- an individual CHECK value, so this drops and re-adds the constraint under
-- its original name (crawl_findings_rule_check, confirmed via pg_constraint
-- before writing this migration) with the full new list.

ALTER TABLE public.crawl_findings DROP CONSTRAINT crawl_findings_rule_check;

ALTER TABLE public.crawl_findings ADD CONSTRAINT crawl_findings_rule_check CHECK (rule IN (
  'ai_bot_blocked', 'robots_txt_unreachable', 'http_error',
  'missing_canonical', 'thin_content',
  'invalid_json_ld', 'missing_structured_data', 'incomplete_schema', 'duplicate_conflicting_schema'
));
