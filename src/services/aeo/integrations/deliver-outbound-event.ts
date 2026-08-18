import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { decryptAlertSecret } from "@/services/aeo/alerting/channel-secrets";
import { buildWebhookDelivery } from "./outbound-webhook";

type Admin = SupabaseClient<Database>;
export type OutboundEvent = "aeo.alert.created" | "aeo.run.completed";
type Endpoint = { id: string; endpoint_ciphertext: string; signing_secret_ciphertext: string };

export async function deliverOutboundEvent(db: Admin, input: {
    organizationId: string; businessId: string; event: OutboundEvent; sourceId: string; data: unknown;
}) {
    const endpoints = await db.from("aeo_webhook_endpoints" as never)
        .select("id, endpoint_ciphertext, signing_secret_ciphertext" as never)
        .eq("organization_id" as never, input.organizationId).eq("enabled" as never, true)
        .contains("event_types" as never, [input.event]);
    if (endpoints.error) return { delivered: 0, failed: 0 };
    let delivered = 0;
    let failed = 0;
    for (const endpoint of (endpoints.data ?? []) as unknown as Endpoint[]) {
        const pending = await db.from("aeo_webhook_deliveries" as never).insert({
            endpoint_id: endpoint.id, organization_id: input.organizationId, business_id: input.businessId,
            event_type: input.event, source_id: input.sourceId, status: "pending", attempt_count: 0,
        } as never).select("id" as never).maybeSingle() as unknown as {
            data: { id: string } | null; error: { code?: string; message: string } | null;
        };
        if (pending.error?.code === "23505" || !pending.data) continue;
        let responseStatus: number | null = null;
        let errorMessage: string | null = null;
        try {
            const url = decryptAlertSecret(endpoint.endpoint_ciphertext);
            const safety = await checkOriginIsPublic(url);
            if (!safety.safe || new URL(url).protocol !== "https:") throw new Error(safety.safe ? "HTTPS required" : safety.reason);
            const delivery = buildWebhookDelivery(decryptAlertSecret(endpoint.signing_secret_ciphertext),
                input.event, input.sourceId, input.data);
            const response = await fetch(url, { method: "POST", body: delivery.body, headers: delivery.headers,
                redirect: "error", signal: AbortSignal.timeout(10_000) });
            responseStatus = response.status;
            if (!response.ok) throw new Error(`Webhook returned HTTP ${response.status}`);
            delivered += 1;
        } catch (error) {
            failed += 1;
            errorMessage = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);
        }
        const success = errorMessage === null;
        await Promise.all([
            db.from("aeo_webhook_deliveries" as never).update({ status: success ? "success" : "failed",
                attempt_count: 1, response_status: responseStatus, error_message: errorMessage,
                delivered_at: success ? new Date().toISOString() : null } as never).eq("id" as never, pending.data.id),
            db.from("aeo_webhook_endpoints" as never).update({ last_delivery_at: new Date().toISOString(),
                last_delivery_status: success ? "success" : "failed" } as never).eq("id" as never, endpoint.id),
        ]);
    }
    return { delivered, failed };
}
