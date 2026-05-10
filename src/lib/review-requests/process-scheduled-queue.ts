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
import * as Sentry from "@sentry/nextjs";
import { bumpCustomerAfterSend, type BumpAfterSendLegs } from "./bump-after-send";

type DueRow = {
    id: string;
    business_id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    channel: string;
};

type BusinessRow = {
    id: string;
    name: string | null;
    slug: string | null;
    email: string | null;
    sender_name: string | null;
    review_request_frequency_cap_days: number | null;
    organization_id: string;
};

async function patchRequest(
    admin: SupabaseClient,
    businessId: string,
    requestId: string,
    patch: Record<string, unknown>,
) {
    const { error } = await admin.from("review_requests").update(patch).eq("id", requestId).eq("business_id", businessId);
    if (error) {
        console.error("[scheduled-queue] patch review_requests:", error);
        Sentry.captureException(error, { tags: { route: "scheduled-review-queue", step: "patch" } });
    }
}

/**
 * Picks up manually scheduled review_requests (`queued` + `scheduled_for` in the past)
 * and sends them. Safe to run every few minutes (claims rows with queued→sending).
 */
export async function processDueScheduledReviewRequests(options: { limit?: number; admin?: SupabaseClient } = {}) {
    const admin = options.admin ?? createAdminClient();
    const limit = options.limit ?? 25;
    const nowIso = new Date().toISOString();

    const { data: due, error } = await admin
        .from("review_requests")
        .select("id, business_id, customer_name, customer_phone, customer_email, channel")
        .eq("status", "queued")
        .eq("trigger_source", "manual")
        .not("scheduled_for", "is", null)
        .lte("scheduled_for", nowIso)
        .order("scheduled_for", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("[scheduled-queue] list due:", error);
        Sentry.captureException(error, { tags: { route: "scheduled-review-queue", step: "list" } });
        throw error;
    }

    const results = { attempted: 0, sent: 0, failed: 0, skipped: 0 };

    for (const row of due ?? []) {
        results.attempted++;
        const outcome = await processOneScheduled(admin, row as DueRow);
        if (outcome === "sent") results.sent++;
        else if (outcome === "failed") results.failed++;
        else results.skipped++;
    }

    return results;
}

/**
 * Process a single scheduled request row (already selected as due).
 * Exported so Inngest can reuse the same send logic.
 */
