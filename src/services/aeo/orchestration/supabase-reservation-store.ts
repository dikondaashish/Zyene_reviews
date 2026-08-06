import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { ReservationStore, ReserveOutcome, ReserveRequest } from "./ports";

type Admin = SupabaseClient<Database>;

/**
 * The only sanctioned way to claim AEO quota.
 *
 * Every claim goes through the aeo_reserve_quota RPC rather than an INSERT,
 * because the allowance decision and the row have to be written under one lock.
 * A read-then-insert here would let two concurrent dispatches see the same
 * remaining balance and both proceed — which is exactly what the pure
 * planEngineBudget guard cannot prevent, and why it was demoted to projection.
 */
export class SupabaseReservationStore implements ReservationStore {
    constructor(private readonly db: Admin) {}

    async reserve(request: ReserveRequest): Promise<ReserveOutcome> {
        const { data, error } = await this.db.rpc("aeo_reserve_quota", {
            p_idempotency_key: request.idempotencyKey,
            p_organization_id: request.organizationId,
            p_engine_id: request.engineId,
            p_usage_date: request.usageDate,
            p_requested_units: request.requestedUnits,
            p_free_per_day: request.freePerDay,
            p_overage_authorised: request.overageAuthorised,
            // Omitted rather than passed as null: the parameter has a SQL DEFAULT,
            // so the generated type is optional, not nullable.
            ...(request.runId ? { p_run_id: request.runId } : {}),
        });

        // Fail loudly. A swallowed error here would be read as "no reservation",
        // and the caller would either skip real work or, worse, retry into a
        // second claim for a call that may already have gone out.
        if (error) throw new Error(`aeo_reserve_quota failed: ${error.message}`);

        const row = data?.[0];
        if (!row) throw new Error("aeo_reserve_quota returned no row");

        switch (row.outcome) {
            case "granted":
                return {
                    kind: "granted",
                    reservationId: row.reservation_id as string,
                    grantedUnits: row.granted_units,
                    billableUnits: row.billable_units,
                };
            case "partial":
                return {
                    kind: "partial",
                    reservationId: row.reservation_id as string,
                    grantedUnits: row.granted_units,
                    deferredUnits: row.deferred_units,
                };
            case "deferred":
                return { kind: "deferred", deferredUnits: row.deferred_units };
            case "existing": {
                const reservationId = row.reservation_id as string;
                // One extra read, only on the replay path. The RPC cannot report
                // this without a schema change, and it is the difference between
                // finishing interrupted work and paying twice for finished work.
                const { data: current, error: stateError } = await this.db
                    .from("aeo_quota_reservations")
                    .select("state, dispatched_at")
                    .eq("id", reservationId)
                    .single();
                if (stateError) {
                    throw new Error(`existing reservation lookup failed: ${stateError.message}`);
                }
                return {
                    kind: "existing",
                    reservationId,
                    grantedUnits: row.granted_units,
                    dispatchedAt: current.dispatched_at,
                    alreadySettled: current.state !== "reserved",
                };
            }
            default:
                throw new Error(`aeo_reserve_quota returned unknown outcome "${row.outcome}"`);
        }
    }

    async markDispatched(reservationId: string, at: string): Promise<{ dispatchAttempts: number }> {
        // UPDATE ... RETURNING inside the function, so concurrent attempts cannot
        // lose an increment the way a read-then-write would.
        const { data, error } = await this.db.rpc("aeo_mark_dispatched", {
            p_reservation_id: reservationId,
            p_at: at,
        });
        if (error) throw new Error(`aeo_mark_dispatched failed: ${error.message}`);
        return { dispatchAttempts: data as number };
    }

    async settle(
        reservationId: string,
        settlement: {
            settledUnits: number;
            overrunUnits: number;
            billableUnits: number;
            costMicroUsd: number;
            at: string;
        }
    ): Promise<void> {
        // Guarded on state so a double-settle updates zero rows rather than
        // overwriting a settled row — the accounting equivalent of a lost write.
        const { data, error } = await this.db
            .from("aeo_quota_reservations")
            .update({
                state: "settled",
                settled_units: settlement.settledUnits,
                overrun_units: settlement.overrunUnits,
                billable_units: settlement.billableUnits,
                cost_micro_usd: settlement.costMicroUsd,
                settled_at: settlement.at,
            })
            .eq("id", reservationId)
            .eq("state", "reserved")
            .select("id");

        if (error) throw new Error(`settle failed: ${error.message}`);
        if (!data || data.length === 0) {
            // Not silently tolerated. Either the reservation vanished or it was
            // already terminal; both mean our view of this unit's accounting is
            // wrong, and continuing would record spend against the wrong row.
            throw new Error(`settle matched no open reservation ${reservationId}`);
        }
    }

    async release(reservationId: string, at: string): Promise<void> {
        const { error } = await this.db
            .from("aeo_quota_reservations")
            .update({ state: "released", settled_at: at })
            .eq("id", reservationId)
            .eq("state", "reserved");
        if (error) throw new Error(`release failed: ${error.message}`);
    }
}
