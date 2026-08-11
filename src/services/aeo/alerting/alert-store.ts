import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/supabase/database.types";

type Admin = SupabaseClient<Database>;

export type AlertType = "visibility_drop" | "visibility_gain" | "technical_blocker" | "run_failure";
export type AlertSeverity = "critical" | "high" | "medium" | "low";

/**
 * F8.8 cooldown, per alert type — a second, coarser-grained noise guard on
 * top of the significance test (visibility) and the new-since-last-run diff
 * (technical). Independent of both: a bug or a manual re-run must not be
 * able to re-fire the same alert twice in one cooldown window regardless of
 * what the detection layer thinks it found.
 */
const COOLDOWN_DAYS: Record<AlertType, number> = {
    visibility_drop: 6,
    visibility_gain: 6,
    technical_blocker: 3,
    run_failure: 1,
};

export type NewAlertInput = {
    businessId: string;
    organizationId: string;
    alertType: AlertType;
    severity: AlertSeverity;
    promptId: string | null;
    engineId: string | null;
    title: string;
    detail: string;
    evidence: Json;
};

export class SupabaseAlertStore {
    constructor(private readonly db: Admin) {}

    private async wasRecentlyFired(input: NewAlertInput): Promise<boolean> {
        const cutoff = new Date(Date.now() - COOLDOWN_DAYS[input.alertType] * 86_400_000).toISOString();
        let query = this.db
            .from("aeo_alerts")
            .select("id")
            .eq("business_id", input.businessId)
            .eq("alert_type", input.alertType)
            .gte("created_at", cutoff)
            .limit(1);

        // SQL NULL != NULL — .eq(x, null) matches nothing, so a null key needs .is().
        query = input.promptId === null ? query.is("prompt_id", null) : query.eq("prompt_id", input.promptId);
        query = input.engineId === null ? query.is("engine_id", null) : query.eq("engine_id", input.engineId);

        const { data, error } = await query.maybeSingle();
        if (error) throw new Error(`wasRecentlyFired check failed: ${error.message}`);
        return data !== null;
    }

    /** Returns the new alert's id, or null when the cooldown suppressed it — a real, expected outcome, not an error. */
    async createIfNotCoolingDown(input: NewAlertInput): Promise<{ id: string } | null> {
        if (await this.wasRecentlyFired(input)) return null;

        const { data, error } = await this.db
            .from("aeo_alerts")
            .insert({
                business_id: input.businessId,
                organization_id: input.organizationId,
                alert_type: input.alertType,
                severity: input.severity,
                prompt_id: input.promptId,
                engine_id: input.engineId,
                title: input.title,
                detail: input.detail,
                evidence: input.evidence,
            })
            .select("id")
            .single();

        if (error) throw new Error(`aeo_alerts insert failed: ${error.message}`);
        return { id: data.id };
    }

    /** Everything not yet bundled into a digest for this business, oldest first — the order a reader expects to see them in. */
    async loadUndigested(businessId: string) {
        const { data, error } = await this.db
            .from("aeo_alerts")
            .select("id, alert_type, severity, prompt_id, engine_id, title, detail, evidence, created_at")
            .eq("business_id", businessId)
            .is("digest_sent_at", null)
            .is("muted_at", null)
            .order("created_at", { ascending: true });

        if (error) throw new Error(`loadUndigested failed: ${error.message}`);
        return data ?? [];
    }

    async markDigestSent(alertIds: readonly string[]): Promise<void> {
        if (alertIds.length === 0) return;
        const { error } = await this.db
            .from("aeo_alerts")
            .update({ digest_sent_at: new Date().toISOString() })
            .in("id", alertIds);
        if (error) throw new Error(`markDigestSent failed: ${error.message}`);
    }
}
