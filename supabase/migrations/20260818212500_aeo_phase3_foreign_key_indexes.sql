-- Follow-up for Supabase advisor 0001: business-first analytics indexes do not
-- cover deletes/joins by these prompt foreign keys.
CREATE INDEX IF NOT EXISTS aeo_answer_volatility_prompt_idx
  ON public.aeo_answer_volatility (prompt_id);

CREATE INDEX IF NOT EXISTS aeo_prompt_demand_prompt_idx
  ON public.aeo_prompt_demand_estimates (prompt_id);