export async function processOneScheduled(admin: SupabaseClient, row: DueRow): Promise<"sent" | "failed" | "skipped"> {
    const { data: claimed, error: claimErr } = await admin
        .from("review_requests")
        .update({ status: "processing" })
        .eq("id", row.id)
        .eq("status", "queued")
        .select("id, business_id, customer_name, customer_phone, customer_email, channel")
        .maybeSingle();

    if (claimErr || !claimed) {
        return "skipped";
    }

    const businessId = row.business_id;
    const requestId = row.id;
    const channel = (row.channel || "").toLowerCase();

    try {
        const { data: business, error: bizErr } = await admin
            .from("businesses")
            .select("id, name, slug, email, sender_name, review_request_frequency_cap_days, organization_id")
            .eq("id", businessId)
            .maybeSingle();

        if (bizErr || !business) {
            await patchRequest(admin, businessId, requestId, {
                status: "failed",
                error_message: "Business not found",
                sent_at: null,
            });
            return "failed";
        }

        const b = business as BusinessRow;
        const orgId = b.organization_id;

        if (orgId) {
            if (channel === "both") {
                const [smsL, emailL] = await Promise.all([
                    checkLimit(orgId, "sms_requests"),
                    checkLimit(orgId, "email_requests"),
                ]);
                if (!smsL.allowed || !emailL.allowed) {
                    await patchRequest(admin, businessId, requestId, {
                        status: "failed",
                        error_message: "SMS and/or email monthly limit reached at send time.",
                        sent_at: null,
                    });
                    return "failed";
                }
            } else {
                const limitType =
                    channel === "email" ? "email_requests" : channel === "link" ? "link_requests" : "sms_requests";
                const { allowed } = await checkLimit(orgId, limitType);
                if (!allowed) {
                    await patchRequest(admin, businessId, requestId, {
                        status: "failed",
                        error_message: "Monthly limit reached at send time.",
                        sent_at: null,
                    });
                    return "failed";
                }
            }
        }

        const phoneNorm = row.customer_phone?.trim() || null;
        const emailNorm = row.customer_email?.trim() || null;
        const frequencyCapDays = b.review_request_frequency_cap_days ?? 30;

        const needSms = channel === "sms" || channel === "both";
        const needEmail = channel === "email" || channel === "both";

        if (needSms) {
            const digits = (phoneNorm || "").replace(/\D/g, "");
            if (!phoneNorm || digits.length < 10) {
                await patchRequest(admin, businessId, requestId, {
                    status: "failed",
                    error_message: "Missing or invalid phone for SMS.",
                    sent_at: null,
                });
                return "failed";
            }

            const { data: contact } = await admin
                .from("customers")
                .select("last_request_sent_at, is_opted_out")
                .eq("business_id", businessId)
                .eq("phone", phoneNorm)
                .maybeSingle();

            if (contact?.is_opted_out) {
                await patchRequest(admin, businessId, requestId, {
                    status: "failed",
                    error_message: "Contact opted out of review requests.",
                    sent_at: null,
                });
                return "failed";
            }

            if (contact?.last_request_sent_at) {
                const lastSent = new Date(contact.last_request_sent_at);
                const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
                if (diffDays < frequencyCapDays) {
                    await patchRequest(admin, businessId, requestId, {
                        status: "failed",
                        error_message: `Frequency cap: already sent within ${frequencyCapDays} days.`,
                        sent_at: null,
                    });
                    return "failed";
                }
            }

            const { data: optOut } = await admin.from("sms_opt_outs").select("id").eq("phone_number", phoneNorm).maybeSingle();
            if (optOut) {
                await patchRequest(admin, businessId, requestId, {
                    status: "failed",
                    error_message: "Customer opted out of SMS.",
                    sent_at: null,
                });
                return "failed";
            }
        }

        if (needEmail) {
            if (!emailNorm) {
                await patchRequest(admin, businessId, requestId, {
                    status: "failed",
                    error_message: "Missing email address.",
                    sent_at: null,
                });
                return "failed";
            }

            const { data: contact } = await admin
                .from("customers")
                .select("last_request_sent_at, is_opted_out")
                .eq("business_id", businessId)
                .eq("email", emailNorm)
                .maybeSingle();

            if (contact?.is_opted_out) {
                await patchRequest(admin, businessId, requestId, {
                    status: "failed",
                    error_message: "Contact opted out of review requests.",
                    sent_at: null,
                });
                return "failed";
            }

            if (contact?.last_request_sent_at) {
                const lastSent = new Date(contact.last_request_sent_at);
                const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
                if (diffDays < frequencyCapDays) {
                    await patchRequest(admin, businessId, requestId, {
                        status: "failed",
                        error_message: `Frequency cap: already sent within ${frequencyCapDays} days.`,
                        sent_at: null,
                    });
                    return "failed";
                }
            }
        }

        if (!needSms && !needEmail) {
            await patchRequest(admin, businessId, requestId, {
                status: "failed",
                error_message: `Unsupported channel: ${channel}`,
                sent_at: null,
            });
            return "failed";
        }

        const slug = (b.slug || "").trim();
        if (!slug) {
            await patchRequest(admin, businessId, requestId, {
                status: "failed",
                error_message: "Set a public profile slug in Settings before scheduled sends can go out.",
                sent_at: null,
            });
            return "failed";
        }

        const displayName = (row.customer_name || "").trim() || "there";
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const protocol = rootDomain.includes("localhost") ? "http" : "https";
        const reviewCaptureDomain = rootDomain.includes("localhost")
            ? rootDomain
            : (process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com");
        const reviewLink = `${protocol}://${reviewCaptureDomain}/${slug}?ref=${requestId}`;

        let sendStatus: "sent" | "failed" = "sent";
        let errorMessage: string | null = null;
        let resendEmailId: string | null = null;
        let bumpLegs: BumpAfterSendLegs | undefined;

        if (channel === "sms" && phoneNorm) {
            const messageBody = `Hi ${displayName}! Thanks for visiting ${b.name || "us"}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
            const result = await sendSMS(phoneNorm, messageBody);
            if (!result.sent) {
                sendStatus = "failed";
                errorMessage = result.error ?? "SMS failed";
            }
        } else if (channel === "email" && emailNorm) {
            const businessName = b.name || "us";
            const senderName = (b.sender_name || "").trim() || undefined;
            const html = reviewRequestEmail({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            });
            const subject = `Quick question about your visit to ${businessName}`;
            const businessEmail =
                typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())
                    ? b.email.trim()
                    : undefined;
            const emailResult = await sendEmail({
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
            if (!emailResult.sent) {
                sendStatus = "failed";
                errorMessage = emailResult.error ?? "Email failed";
            } else {
                resendEmailId = emailResult.id ?? null;
            }
        } else if (channel === "both" && phoneNorm && emailNorm) {
            const businessName = b.name || "us";
            const senderName = (b.sender_name || "").trim() || undefined;
            const messageBody = `Hi ${displayName}! Thanks for visiting ${b.name || "us"}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
            const smsResult = await sendSMS(phoneNorm, messageBody);

            const html = reviewRequestEmail({
                customerName: displayName,
                businessName,
                reviewLink,
                senderName,
            });
            const subject = `Quick question about your visit to ${businessName}`;
            const businessEmail =
                typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())
                    ? b.email.trim()
                    : undefined;
            const emailResult = await sendEmail({
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

            const smsOk = smsResult.sent;
            const emailOk = emailResult.sent;
            if (!smsOk && !emailOk) {
                sendStatus = "failed";
                errorMessage = [
                    `SMS: ${smsResult.error ?? "failed"}`,
                    `Email: ${emailResult.error ?? "failed"}`,
                ].join(". ");
            } else {
                sendStatus = "sent";
                bumpLegs = { phone: smsOk, email: emailOk };
                if (!smsOk || !emailOk) {
                    const parts: string[] = [];
                    if (!smsOk) parts.push(`SMS did not send: ${smsResult.error ?? "failed"}`);
                    if (!emailOk) parts.push(`Email did not send: ${emailResult.error ?? "failed"}`);
                    errorMessage = parts.join(" ");
                }
                if (emailOk && emailResult.id) {
                    resendEmailId = emailResult.id;
                }
            }
        }

        const sentAt = sendStatus === "sent" ? new Date().toISOString() : null;
        await patchRequest(admin, businessId, requestId, {
            status: sendStatus,
            error_message: errorMessage,
            sent_at: sentAt,
            review_link: reviewLink,
            ...(resendEmailId ? { resend_email_id: resendEmailId } : {}),
        });

        if (sendStatus === "sent") {
            await bumpCustomerAfterSend(
                admin,
                businessId,
                row.customer_name ?? undefined,
                phoneNorm,
                emailNorm,
                bumpLegs,
            );
        }

        return sendStatus;
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unexpected error";
        console.error("[scheduled-queue] processOne:", e);
        Sentry.captureException(e, { tags: { route: "scheduled-review-queue", step: "processOne" } });
        await patchRequest(admin, businessId, requestId, {
            status: "failed",
            error_message: msg,
            sent_at: null,
        });
        return "failed";
    }
}
