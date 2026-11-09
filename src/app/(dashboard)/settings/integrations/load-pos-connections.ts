import type { createClient } from "@/lib/db/supabase/server";
import type { CloverConnectionSummary } from "@/components/integrations/clover-card";
import type { SquareConnectionSummary } from "@/components/integrations/square-card";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type LastEventRow = { status: string; customer_email: string | null; created_at: string } | null;

function toLastEvent(row: LastEventRow) {
    return row
        ? { status: row.status, customerEmail: row.customer_email, createdAt: row.created_at }
        : null;
}

/** Active (not disconnected) Square + Clover connections with their latest payment event. */
export async function loadPosConnections(
    supabase: Supabase,
    businessId: string,
): Promise<{ clover: CloverConnectionSummary; square: SquareConnectionSummary }> {
    const [cloverResult, cloverEventResult, squareResult, squareEventResult] = await Promise.all([
        supabase
            .from("clover_connections")
            .select("merchant_id, environment, connected_at, auto_send_enabled")
            .eq("business_id", businessId)
            .is("disconnected_at", null)
            .maybeSingle(),
        supabase
            .from("clover_payment_events")
            .select("status, customer_email, created_at")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from("square_connections")
            .select("merchant_id, environment, connected_at, auto_send_enabled")
            .eq("business_id", businessId)
            .is("disconnected_at", null)
            .maybeSingle(),
        supabase
            .from("square_payment_events")
            .select("status, customer_email, created_at")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    const cloverRow = cloverResult.data;
    const squareRow = squareResult.data;

    return {
        clover: cloverRow
            ? {
                  merchantId: cloverRow.merchant_id,
                  environment: cloverRow.environment,
                  connectedAt: cloverRow.connected_at,
                  autoSendEnabled: cloverRow.auto_send_enabled,
                  lastEvent: toLastEvent(cloverEventResult.data),
              }
            : null,
        square: squareRow
            ? {
                  merchantId: squareRow.merchant_id,
                  environment: squareRow.environment,
                  connectedAt: squareRow.connected_at,
                  autoSendEnabled: squareRow.auto_send_enabled,
                  lastEvent: toLastEvent(squareEventResult.data),
              }
            : null,
    };
}
