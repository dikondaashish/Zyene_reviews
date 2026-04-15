-- Structured run logs for Competitor Watch cron health visibility.

CREATE TABLE IF NOT EXISTS public.competitor_watch_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  scanned INTEGER NOT NULL DEFAULT 0,
  external_updates INTEGER NOT NULL DEFAULT 0,
  snapshots_created INTEGER NOT NULL DEFAULT 0,
  events_created INTEGER NOT NULL DEFAULT 0,
  insights_created INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_watch_runs_business_created
  ON public.competitor_watch_runs (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_watch_runs_run_id
  ON public.competitor_watch_runs (run_id);

ALTER TABLE public.competitor_watch_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitor_watch_runs_select ON public.competitor_watch_runs;
CREATE POLICY competitor_watch_runs_select ON public.competitor_watch_runs
  FOR SELECT USING (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS competitor_watch_runs_insert ON public.competitor_watch_runs;
CREATE POLICY competitor_watch_runs_insert ON public.competitor_watch_runs
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT bm.business_id
      FROM public.business_members bm
      WHERE bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );
