import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { refreshAnswerVolatility } from "@/services/aeo/analytics/refresh-answer-volatility";
import { refreshCitationTrafficCorrelation } from "@/services/aeo/analytics/refresh-traffic-correlation";
import { refreshCompetitorPages } from "@/services/aeo/competitors/refresh-competitor-pages";
import { refreshKeywordDemand } from "@/services/aeo/prompts/refresh-keyword-demand";
import { refreshLlmsTxtAudit } from "@/services/aeo/technical-audit/refresh-llms-txt";
import { refreshNapConsistency } from "@/services/aeo/technical-audit/refresh-nap-consistency";
import { evaluateVisibilityAnomaly } from "@/services/aeo/alerting/evaluate-statistical-anomaly";
import { exportBusinessToBigQuery } from "@/services/aeo/integrations/export-to-bigquery";

export const aeoPhase3RefreshWorker = inngest.createFunction(
    { id: "aeo-phase3-refresh-worker", concurrency: { key: "event.data.businessId", limit: 1 }, retries: 1 },
    { event: "aeo/phase3.refresh.requested" },
    async ({ event, step }) => {
        const db = createAdminClient();
        const input = event.data;
        const volatility = await step.run("answer-volatility", () => refreshAnswerVolatility(db, input.businessId));
        const traffic = await step.run("citation-traffic-correlation", () => refreshCitationTrafficCorrelation(db, input.businessId));
        const competitors = await step.run("competitor-pages", () => refreshCompetitorPages(db, input.businessId));
        const demand = await step.run("prompt-demand", () => refreshKeywordDemand(db, input.businessId));
        const llmsTxt = await step.run("llms-txt", () => refreshLlmsTxtAudit(db, input.businessId));
        const nap = await step.run("nap-consistency", () => refreshNapConsistency(db, input.businessId));
        const anomaly = await step.run("statistical-anomaly", () => evaluateVisibilityAnomaly(db, input));
        const bigquery = await step.run("bigquery-export", () => exportBusinessToBigQuery(db, input));
        return { volatility, traffic, competitors, demand, llmsTxt, nap, anomaly, bigquery };
    }
);
