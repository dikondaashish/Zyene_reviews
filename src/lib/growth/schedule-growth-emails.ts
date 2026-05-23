import { logger } from "@/lib/logger";
import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";

export type GrowthSequenceKey = "trial_nurture" | "onboarding_drip" | "winback";

async function registerSequenceRun(
    sequenceKey: GrowthSequenceKey,
    email: string,
    organizationId?: string | null,
    userId?: string | null
): Promise<boolean> {
    const admin = createAdminClient();
    const { error } = await admin.from("growth_email_runs").insert({
        sequence_key: sequenceKey,
        recipient_email: email.toLowerCase(),
        organization_id: organizationId ?? null,
        user_id: userId ?? null,
        status: "active",
    });

    if (error?.code === "23505") {
        return false;
    }
    if (error) {
        logger.error({ err: error }, "[growth] Failed to register sequence run:");
        return false;
    }
    return true;
}

export async function scheduleTrialNurture(params: {
    email: string;
    userName: string;
    userId?: string;
    organizationId?: string;
}): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://app.zyenereviews.com";
    const ok = await registerSequenceRun("trial_nurture", params.email, params.organizationId, params.userId);
    if (!ok) return;

    await inngest.send({
        name: "growth/trial-nurture.start",
        data: {
            email: params.email,
            userName: params.userName,
            userId: params.userId,
            organizationId: params.organizationId,
            dashboardUrl: `${appUrl}/dashboard`,
        },
    });
}

export async function scheduleOnboardingDrip(params: {
    email: string;
    userName: string;
    organizationId: string;
}): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://app.zyenereviews.com";
    const ok = await registerSequenceRun("onboarding_drip", params.email, params.organizationId);
    if (!ok) return;

    await inngest.send({
        name: "growth/onboarding-drip.start",
        data: {
            email: params.email,
            userName: params.userName,
            organizationId: params.organizationId,
            dashboardUrl: `${appUrl}/dashboard`,
            billingUrl: `${appUrl}/settings/billing`,
        },
    });
}

export async function scheduleWinbackFollowUp(params: {
    email: string;
    userName: string;
    organizationId?: string;
}): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://app.zyenereviews.com";
    const ok = await registerSequenceRun("winback", params.email, params.organizationId);
    if (!ok) return;

    await inngest.send({
        name: "growth/winback.start",
        data: {
            email: params.email,
            userName: params.userName,
            rejoinUrl: `${appUrl}/settings/billing`,
        },
    });
}
