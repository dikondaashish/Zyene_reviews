import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import { withStripeWebhookClaim } from "@/services/stripe/webhook-claim";

const migration = readFileSync(join(
    process.cwd(), "supabase/migrations/20260929231000_stripe_webhook_processing_claims.sql",
), "utf8");

function clientWithResponses(...responses: Array<{ data: unknown; error?: Error | null }>) {
    const rpc = vi.fn();
    for (const response of responses) rpc.mockResolvedValueOnce({ error: null, ...response });
    return { client: { rpc } as unknown as ReturnType<typeof createAdminClient>, rpc };
}

describe("Stripe webhook processing claim", () => {
    it("marks an event processed only after the handler succeeds", async () => {
        const { client, rpc } = clientWithResponses({ data: "claimed" }, { data: true });
        const handler = vi.fn().mockResolvedValue(undefined);
        expect(await withStripeWebhookClaim(client, "evt_success", handler)).toBe("processed");
        expect(handler).toHaveBeenCalledOnce();
        expect(rpc.mock.calls[1][0]).toBe("finish_stripe_webhook_event");
        expect(rpc.mock.calls[1][1]).toMatchObject({ p_succeeded: true });
    });

    it("releases a failed handler for Stripe retry", async () => {
        const { client, rpc } = clientWithResponses({ data: "claimed" }, { data: true });
        await expect(withStripeWebhookClaim(client, "evt_failed", async () => {
            throw new Error("billing write failed");
        })).rejects.toThrow("billing write failed");
        expect(rpc.mock.calls[1][1]).toMatchObject({ p_succeeded: false });
    });

    it("does not rerun an already processed event or a live concurrent claim", async () => {
        const handler = vi.fn();
        const processed = clientWithResponses({ data: "processed" });
        const processing = clientWithResponses({ data: "processing" });
        expect(await withStripeWebhookClaim(processed.client, "evt_done", handler))
            .toBe("already-processed");
        expect(await withStripeWebhookClaim(processing.client, "evt_active", handler))
            .toBe("in-progress");
        expect(handler).not.toHaveBeenCalled();
        expect(processed.rpc).toHaveBeenCalledTimes(1);
        expect(processing.rpc).toHaveBeenCalledTimes(1);
    });

    it("fails closed when the claim RPC or completion fails", async () => {
        const claimFailure = clientWithResponses({ data: null, error: new Error("DB unavailable") });
        await expect(withStripeWebhookClaim(claimFailure.client, "evt_error", vi.fn()))
            .rejects.toThrow("DB unavailable");
        const completionFailure = clientWithResponses({ data: "claimed" }, { data: false });
        await expect(withStripeWebhookClaim(completionFailure.client, "evt_lost", async () => {}))
            .rejects.toThrow("claim was lost");
        expect(completionFailure.rpc).toHaveBeenCalledTimes(2);
    });

    it("uses an atomic claim and service-role-only RPCs", () => {
        expect(migration).toContain("ON CONFLICT (event_id) DO UPDATE");
        expect(migration).toContain("status = 'failed'");
        expect(migration).not.toContain("status IN ('failed', 'legacy_unknown')");
        expect(migration).toContain("status = 'processing' AND claim_token = p_claim_token");
        expect(migration).toContain("REVOKE ALL ON FUNCTION public.claim_stripe_webhook_event(TEXT, UUID) FROM PUBLIC, anon, authenticated");
        expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.finish_stripe_webhook_event(TEXT, UUID, BOOLEAN) TO service_role");
    });

    it("does not replay legacy events with unknown completion state", async () => {
        const handler = vi.fn();
        const { client } = clientWithResponses({ data: "legacy_unknown" });
        await expect(withStripeWebhookClaim(client, "evt_old", handler))
            .rejects.toThrow("requires reconciliation");
        expect(handler).not.toHaveBeenCalled();
    });
});
