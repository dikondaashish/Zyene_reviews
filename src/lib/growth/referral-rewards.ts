import "server-only";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import { sendEmail } from "@/services/resend/send-email";
import { referralRewardEmailHtml } from "@/lib/email/transactional-email-styles";

const claimSchema = z.object({
    customerId: z.string().startsWith("cus_"), cents: z.number().int().positive().max(100000),
    referrerUserId: z.string().uuid(), claimToken: z.string().uuid(), idempotencyKey: z.string().min(1).max(255),
});

/** System-only paid-conversion workflow. SQL verifies the stored referral/owner relationship. */
export async function processReferralConversionReward(refereeOrganizationId: string): Promise<void> {
    const rewardCents = Number(process.env.REFERRAL_REWARD_CENTS ?? "2999");
    if (rewardCents === 0) return;
    if (!Number.isSafeInteger(rewardCents) || rewardCents < 1 || rewardCents > 100000) {
        throw new Error("Invalid referral reward amount");
    }
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("claim_referral_conversion_reward" as never, {
        p_referee_id: refereeOrganizationId, p_reward_cents: rewardCents,
    } as never);
    if (error) throw error;
    if (data === null) return;
    const claim = claimSchema.parse(data);

    // Retry the exact frozen payload/key, even if configuration changes. The SQL
    // claim refuses ambiguous retries after Stripe's safe idempotency window.
    await stripe.customers.createBalanceTransaction(claim.customerId, {
        amount: -claim.cents, currency: "usd", description: "Referral reward - 1 month credit (Phase 7)",
    }, { idempotencyKey: claim.idempotencyKey });
    const finished = await admin.rpc("finish_referral_conversion_reward" as never, {
        p_referee_id: refereeOrganizationId, p_claim_token: claim.claimToken,
    } as never);
    if (finished.error) throw finished.error;
    if (finished.data !== true) throw new Error("Referral reward claim lost");

    // Notification failure is non-financial; the confirmed credit stays complete.
    try {
        const { data: referrerUser, error: userError } = await admin.from("users")
            .select("email, full_name").eq("id", claim.referrerUserId).maybeSingle();
        if (userError) throw userError;
        if (referrerUser?.email) {
            await sendEmail({ to: referrerUser.email, subject: "You earned a free month - referral reward",
                html: referralRewardEmailHtml(referrerUser.full_name || "there"),
                idempotencyKey: `${claim.idempotencyKey}:email` });
        }
    } catch (error) {
        logger.error({ err: error }, "[referral] reward notification failed");
    }
}
