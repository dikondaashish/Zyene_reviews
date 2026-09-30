import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ rpc: vi.fn(), credit: vi.fn(), email: vi.fn(), from: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ rpc: m.rpc, from: m.from }) }));
vi.mock("@/services/stripe/client", () => ({ stripe: { customers: { createBalanceTransaction: m.credit } } }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.email }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { processReferralConversionReward } from "@/lib/growth/referral-rewards";

const referee = "10000000-0000-4000-8000-000000000001";
const claim = { customerId: "cus_referrer", cents: 2999, idempotencyKey: "referral-reward:fixture",
    referrerUserId: "20000000-0000-4000-8000-000000000004", claimToken: "90000000-0000-4000-8000-000000000001" };
beforeEach(() => {
    vi.resetAllMocks(); vi.stubEnv("REFERRAL_REWARD_CENTS", "2999");
    m.rpc.mockImplementation(async (name: string) => ({ data: name.startsWith("claim_") ? claim : true, error: null }));
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({
        data: { email: "fixture@example.test", full_name: "Fixture" }, error: null,
    }) };
    m.from.mockReturnValue(query);
});
afterEach(() => vi.unstubAllEnvs());

describe("referral credit retry boundaries", () => {
    it("uses the server-frozen customer, amount and provider key before recording success", async () => {
        vi.stubEnv("REFERRAL_REWARD_CENTS", "7000");
        await processReferralConversionReward(referee);
        expect(m.credit).toHaveBeenCalledWith("cus_referrer", expect.objectContaining({ amount: -2999 }),
            { idempotencyKey: claim.idempotencyKey });
        expect(m.rpc).toHaveBeenLastCalledWith("finish_referral_conversion_reward", {
            p_referee_id: referee, p_claim_token: claim.claimToken,
        });
        expect(m.credit.mock.invocationCallOrder[0]).toBeLessThan(m.rpc.mock.invocationCallOrder[1]);
        expect(m.email).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: `${claim.idempotencyKey}:email` }));
    });
    it("does not mark a failed Stripe credit as rewarded", async () => {
        m.credit.mockRejectedValue(new Error("Synthetic Stripe failure"));
        await expect(processReferralConversionReward(referee)).rejects.toThrow("Synthetic Stripe failure");
        expect(m.rpc).toHaveBeenCalledTimes(1); expect(m.email).not.toHaveBeenCalled();
    });
    it("retries an ambiguous database completion with the same provider key", async () => {
        m.rpc.mockResolvedValueOnce({ data: claim, error: null })
            .mockResolvedValueOnce({ data: null, error: new Error("Synthetic completion failure") });
        await expect(processReferralConversionReward(referee)).rejects.toThrow("Synthetic completion failure");
        await processReferralConversionReward(referee);
        expect(m.credit).toHaveBeenCalledTimes(2);
        expect(m.credit.mock.calls[0]).toEqual(m.credit.mock.calls[1]);
    });
    it("does not contact Stripe for an ineligible or already-completed referral", async () => {
        m.rpc.mockResolvedValue({ data: null, error: null });
        await processReferralConversionReward(referee);
        expect(m.credit).not.toHaveBeenCalled(); expect(m.from).not.toHaveBeenCalled();
    });
    it("stops before Stripe on claim conflict or expired idempotency window", async () => {
        m.rpc.mockResolvedValue({ data: null, error: new Error("Referral reward requires Stripe reconciliation") });
        await expect(processReferralConversionReward(referee)).rejects.toThrow("reconciliation");
        expect(m.credit).not.toHaveBeenCalled();
    });
    it("keeps a lost completion claim retryable", async () => {
        m.rpc.mockResolvedValueOnce({ data: claim, error: null }).mockResolvedValueOnce({ data: false, error: null });
        await expect(processReferralConversionReward(referee)).rejects.toThrow("claim lost");
        expect(m.email).not.toHaveBeenCalled();
    });
    it("rejects invalid server reward configuration before any database or provider work", async () => {
        vi.stubEnv("REFERRAL_REWARD_CENTS", "NaN");
        await expect(processReferralConversionReward(referee)).rejects.toThrow("Invalid referral");
        expect(m.rpc).not.toHaveBeenCalled(); expect(m.credit).not.toHaveBeenCalled();
    });
});
