-- apply-plan: with-code — the new rule values are written by
--   answerabilityFindings() (answerability-findings.ts) landing in the same
--   commit as this migration.
--
-- F5.8: extends crawl_findings.rule to carry answerability-audit findings
-- alongside the existing F5.2/F5.3/F5.4 rules. Same drop-and-re-add pattern
-- as 20260809190000 (Postgres has no ALTER for one CHECK value).

ALTER TABLE public.crawl_findings DROP CONSTRAINT crawl_findings_rule_check;

ALTER TABLE public.crawl_findings ADD CONSTRAINT crawl_findings_rule_check CHECK (rule IN (
  'ai_bot_blocked', 'robots_txt_unreachable', 'http_error',
  'missing_canonical', 'thin_content',
  'invalid_json_ld', 'missing_structured_data', 'incomplete_schema', 'duplicate_conflicting_schema',
  'no_direct_answer', 'no_extractable_structure', 'long_paragraphs', 'missing_date_markup', 'missing_author_markup'
));
