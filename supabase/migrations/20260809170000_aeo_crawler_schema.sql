-- apply-plan: with-code — read and written by the E-3 crawler module landing
--   with it (src/services/aeo/crawler/).
--
-- E-3: crawler schema. Three tables, scoped deliberately narrow (F5.1–F5.3
-- only — the crawl itself, crawlability, and AI-bot-access findings). F5.4
-- (schema/JSON-LD validation), F5.8 (answerability), F5.10 (GBP audit), and
-- F5.12 (severity triage with affected-prompt linkage) are separate, larger
-- analysis passes that read crawl_pages after the fact — this migration does
-- not attempt them.
--
-- crawl_runs is one row per crawl (one business, one attempt). crawl_pages is
-- one row per fetched URL — raw HTML lives out-of-row in Supabase Storage,
-- mirroring the E-8 aeo-answers pattern exactly, so a future analysis pass
-- (F5.4, F5.8) never has to re-crawl a real customer's site to look at
-- content already fetched once. crawl_findings is what F5.2/F5.3 emit today;
-- F5.4/F5.8 will write into the same table once they exist.
--
-- Deliberately NOT yet wired to fire in production: nothing calls
-- crawlSite() from a route, cron, or UI. The crawler module is fully built
-- and tested against real production data (wolfpackkc.com's actual
-- robots.txt, sitemap, and homepage markup — verified live before this
-- migration was written), but there is no trigger, matching how E-8/E-9/E-10
-- each landed schema-first and were wired to a real trigger only once
-- reviewed. Applying this migration alone crawls nothing and changes no
-- customer-visible behaviour.

CREATE TABLE public.crawl_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  trigger TEXT NOT NULL CHECK (trigger IN ('manual', 'scheduled')),
  origin TEXT NOT NULL,
  -- Coverage disclosure (PRD-6 edge case: a customer whose site was only
  -- partially covered must be told, not shown a partial audit as complete).
  pages_discovered INTEGER NOT NULL DEFAULT 0 CHECK (pages_discovered >= 0),
  pages_crawled INTEGER NOT NULL DEFAULT 0 CHECK (pages_crawled >= 0),
  page_cap INTEGER NOT NULL CHECK (page_cap > 0),
  CHECK (pages_crawled <= pages_discovered),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK ((status = 'running') = (completed_at IS NULL))
);

CREATE TABLE public.crawl_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id UUID NOT NULL REFERENCES public.crawl_runs(id) ON DELETE CASCADE,
  -- Denormalized alongside crawl_run_id, matching aeo_samples' own pattern:
  -- RLS and per-business queries read this directly rather than joining
  -- through the run on every access.
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  -- NULL http_status means the request itself never completed (DNS, timeout,
  -- network error) — a fetch_error, not an HTTP response. Never conflated:
  -- one is "the site said no", the other is "we never reached the site".
  http_status INTEGER,
  fetch_error TEXT,
  CHECK ((http_status IS NULL) OR (fetch_error IS NULL)),
  canonical_url TEXT,
  meta_robots TEXT,
  title TEXT,
  h1_count INTEGER,
  word_count INTEGER,
  -- Out-of-row raw HTML, aeo-answers-storage pattern. NULL when the fetch
  -- failed (nothing to store) or storage itself failed (E-8's own precedent:
  -- a failed upload must never fail the observation it is evidence for).
  content_storage_path TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.crawl_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id UUID NOT NULL REFERENCES public.crawl_runs(id) ON DELETE CASCADE,
  -- NULL for a run-level finding (ai_bot_blocked, robots_txt_unreachable —
  -- robots.txt applies site-wide, not to one page). Set for a page-level one.
  crawl_page_id UUID REFERENCES public.crawl_pages(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rule TEXT NOT NULL CHECK (rule IN (
    'ai_bot_blocked', 'robots_txt_unreachable', 'http_error',
    'missing_canonical', 'thin_content'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  page_url TEXT,
  CHECK ((crawl_page_id IS NULL) = (page_url IS NULL)),
  evidence TEXT NOT NULL,
  fix_instruction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX crawl_pages_run_idx ON public.crawl_pages (crawl_run_id);
CREATE INDEX crawl_findings_run_idx ON public.crawl_findings (crawl_run_id);
CREATE INDEX crawl_runs_business_started_idx ON public.crawl_runs (business_id, started_at DESC);

ALTER TABLE public.crawl_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_findings ENABLE ROW LEVEL SECURITY;

-- Matches the existing aeo_* generated-policy pattern exactly: business_id
-- resolved to organization_id through businesses, checked against the
-- caller's orgs. Read-only to the owning org — nothing here is meant to be
-- written from a browser session; only the service-role crawler worker
-- writes these rows.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['crawl_runs', 'crawl_pages', 'crawl_findings']
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING ('
      || 'business_id IN (SELECT id FROM public.businesses '
      || 'WHERE organization_id IN (SELECT public.get_user_org_ids())))',
      t || '_select_own_org', t
    );
  END LOOP;
END
$$;

-- Private bucket for raw crawled HTML, mirroring aeo-answers exactly:
-- customer intelligence, readable only through an authenticated, org-scoped
-- path, written only by the service-role crawler worker.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aeo-crawl-pages',
  'aeo-crawl-pages',
  false,
  5242880, -- 5 MB. Comfortably above any real page's raw HTML.
  ARRAY['text/html', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Path convention: {organization_id}/{crawl_run_id}/{crawl_page_id}.html —
-- same reasoning as aeo-answers: the org id leads because the policy matches
-- on the first path segment, and nothing but the path itself can forge it.
DROP POLICY IF EXISTS "aeo_crawl_pages_read_own_org" ON storage.objects;
CREATE POLICY "aeo_crawl_pages_read_own_org"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'aeo-crawl-pages'
    AND (storage.foldername(name))[1] IN (SELECT get_user_org_ids()::text)
  );
