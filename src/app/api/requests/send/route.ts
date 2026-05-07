import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/services/twilio/send-sms";
import { sendEmail } from "@/services/resend/send-email";
import {
    reviewRequestEmail,
    reviewRequestEmailPlainText,
} from "@/services/resend/templates/review-request-email";
import { REVIEW_REQUEST_EMAIL_HEADERS } from "@/lib/email/review-request-signals";
import * as Sentry from "@sentry/nextjs";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { bumpCustomerAfterSend } from "@/lib/review-requests/bump-after-send";
import { inngest } from "@/services/inngest/client";
import { z } from "zod";

const sendRequestSchema = z
    .object({
        customerName: z.string().max(200).optional().nullable(),
        customerPhone: z.string().max(40).optional().nullable(),
        customerEmail: z.string().email().max(255).optional().nullable(),
        channel: z.enum(["sms", "email"]),
        businessId: z.string().uuid(),
        scheduledFor: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
        const ch = data.channel.toLowerCase();
        if (ch === "sms") {
            const digits = (data.customerPhone || "").replace(/\D/g, "");
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Valid customer phone is required for SMS (at least 10 digits).",
                    path: ["customerPhone"],
                });
            }
        }
        if (ch === "email") {
            if (!data.customerEmail || !z.string().email().safeParse(data.customerEmail).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Valid customer email is required for Email.",
                    path: ["customerEmail"],
                });
            }
        }
    });

