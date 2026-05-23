import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import { sendEmail } from "@/services/resend/send-email";
import { referralRewardEmailHtml } from "@/lib/email/transactional-email-styles";

/**
 * When a referred organization converts to paid, reward the referrer (1 free month credit).
 * Idempotent per referee org via referral_conversions row.
 */
export async function processReferralConversionReward(refereeOrganizationId: string): Promise<void> {
    const admin = createAdminClient();

    const { data: org } = await admin
        .from("organizations")
        .select("id, referred_by_user_id, plan_status, stripe_customer_id")
        .eq("id", refereeOrganizationId)
        .maybeSingle();

    if (!org?.referred_by_user_id || org.plan_status !== "active") {
        return;
    }

    const referrerUserId = org.referred_by_user_id;

    const { data: existing } = await admin
        .from("referral_conversions")
        .select("id, status")
        .eq("referee_organization_id", refereeOrganizationId)
        .maybeSingle();

    if (existing?.status === "rewarded") {
        return;
    }

    if (!existing) {
        const { error: insertErr } = await admin.from("referral_conversions").insert({
            referrer_user_id: referrerUserId,
            referee_organization_id: refereeOrganizationId,
            status: "converted",
            converted_at: new Date().toISOString(),
        });
        if (insertErr?.code === "23505") {
            return;
        }
        if (insertErr) {
            logger.error({ err: insertErr }, "[referral] insert conversion failed:");
            return;
        }
    } else if (existing.status === "pending") {
        await admin
            .from("referral_conversions")
            .update({ status: "converted", converted_at: new Date().toISOString() })
            .eq("id", existing.id);
    }

    const rewardCents = Number(process.env.REFERRAL_REWARD_CENTS ?? "2999");
    const { data: referrerMember } = await admin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", referrerUserId)
        .eq("role", "ORG_OWNER")
        .limit(1)
        .maybeSingle();

    let referrerCustomerId: string | null = null;
    if (referrerMember?.organization_id) {
        const { data: referrerOrg } = await admin
            .from("organizations")
            .select("stripe_customer_id")
            .eq("id", referrerMember.organization_id)
            .maybeSingle();
        referrerCustomerId = referrerOrg?.stripe_customer_id ?? null;
    }

    if (referrerCustomerId && rewardCents > 0) {
        try {
            await stripe.customers.createBalanceTransaction(referrerCustomerId, {
                amount: -rewardCents,
                currency: "usd",
                description: "Referral reward — 1 month credit (Phase 7)",
            });
        } catch (err) {
            logger.error({ err: err }, "[referral] Stripe balance credit failed:");
        }
    }

    await admin
        .from("referral_conversions")
        .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
        .eq("referee_organization_id", refereeOrganizationId);

    const { data: referrerUser } = await admin
        .from("users")
        .select("email, full_name")
        .eq("id", referrerUserId)
        .maybeSingle();

    if (referrerUser?.email) {
        const name = referrerUser.full_name || "there";
        try {
            await sendEmail({
                to: referrerUser.email,
                subject: "You earned a free month — referral reward",
                html: referralRewardEmailHtml(name),
            });
        } catch (err) {
            logger.error({ err: err }, "[referral] reward email failed:");
        }
    }
}
