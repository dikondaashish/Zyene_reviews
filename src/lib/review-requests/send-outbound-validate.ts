import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { blockedReason, checkReviewRequestSend } from "@/lib/review-requests/send-guard";
import { channelsFor } from "@/lib/review-requests/dispatch-review-request";
import {
    fail,
    isValidEmail,
    normalizePhone,
    type OutboundChannel,
    type OutboundTriggerSource,
    type SendOutboundReviewRequestInput,
    type SendOutboundReviewRequestResult,
} from "./send-outbound-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type OutboundBusinessRow = {
    id: string;
    name: string | null;
    slug: string | null;
    email: string | null;
    sender_name: string | null;
    review_request_frequency_cap_days: number | null;
    organization_id: string | null;
    timezone: string | null;
};

export type OutboundPrepared = {
    admin: SupabaseClient;
    channel: OutboundChannel;
    triggerSource: OutboundTriggerSource;
    customerNameTrim: string;
    phoneNorm: string | null;
    emailNorm: string | null;
    b: OutboundBusinessRow;
    timezone: string | null;
};

export async function prepareOutboundReviewRequest(
    input: SendOutboundReviewRequestInput,
): Promise<SendOutboundReviewRequestResult | OutboundPrepared> {
    const admin = input.admin ?? createAdminClient();
    const channel = input.channel;
    const triggerSource: OutboundTriggerSource = input.triggerSource ?? "zapier";

    const customerNameTrim = (input.customerName || "").trim();
    const rawPhoneDigits = (input.customerPhone || "").replace(/\D/g, "");
    const phoneNorm = normalizePhone(input.customerPhone);
    const emailRaw = (input.customerEmail || "").trim();
    const emailNorm = emailRaw && isValidEmail(emailRaw) ? emailRaw : null;

    if (channel === "sms") {
        if (!phoneNorm || rawPhoneDigits.length < 10) {
            return fail(400, channel, "Valid phone number is required for SMS (at least 10 digits).");
        }
    } else if (channel === "email") {
        if (!emailNorm) {
            return fail(400, channel, "Valid customer email is required for Email.");
        }
    } else if (channel === "both") {
        if (!phoneNorm || rawPhoneDigits.length < 10) {
            return fail(400, channel, "Valid phone number is required when channel is 'both'.");
        }
        if (!emailNorm) {
            return fail(400, channel, "Valid email is required when channel is 'both'.");
        }
    }

    const { data: business, error: bizErr } = await admin
        .from("businesses")
        .select(
            "id, name, slug, email, sender_name, review_request_frequency_cap_days, organization_id, timezone",
        )
        .eq("id", input.businessId)
        .maybeSingle();

    if (bizErr || !business) {
        return fail(404, channel, "Business not found.");
    }

    const b = business as OutboundBusinessRow;

    if (!b.slug) {
        return fail(
            400,
            channel,
            "Set a public profile slug in Settings before sending review requests.",
        );
    }

    if (b.organization_id) {
        if (channel === "both") {
            const [smsCap, emailCap] = await Promise.all([
                checkLimit(b.organization_id, "sms_requests"),
                checkLimit(b.organization_id, "email_requests"),
            ]);
            if (!smsCap.allowed || !emailCap.allowed) {
                return fail(
                    403,
                    channel,
                    "Monthly limit reached for SMS and/or Email. Upgrade your plan or send a single channel.",
                );
            }
        } else {
            const limitType =
                channel === "email"
                    ? "email_requests"
                    : channel === "link"
                      ? "link_requests"
                      : "sms_requests";
            const { allowed } = await checkLimit(b.organization_id, limitType);
            if (!allowed) {
                return fail(
                    403,
                    channel,
                    "You've reached your monthly limit for this channel. Upgrade your plan.",
                );
            }
        }
    }

    // Same eligibility rules as the send itself (re-checked again right before sending).
    const guard = await checkReviewRequestSend(admin, {
        businessId: b.id,
        channels: channelsFor(channel),
        phone: phoneNorm,
        email: emailNorm,
        frequencyCap: "apply",
    });
    if (channel !== "link" && guard.allowed.length === 0) {
        return fail(400, channel, blockedReason(guard.blocked));
    }

    return {
        admin,
        channel,
        triggerSource,
        customerNameTrim,
        phoneNorm,
        emailNorm,
        b,
        timezone: b.timezone,
    };
}