function normalizePhone(raw: string | null | undefined): string | null {
    let phone = (raw || "").replace(/\D/g, "");
    if (!phone) return null;
    if (phone.length === 10) phone = "+1" + phone;
    else if (!phone.startsWith("+")) phone = "+" + phone;
    return phone;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const admindClient = createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        const { success: rateLimitSuccess } = await requestRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            return apiError("Rate limit exceeded. Try again later.", { status: 429 });
        }

        const parsed = sendRequestSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid request", { status: 400 });
        }

        const { customerName, customerPhone, customerEmail, channel: channelRaw, businessId, scheduledFor } =
            parsed.data;
        const channel = channelRaw.toLowerCase();

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
            console.error("Business fetch error:", businessError);
            if (businessError) Sentry.captureException(businessError, { tags: { route: "requests-send", step: "fetch_business" } });
            return apiError("Business not found or access denied", { status: 403 });
        }

        const orgId = business.organizations?.id;

        if (orgId) {
            const limitType =
                channel === "email" ? "email_requests" : channel === "link" ? "link_requests" : "sms_requests";
            const { allowed } = await checkLimit(orgId, limitType);
            if (!allowed) {
                return apiError("You've reached your monthly limit for this channel. Upgrade your plan.", {
                    status: 403,
                });
            }
        }

        const phoneNorm = normalizePhone(customerPhone || "");
        const emailNorm = (customerEmail || "").trim() || null;

        const frequencyCapDays = business.review_request_frequency_cap_days ?? 30;

        if (channel === "sms" && phoneNorm) {
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

        if (channel === "email" && emailNorm) {
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

        if (channel === "sms" && phoneNorm) {
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
        const isScheduled =
            scheduleDate &&
            !Number.isNaN(scheduleDate.getTime()) &&
            scheduleDate.getTime() > Date.now() + 60_000;

        if (!business.slug && !isScheduled) {
            return apiError(
                "Set a public profile link (slug) in Settings before sending review requests so the message includes your review page.",
                { status: 400 },
            );
        }

        const displayName = (customerName || "").trim() || "there";

        if (isScheduled && scheduleDate) {
            const { data: requestRecord, error: insertError } = await supabase
                .from("review_requests")
                .insert({
                    business_id: businessId,
                    customer_name: displayName === "there" ? null : displayName,
                    customer_phone: phoneNorm || null,
                    customer_email: emailNorm,
                    channel,
                    status: "queued",
                    scheduled_for: scheduleDate.toISOString(),
                    trigger_source: "manual",
                })
                .select()
                .single();

            if (insertError) {
                console.error("Insert scheduled request error:", insertError);
                Sentry.captureException(insertError, { tags: { route: "requests-send", step: "insert_scheduled" } });
                return apiError("Failed to schedule request", { status: 500 });
            }

            // Schedule background send via Inngest.
            await inngest.send({
                name: "review-request/scheduled.send",
                data: {
                    reviewRequestId: requestRecord.id,
                    sendAt: scheduleDate.toISOString(),
                    trigger: "api",
                },
            });

            return apiOk(requestRecord);
        }

        const { data: requestRecord, error: insertError } = await supabase
            .from("review_requests")
            .insert({
                business_id: businessId,
                customer_name: displayName === "there" ? null : displayName,
                customer_phone: phoneNorm || null,
                customer_email: emailNorm,
                channel,
                status: "sending",
                trigger_source: "manual",
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert Request Error:", insertError);
            Sentry.captureException(insertError, { tags: { route: "requests-send", step: "insert_request" } });
            return apiError("Failed to create request record", { status: 500 });
        }

        const requestId = requestRecord.id;
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const protocol = rootDomain.includes("localhost") ? "http" : "https";
        const slug = business.slug as string;
        const reviewLink = `${protocol}://${rootDomain}/${slug}?ref=${requestId}`;

        let sendStatus = "sent";
        let errorMessage: string | null = null;

        if (channel === "sms") {
            const messageBody = `Hi ${displayName}! Thanks for visiting ${business.name}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
            const result = await sendSMS(phoneNorm!, messageBody);
            if (!result.sent) {
                sendStatus = "failed";
                errorMessage = result.error ?? "SMS failed";
            }
        } else {
            const html = reviewRequestEmail({
                customerName: displayName,
                businessName: business.name || "us",
                reviewLink,
            });
            const subject = `How was your visit to ${business.name || "us"}?`;
            const bizRow = business as { email?: string | null };
            const businessEmail =
                typeof bizRow.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bizRow.email.trim())
                    ? bizRow.email.trim()
                    : undefined;
            const emailResult = await sendEmail({
                to: emailNorm!,
                subject,
                html,
                text: reviewRequestEmailPlainText({
                    customerName: displayName,
                    businessName: business.name || "us",
                    reviewLink,
                }),
                replyTo: businessEmail,
                headers: REVIEW_REQUEST_EMAIL_HEADERS,
            });
            if (!emailResult.sent) {
                sendStatus = "failed";
                errorMessage = emailResult.error ?? "Email failed";
            }
        }

        const sentAt = sendStatus === "sent" ? new Date().toISOString() : null;
        const statusPatch = {
            status: sendStatus,
            error_message: errorMessage,
            sent_at: sentAt,
            review_link: reviewLink,
        };

        const { data: updatedRows, error: updateError } = await supabase
            .from("review_requests")
            .update(statusPatch)
            .eq("id", requestId)
            .select();

        let finalRequestRecord = updatedRows?.[0] ?? null;

        if (updateError || !finalRequestRecord) {
            if (updateError) {
                console.error("Update Request Error:", updateError);
                Sentry.captureException(updateError, { tags: { route: "requests-send", step: "update_request" } });
            }
            const { data: adminRows, error: adminUpdateError } = await admindClient
                .from("review_requests")
                .update(statusPatch)
                .eq("id", requestId)
                .eq("business_id", businessId)
                .select();

            if (adminUpdateError || !adminRows?.[0]) {
                if (adminUpdateError) {
                    console.error("[requests/send] admin fallback update failed:", adminUpdateError);
                    Sentry.captureException(adminUpdateError, {
                        tags: { route: "requests-send", step: "update_request_admin" },
                    });
                }
                finalRequestRecord = { ...requestRecord, ...statusPatch };
            } else {
                finalRequestRecord = adminRows[0];
            }
        }

        if (sendStatus === "sent") {
            await bumpCustomerAfterSend(supabase, businessId, customerName ?? undefined, phoneNorm, emailNorm);
        }

        if (sendStatus === "failed") {
            const label = channel === "email" ? "email" : "SMS";
            return apiError(`Failed to send ${label}: ${errorMessage}`, { status: 500 });
        }

        return apiOk(finalRequestRecord);
    } catch (error: unknown) {
        console.error("Request API Error:", error);
        Sentry.captureException(error, { tags: { route: "requests-send" } });
        return apiError("An unexpected error occurred. Please try again.", { status: 500 });
    }
}
