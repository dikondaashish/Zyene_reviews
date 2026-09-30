import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/db/supabase/admin";

type WebhookClient = ReturnType<typeof createAdminClient>;

async function callClaim(
    client: WebhookClient,
    eventId: string,
    claimToken: string,
): Promise<string> {
    const { data, error } = await client.rpc("claim_stripe_webhook_event" as never, {
        p_event_id: eventId,
        p_claim_token: claimToken,
    } as never);
    if (error) throw error;
    if (typeof data !== "string") throw new Error("Invalid Stripe webhook claim response");
    return data;
}

async function finishClaim(
    client: WebhookClient,
    eventId: string,
    claimToken: string,
    succeeded: boolean,
): Promise<void> {
    const { data, error } = await client.rpc("finish_stripe_webhook_event" as never, {
        p_event_id: eventId,
        p_claim_token: claimToken,
        p_succeeded: succeeded,
    } as never);
    if (error) throw error;
    if (data !== true) throw new Error("Stripe webhook claim was lost");
}

export async function withStripeWebhookClaim(
    client: WebhookClient,
    eventId: string,
    handler: () => Promise<void>,
): Promise<"processed" | "already-processed" | "in-progress"> {
    const claimToken = randomUUID();
    const status = await callClaim(client, eventId, claimToken);
    if (status === "processed") return "already-processed";
    if (status === "processing") return "in-progress";
    if (status === "legacy_unknown") throw new Error("Legacy Stripe event requires reconciliation");
    if (status !== "claimed") throw new Error("Unexpected Stripe webhook claim status");

    try {
        await handler();
    } catch (error) {
        try {
            await finishClaim(client, eventId, claimToken, false);
        } catch {
            // The lease expires; the original error must still trigger Stripe retry.
        }
        throw error;
    }

    await finishClaim(client, eventId, claimToken, true);
    return "processed";
}
