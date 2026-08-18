import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { decryptAlertSecret } from "@/services/aeo/alerting/channel-secrets";
import { buildWebhookDelivery } from "./outbound-webhook";

type Admin = SupabaseClient<Database>;
export type OutboundEvent = "aeo.alert.created" | "aeo.run.completed";
type Endpoint = { id: string; endpoint_ciphertext: string; signing_secret_ciphertext: string };
type Delivery = ReturnType<typeof buildWebhookDelivery>;

type RetryOptions = {
    maxAttempts?: number;
    retryDelayMs?: number;
    fetcher?: typeof fetch;
    sleep?: (milliseconds: number) => Promise<void>;
};

const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function postWebhookWithRetry(url: string, delivery: Delivery, options: RetryOptions = {}) {
    const maxAttempts = options.maxAttempts ?? 3;
    const retryDelayMs = options.retryDelayMs ?? 250;
    const fetcher = options.fetcher ?? fetch;
    const sleep = options.sleep ?? wait;
    let responseStatus: number | null = null;
    let errorMessage = "Webhook delivery failed";
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const response = await fetcher(url, { method: "POST", body: delivery.body, headers: delivery.headers,
                redirect: "error", signal: AbortSignal.timeout(10_000) });
            responseStatus = response.status;
            if (response.ok) return { success: true, attemptCount: attempt, responseStatus, errorMessage: null };
            errorMessage = `Webhook returned HTTP ${response.status}`;
            const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500;
            if (!retryable) return { success: false, attemptCount: attempt, responseStatus, errorMessage };
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : String(error);
        }
        if (attempt < maxAttempts) await sleep(retryDelayMs * attempt);
    }
    return { success: false, attemptCount: maxAttempts, responseStatus,
        errorMessage: errorMessage.slice(0, 500) };
}

export async function deliverOutboundEvent(db: Admin, input: {
    organizationId: string; businessId: string; event: OutboundEvent; sourceId: string; data: unknown;
}) {
    const endpoints = await db.from("aeo_webhook_endpoints" as never)
        .select("id, endpoint_ciphertext, signing_secret_ciphertext" as never)
        .eq("organization_id" as never, input.organizationId).eq("enabled" as never, true)
        .contains("event_types" as never, [input.event]);
    if (endpoints.error) throw new Error(`Webhook endpoint load failed: ${endpoints.error.message}`);
    let delivered = 0;
    let failed = 0;
    for (const endpoint of (endpoints.data ?? []) as unknown as Endpoint[]) {
        const pending = await db.from("aeo_webhook_deliveries" as never).insert({
            endpoint_id: endpoint.id, organization_id: input.organizationId, business_id: input.businessId,
            event_type: input.event, source_id: input.sourceId, status: "pending", attempt_count: 0,
        } as never).select("id" as never).maybeSingle() as unknown as {
            data: { id: string } | null; error: { code?: string; message: string } | null;
        };
        if (pending.error?.code === "23505") continue;
        if (pending.error || !pending.data) throw new Error(`Webhook delivery insert failed: ${pending.error?.message ?? "missing row"}`);
        let result: Awaited<ReturnType<typeof postWebhookWithRetry>>;
        try {
            const url = decryptAlertSecret(endpoint.endpoint_ciphertext);
            const safety = await checkOriginIsPublic(url);
            if (!safety.safe || new URL(url).protocol !== "https:") throw new Error(safety.safe ? "HTTPS required" : safety.reason);
            const delivery = buildWebhookDelivery(decryptAlertSecret(endpoint.signing_secret_ciphertext),
                input.event, input.sourceId, input.data);
            result = await postWebhookWithRetry(url, delivery);
        } catch (error) {
            result = { success: false, attemptCount: 1, responseStatus: null,
                errorMessage: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500) };
        }
        if (result.success) delivered += 1; else failed += 1;
        const [deliveryWrite, endpointWrite] = await Promise.all([
            db.from("aeo_webhook_deliveries" as never).update({ status: result.success ? "success" : "failed",
                attempt_count: result.attemptCount, response_status: result.responseStatus, error_message: result.errorMessage,
                delivered_at: result.success ? new Date().toISOString() : null } as never).eq("id" as never, pending.data.id),
            db.from("aeo_webhook_endpoints" as never).update({ last_delivery_at: new Date().toISOString(),
                last_delivery_status: result.success ? "success" : "failed" } as never).eq("id" as never, endpoint.id),
        ]);
        if (deliveryWrite.error || endpointWrite.error) {
            throw new Error(`Webhook delivery state write failed: ${deliveryWrite.error?.message ?? endpointWrite.error?.message}`);
        }
    }
    return { delivered, failed };
}
