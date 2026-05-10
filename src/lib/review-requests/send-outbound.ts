/**
 * Outbound review-request send used by every public/programmatic entry point
 * (Developer API `/api/v1/requests/send`, Zapier `/api/webhooks/generic`, etc.).
 *
 * Mirrors the guarantees of the dashboard `/api/requests/send` route:
 *   - Plan limit enforcement (SMS/Email/Link, or both for channel="both")
 *   - Opt-out + frequency-cap checks
 *   - Phone normalization (E.164-ish)
 *   - Same review-capture domain link the dashboard sends
 *   - Partial success for channel="both" (status=sent if either leg succeeds)
 *   - Customer counter bumps for the legs that actually went out
 *   - Stores `review_link`, `resend_email_id`, `trigger_source`
 */

import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/services/twilio/send-sms";
import { sendEmail, buildFromLine } from "@/services/resend/send-email";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import {
    bumpCustomerAfterSend,
    type BumpAfterSendLegs,
} from "./bump-after-send";

export type OutboundChannel = "sms" | "email" | "link" | "both";

export type OutboundTriggerSource =
    | "manual"
    | "campaign"
    | "pos_square"
    | "zapier"
    | "public_link";

export interface SendOutboundReviewRequestInput {
    businessId: string;
    channel: OutboundChannel;
    customerName?: string | null;
    /** Raw phone string; normalization is applied here. */
    customerPhone?: string | null;
    customerEmail?: string | null;
    /** Defaults to "zapier" — programmatic sends look like POS/Zapier flows. */
    triggerSource?: OutboundTriggerSource;
    /** Optional pre-built admin client (handy for tests or repeated calls). */
    admin?: SupabaseClient;
}

export type SendOutboundReviewRequestResult =
    | {
          success: true;
          requestId: string;
          status: "sent";
          channel: OutboundChannel;
          reviewLink: string;
          errorMessage: string | null;
      }
    | {
          success: false;
          requestId: string | null;
          status: "failed";
          channel: OutboundChannel;
          reviewLink: string | null;
          errorMessage: string;
          /** HTTP-style code so callers can map: 400/403/404/500. */
          code: 400 | 403 | 404 | 500;
      };

