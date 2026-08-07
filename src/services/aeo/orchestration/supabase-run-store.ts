import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { AnswerEngineId } from "../engines/engine-types";
import { resolveRegionName } from "../locale/region-names";
import type { RunStatus, RunStore } from "./ports";

type Admin = SupabaseClient<Database>;

export class SupabaseRunStore implements RunStore {
    constructor(private readonly db: Admin) {}

    async loadActivePrompts(businessId: string) {
        // is_active only. A `suggested` prompt is inert until a human enables it,
        // because enrolling one automatically would spend money nobody approved.
        const { data, error } = await this.db
            .from("aeo_prompts")
            .select("id, prompt_text, locale_country, locale_language, locale_city")
            .eq("business_id", businessId)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (error) throw new Error(`loadActivePrompts failed: ${error.message}`);
        if ((data ?? []).length === 0) return [];

        /*
         * The region comes from the business, not the prompt: a prompt's city is
         * already the business's city, and storing a second copy of the state
         * would let the two disagree. Read once for the whole set rather than
         * per row.
         *
         * A prompt whose city cannot be qualified keeps its city but carries no
         * region, and search adapters widen to the country instead of guessing
         * which "Kansas City" was meant.
         */
        const { data: business } = await this.db
            .from("businesses")
            .select("state")
            .eq("id", businessId)
            .single();

        return (data ?? []).map((row) => {
            const region = resolveRegionName(row.locale_country, business?.state);
            return {
                promptId: row.id,
                promptText: row.prompt_text,
                locale: {
                    country: row.locale_country,
                    language: row.locale_language,
                    ...(row.locale_city ? { city: row.locale_city } : {}),
                    ...(region ? { region } : {}),
                },
            };
        });
    }

    async consumedTodayByEngine(
        organizationId: string,
        usageDate: string
    ): Promise<Partial<Record<AnswerEngineId, number>>> {
        const { data, error } = await this.db
            .from("aeo_quota_reservations")
            .select("engine_id, state, reserved_units, settled_units, overrun_units")
            .eq("organization_id", organizationId)
            .eq("usage_date", usageDate);

        if (error) throw new Error(`consumedTodayByEngine failed: ${error.message}`);

        const totals: Partial<Record<AnswerEngineId, number>> = {};
        for (const row of data ?? []) {
            // Mirrors aeo_reserve_quota exactly: open claims count at full value,
            // settled ones at consumption INCLUDING overrun, released and expired
            // at nothing. Diverging from the RPC here would make the projection
            // disagree with the authority and produce fan-outs that get refused.
            const units =
                row.state === "reserved"
                    ? row.reserved_units
                    : row.state === "settled"
                      ? row.settled_units + row.overrun_units
                      : 0;
            if (units === 0) continue;
            const engine = row.engine_id as AnswerEngineId;
            totals[engine] = (totals[engine] ?? 0) + units;
        }
        return totals;
    }

    async createRun(input: {
        businessId: string;
        trigger: "scheduled" | "manual" | "backfill";
        scheduledFor: string | null;
    }): Promise<{ runId: string }> {
        const { data, error } = await this.db
            .from("aeo_runs")
            .insert({
                business_id: input.businessId,
                trigger: input.trigger,
                scheduled_for: input.scheduledFor,
                status: "running",
            })
            .select("id")
            .single();

        if (error) throw new Error(`createRun failed: ${error.message}`);
        return { runId: data.id };
    }

    async completeRun(
        runId: string,
        outcome: { status: RunStatus; errorMessage: string | null; at: string }
    ): Promise<void> {
        const { error } = await this.db
            .from("aeo_runs")
            .update({
                status: outcome.status,
                error_message: outcome.errorMessage,
                completed_at: outcome.at,
            })
            .eq("id", runId);

        if (error) throw new Error(`completeRun failed: ${error.message}`);
    }
}
