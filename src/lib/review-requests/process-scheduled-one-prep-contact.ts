import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusinessRow, DueRow } from "./scheduled-queue-types";
import { patchRequest } from "./scheduled-queue-patch";
export type ScheduledSendContactFields = {
    channel: string;
    phoneNorm: string | null;
    emailNorm: string | null;
    displayName: string;
    reviewLink: string;
};

export async function validateScheduledSendContact(
    admin: SupabaseClient,
    row: DueRow,
    b: BusinessRow,
    businessId: string,
    requestId: string,
    channel: string,
): Promise<"failed" | ScheduledSendContactFields> {
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
        : process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com";
    const reviewLink = `${protocol}://${reviewCaptureDomain}/${slug}?ref=${requestId}`;

    return { channel, phoneNorm, emailNorm, displayName, reviewLink };
}