function normalizePhone(raw: string | null | undefined): string | null {
    let phone = (raw || "").replace(/\D/g, "");
    if (!phone) return null;
    if (phone.length === 10) phone = "+1" + phone;
    else if (!phone.startsWith("+")) phone = "+" + phone;
    return phone;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fail(
    code: 400 | 403 | 404 | 500,
    channel: OutboundChannel,
    message: string,
    requestId: string | null = null,
    reviewLink: string | null = null,
): SendOutboundReviewRequestResult {
    return {
        success: false,
        requestId,
        status: "failed",
        channel,
        reviewLink,
        errorMessage: message,
        code,
    };
}

export async function sendOutboundReviewRequest(
    input: SendOutboundReviewRequestInput,
): Promise<SendOutboundReviewRequestResult> {
    const admin = input.admin ?? createAdminClient();
    const channel = input.channel;
    const triggerSource: OutboundTriggerSource = input.triggerSource ?? "zapier";

    const customerNameTrim = (input.customerName || "").trim();
    const rawPhoneDigits = (input.customerPhone || "").replace(/\D/g, "");
    const phoneNorm = normalizePhone(input.customerPhone);
    const emailRaw = (input.customerEmail || "").trim();
    const emailNorm = emailRaw && isValidEmail(emailRaw) ? emailRaw : null;

    // ── Channel-specific input validation ──────────────────────────────
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

    // ── Load business + org ────────────────────────────────────────────
    const { data: business, error: bizErr } = await admin
        .from("businesses")
        .select(
            "id, name, slug, email, sender_name, review_request_frequency_cap_days, organization_id",
        )
        .eq("id", input.businessId)
        .maybeSingle();

    if (bizErr || !business) {
        return fail(404, channel, "Business not found.");
    }

    const b = business as {
        id: string;
        name: string | null;
        slug: string | null;
        email: string | null;
        sender_name: string | null;
        review_request_frequency_cap_days: number | null;
        organization_id: string | null;
    };

    if (!b.slug) {
        return fail(
            400,
            channel,
            "Set a public profile slug in Settings before sending review requests.",
        );
    }

    // ── Plan limits ────────────────────────────────────────────────────
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

    const frequencyCapDays = b.review_request_frequency_cap_days ?? 30;

    // ── Opt-outs + frequency caps ──────────────────────────────────────
    if ((channel === "sms" || channel === "both") && phoneNorm) {
        const { data: contact } = await admin
            .from("customers")
            .select("last_request_sent_at, is_opted_out")
            .eq("business_id", b.id)
            .eq("phone", phoneNorm)
            .maybeSingle();

        if (contact?.is_opted_out) {
            return fail(400, channel, "This contact opted out of review requests.");
        }
        if (contact?.last_request_sent_at) {
            const lastSent = new Date(contact.last_request_sent_at);
            const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
            if (diffDays < frequencyCapDays) {
                return fail(
                    400,
                    channel,
                    `Already sent to this contact recently. Cap is ${frequencyCapDays} days.`,
                );
            }
        }

        const { data: smsOptOut } = await admin
            .from("sms_opt_outs")
            .select("id")
            .eq("phone_number", phoneNorm)
            .maybeSingle();
        if (smsOptOut) {
            return fail(400, channel, "Customer has opted out of SMS.");
        }
    }

    if ((channel === "email" || channel === "both") && emailNorm) {
        const { data: contact } = await admin
            .from("customers")
            .select("last_request_sent_at, is_opted_out")
            .eq("business_id", b.id)
            .eq("email", emailNorm)
            .maybeSingle();

        if (contact?.is_opted_out) {
            return fail(400, channel, "This contact opted out of review requests.");
        }
        if (contact?.last_request_sent_at) {
            const lastSent = new Date(contact.last_request_sent_at);
            const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
            if (diffDays < frequencyCapDays) {
                return fail(
                    400,
                    channel,
                    `Already sent to this contact recently. Cap is ${frequencyCapDays} days.`,
                );
            }
        }
    }

    // ── Insert pending row (sending status) ────────────────────────────
    const requestId = randomUUID();
    const displayName = customerNameTrim || "there";

    const { error: insertError } = await admin.from("review_requests").insert({
        id: requestId,
        business_id: b.id,
        customer_name: customerNameTrim || null,
        customer_phone: phoneNorm,
        customer_email: emailNorm,
        channel,
        status: channel === "link" ? "sent" : "sending",
        trigger_source: triggerSource,
    });

    if (insertError) {
        console.error("[send-outbound] insert review_request:", insertError);
        return fail(500, channel, "Failed to create review request.");
    }

    // ── Build review link (uses the same capture domain as the dashboard) ─
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const captureDomain = rootDomain.includes("localhost")
        ? rootDomain
        : process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com";
    const reviewLink = `${protocol}://${captureDomain}/${b.slug}?ref=${requestId}`;

    // ── Pure link channel: nothing more to send ────────────────────────
    if (channel === "link") {
        const sentAt = new Date().toISOString();
        await admin
            .from("review_requests")
            .update({
                review_link: reviewLink,
                sent_at: sentAt,
                status: "sent",
            })
            .eq("id", requestId);
        return {
            success: true,
            requestId,
            status: "sent",
            channel,
            reviewLink,
            errorMessage: null,
        };
    }

    // ── Send via Twilio / Resend ───────────────────────────────────────
    const businessName = b.name || "us";
    const senderName = (b.sender_name || "").trim() || undefined;
    const businessEmail =
        typeof b.email === "string" && isValidEmail(b.email.trim()) ? b.email.trim() : undefined;
    const subject = `Quick question about your visit to ${businessName}`;

    let sendStatus: "sent" | "failed" = "sent";
    let errorMessage: string | null = null;
    let resendEmailId: string | null = null;
    let bumpLegs: BumpAfterSendLegs | undefined;

    if (channel === "sms" && phoneNorm) {
        const messageBody = `Hi ${displayName}! Thanks for visiting ${businessName}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
        const r = await sendSMS(phoneNorm, messageBody);
        if (!r.sent) {
            sendStatus = "failed";
            errorMessage = r.error ?? "SMS failed";
        }
    } else if (channel === "email" && emailNorm) {
        const html = reviewRequestEmail({
            customerName: displayName,
            businessName,
            reviewLink,
            senderName,
        });
        const r = await sendEmail({
            to: emailNorm,
            subject,
            html,
            text: reviewRequestEmailPlainText({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            }),
            from: buildFromLine({ senderName, businessName }),
            replyTo: businessEmail,
            headers: REVIEW_REQUEST_EMAIL_HEADERS,
        });
        if (!r.sent) {
            sendStatus = "failed";
            errorMessage = r.error ?? "Email failed";
        } else {
            resendEmailId = r.id ?? null;
        }
    } else if (channel === "both" && phoneNorm && emailNorm) {
        const messageBody = `Hi ${displayName}! Thanks for visiting ${businessName}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
        const smsR = await sendSMS(phoneNorm, messageBody);

        const html = reviewRequestEmail({
            customerName: displayName,
            businessName,
            reviewLink,
            senderName,
        });
        const emailR = await sendEmail({
            to: emailNorm,
            subject,
            html,
            text: reviewRequestEmailPlainText({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            }),
            from: buildFromLine({ senderName, businessName }),
            replyTo: businessEmail,
            headers: REVIEW_REQUEST_EMAIL_HEADERS,
        });

        const smsOk = smsR.sent;
        const emailOk = emailR.sent;
        if (!smsOk && !emailOk) {
            sendStatus = "failed";
            errorMessage = [
                `SMS: ${smsR.error ?? "failed"}`,
                `Email: ${emailR.error ?? "failed"}`,
            ].join(". ");
        } else {
            sendStatus = "sent";
            bumpLegs = { phone: smsOk, email: emailOk };
            if (!smsOk || !emailOk) {
                const parts: string[] = [];
                if (!smsOk) parts.push(`SMS did not send: ${smsR.error ?? "failed"}`);
                if (!emailOk) parts.push(`Email did not send: ${emailR.error ?? "failed"}`);
                errorMessage = parts.join(" ");
            }
            if (emailOk && emailR.id) resendEmailId = emailR.id;
        }
    }

    // ── Persist final state ────────────────────────────────────────────
    const sentAt = sendStatus === "sent" ? new Date().toISOString() : null;
    const patch: Record<string, unknown> = {
        status: sendStatus,
        error_message: errorMessage,
        sent_at: sentAt,
        review_link: reviewLink,
    };
    if (resendEmailId) patch.resend_email_id = resendEmailId;

    const { error: updateError } = await admin
        .from("review_requests")
        .update(patch)
        .eq("id", requestId)
        .eq("business_id", b.id);

    if (updateError) {
        console.error("[send-outbound] update review_request:", updateError);
    }

    // ── Bump customers for the legs that actually went out ─────────────
    if (sendStatus === "sent") {
        await bumpCustomerAfterSend(
            admin,
            b.id,
            customerNameTrim || undefined,
            phoneNorm,
            emailNorm,
            bumpLegs,
        );
    }

    if (sendStatus === "failed") {
        return fail(500, channel, errorMessage ?? "Send failed.", requestId, reviewLink);
    }

    return {
        success: true,
        requestId,
        status: "sent",
        channel,
        reviewLink,
        errorMessage,
    };
}
