import type { SupabaseClient } from "@supabase/supabase-js";
import { checkLimit } from "@/lib/stripe/check-limits";
import type { BusinessRow } from "./scheduled-queue-types";
import { patchRequest } from "./scheduled-queue-patch";

export async function loadScheduledSendBusiness(
    admin: SupabaseClient,
    businessId: string,
    requestId: string,
    channel: string,
): Promise<"failed" | BusinessRow> {
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

    return b;
}
