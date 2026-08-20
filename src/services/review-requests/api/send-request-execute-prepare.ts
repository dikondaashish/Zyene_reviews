import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { checkLimit } from "@/lib/stripe/check-limits";
import * as Sentry from "@sentry/nextjs";
import { apiError } from "@/app/api/_shared/responses";
import {
    normalizeCustomerEmail,
    normalizeCustomerPhone,
} from "@/lib/customers/identity";

export type SendRequestPrepared = {
    supabase: SupabaseClient;
    admindClient: SupabaseClient;
    user: User;
    business: Record<string, unknown>;
    businessId: string;
    phoneNorm: string | null;
    emailNorm: string | null;
    channel: string;
    displayName: string;
    isScheduled: boolean;
    scheduleDate: Date | null;
    customerName?: string | null;
};

export async function prepareExecuteSendReviewRequest(params: {
    supabase: SupabaseClient;
    admindClient: SupabaseClient;
    user: User;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    channel: string;
    businessId: string;
    scheduledFor?: string | null;
}): Promise<SendRequestPrepared | ReturnType<typeof apiError>> {
    const { supabase, admindClient, user, customerName, customerPhone, customerEmail, channel, businessId, scheduledFor } =
        params;

    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select(
            `
            *,
            organizations (
                id,
                plan,
                organization_members!inner(user_id)
            )
        `,
        )
        .eq("id", businessId)
        .eq("organizations.organization_members.user_id", user.id)
        .single();

    if (businessError || !business) {
        logger.error({ err: businessError }, "Business fetch error:");
        if (businessError) Sentry.captureException(businessError, { tags: { route: "requests-send", step: "fetch_business" } });
        return apiError("Business not found or access denied", { status: 403 });
    }

    const orgId = (business as { organizations?: { id?: string } }).organizations?.id;

    if (orgId) {
        if (channel === "both") {
            const [smsCap, emailCap] = await Promise.all([
                checkLimit(orgId, "sms_requests"),
                checkLimit(orgId, "email_requests"),
            ]);
            if (!smsCap.allowed || !emailCap.allowed) {
                return apiError(
                    "You've reached your monthly limit for SMS and/or email. Upgrade your plan or choose a single channel.",
                    { status: 403 },
                );
            }
        } else {
            const limitType =
                channel === "email" ? "email_requests" : channel === "link" ? "link_requests" : "sms_requests";
            const { allowed } = await checkLimit(orgId, limitType);
            if (!allowed) {
                return apiError("You've reached your monthly limit for this channel. Upgrade your plan.", {
                    status: 403,
                });
            }
        }
    }

    const phoneNorm = normalizeCustomerPhone(customerPhone);
    const emailNorm = normalizeCustomerEmail(customerEmail);
    const frequencyCapDays =
        (business as { review_request_frequency_cap_days?: number | null }).review_request_frequency_cap_days ?? 30;

    if ((channel === "sms" || channel === "both") && phoneNorm) {
        const { data: contact } = await supabase
            .from("customers")
            .select("last_request_sent_at, is_opted_out")
            .eq("business_id", businessId)
            .eq("phone", phoneNorm)
            .maybeSingle();

        if (contact?.is_opted_out) {
            return apiError("This contact opted out of review requests.", { status: 400 });
        }

        if (contact?.last_request_sent_at) {
            const lastSent = new Date(contact.last_request_sent_at);
            const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
            if (diffDays < frequencyCapDays) {
                return apiError(`Already sent to this customer recently. Cap is ${frequencyCapDays} days.`, {
                    status: 400,
                });
            }
        }
    }

    if ((channel === "email" || channel === "both") && emailNorm) {
        const { data: contact } = await supabase
            .from("customers")
            .select("last_request_sent_at, is_opted_out")
            .eq("business_id", businessId)
            .eq("email", emailNorm)
            .maybeSingle();

        if (contact?.is_opted_out) {
            return apiError("This contact opted out of review requests.", { status: 400 });
        }

        if (contact?.last_request_sent_at) {
            const lastSent = new Date(contact.last_request_sent_at);
            const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
            if (diffDays < frequencyCapDays) {
                return apiError(`Already sent to this customer recently. Cap is ${frequencyCapDays} days.`, {
                    status: 400,
                });
            }
        }
    }

    if ((channel === "sms" || channel === "both") && phoneNorm) {
        const { data: optOut } = await admindClient
            .from("sms_opt_outs")
            .select("id")
            .eq("phone_number", phoneNorm)
            .maybeSingle();

        if (optOut) {
            return apiError("Customer has opted out of SMS", { status: 400 });
        }
    }

    const scheduleDate = scheduledFor ? new Date(scheduledFor) : null;
    const isScheduled = Boolean(
        scheduleDate &&
            !Number.isNaN(scheduleDate.getTime()) &&
            scheduleDate.getTime() > Date.now() + 60_000,
    );

    if (!(business as { slug?: string | null }).slug && !isScheduled) {
        return apiError(
            "Set a public profile link (slug) in Settings before sending review requests so the message includes your review page.",
            { status: 400 },
        );
    }

    const displayName = (customerName || "").trim() || "there";

    return {
        supabase,
        admindClient,
        user,
        business: business as Record<string, unknown>,
        businessId,
        phoneNorm,
        emailNorm,
        channel,
        displayName,
        isScheduled,
        scheduleDate: isScheduled ? scheduleDate : null,
        customerName,
    };
}
