import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { normalizeCustomerPhone } from "@/lib/customers/identity";
import { signedReviewCaptureLink } from "@/lib/review-requests/review-capture-url";
import { dispatchDashboardReviewChannels } from "@/lib/review-requests/review-request-dashboard-dispatch";
import { bumpCustomerAfterSend } from "@/lib/review-requests/bump-after-send";
import { deferReviewRequest, quietHoursReason } from "@/lib/review-requests/defer-request";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import { checkReviewRequestSend } from "@/lib/review-requests/send-guard";
import type { SupabaseClient } from "@supabase/supabase-js";

type CustomerRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
};

type BusinessRow = {
    id: string;
    name: string;
    slug: string | null;
    timezone: string | null;
    organizations: { id: string; plan: string | null };
};

type Outcome = "success" | "queued" | "fail" | "skipped";

/**
 * Bulk SMS review requests from the customers table. Every customer goes through the same
 * guarded dispatcher as other sends (channel switch, STOP, opt-out, test tag, frequency
 * cap, quiet hours, per-message claim), so a bulk send cannot bypass any rule.
 */
export async function runBulkReviewRequestAction(
    supabase: SupabaseClient,
    businessId: string,
    ids: string[]
) {
    const { data: business } = await supabase
        .from("businesses")
        .select("*, organizations(id, plan)")
        .eq("id", businessId)
        .single();

    if (!business) {
        return { status: 404 as const, body: { error: "Business not found" } };
    }
    const biz = business as unknown as BusinessRow;
    if (!biz.slug) {
        return { status: 400 as const, body: { error: "Set a public profile link (slug) in Settings before sending review requests." } };
    }

    const { data: customersToRequest } = await supabase
        .from("customers")
        .select("id, first_name, last_name, phone")
        .in("id", ids)
        .eq("business_id", businessId);

    if (!customersToRequest || customersToRequest.length === 0) {
        return { status: 400 as const, body: { error: "No valid customers found" } };
    }

    const adminClient = createAdminClient();
    const eligibleCustomers: CustomerRow[] = [];
    const skippedReasons: Record<string, string> = {};
    for (const customer of customersToRequest as CustomerRow[]) {
        const phone = normalizeCustomerPhone(customer.phone);
        const guard = await checkReviewRequestSend(adminClient, { businessId, channels: ["sms"], phone, frequencyCap: "apply" });
        if (guard.allowed.includes("sms")) eligibleCustomers.push({ ...customer, phone });
        else skippedReasons[customer.id] = guard.blocked[0]?.reason ?? "Not eligible";
    }
    if (eligibleCustomers.length === 0) {
        return {
            status: 400 as const,
            body: { error: "No eligible contacts: check opt-outs, test tags, phone numbers, SMS settings and the frequency cap", skippedReasons },
        };
    }

    const { allowed, remaining } = await checkLimit(biz.organizations.id, "sms_requests");
    if (!allowed) {
        return { status: 403 as const, body: { error: "Monthly limit reached" } };
    }

    const actualBatch = eligibleCustomers.slice(0, Math.min(eligibleCustomers.length, remaining));
    const outcomes: Outcome[] = [];
    for (const customer of actualBatch) outcomes.push(await sendOne(supabase, adminClient, biz, customer, skippedReasons));

    const failedIds = actualBatch.flatMap((customer, index) => outcomes[index] === "fail" ? [customer.id] : []);
    const attemptedIds = new Set(actualBatch.map(customer => customer.id));
    const skippedIds = ids.filter(id => !attemptedIds.has(id) || skippedReasons[id]);

    return {
        status: 200 as const,
        body: {
            success: true,
            sent: outcomes.filter((o) => o === "success").length,
            queued: outcomes.filter((o) => o === "queued").length,
            failed: failedIds.length,
            limitReached: actualBatch.length < eligibleCustomers.length,
            skipped: skippedIds.length,
            failedIds,
            skippedIds,
            skippedReasons,
        },
    };
}

async function sendOne(
    supabase: SupabaseClient, admin: SupabaseClient, biz: BusinessRow, customer: CustomerRow, skippedReasons: Record<string, string>,
): Promise<Outcome> {
    if (!customer.phone || !biz.slug) return "fail";
    try {
        const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
        const { data: requestRecord, error: insertReqError } = await supabase
            .from("review_requests")
            .insert({ business_id: biz.id, customer_name: customerName, customer_phone: customer.phone, channel: "sms", status: "sending" })
            .select("id")
            .single();
        if (insertReqError || !requestRecord) {
            logger.error({ err: insertReqError }, "Bulk insert review_request failed:");
            return "fail";
        }

        const reviewLink = signedReviewCaptureLink(biz.slug, requestRecord.id, biz.id);
        const result = await dispatchDashboardReviewChannels(admin, {
            requestId: requestRecord.id, businessId: biz.id, channel: "sms", phoneNorm: customer.phone, emailNorm: null,
            displayName: customer.first_name || "there", businessName: biz.name, senderName: undefined, businessEmail: undefined,
            reviewLink, subject: reviewRequestSubject(biz.name, false, customer.first_name),
        });

        if (result.sendStatus === "deferred" && result.deferUntil) {
            await deferReviewRequest(admin, { requestId: requestRecord.id, businessId: biz.id, until: result.deferUntil,
                reason: quietHoursReason(result.deferUntil, biz.timezone) });
            await admin.from("review_requests").update({ review_link: reviewLink }).eq("id", requestRecord.id).eq("business_id", biz.id);
            return "queued";
        }
        const status = result.sendStatus === "deferred" ? "skipped" : result.sendStatus;
        await admin.from("review_requests").update({
            status, error_message: result.errorMessage, sent_at: status === "sent" ? new Date().toISOString() : null,
            review_link: reviewLink, sms_status: result.smsLegStatus,
        }).eq("id", requestRecord.id).eq("business_id", biz.id);

        if (status === "sent") {
            await bumpCustomerAfterSend(admin, biz.id, customerName, customer.phone, null, { phone: true, email: false });
            return "success";
        }
        if (status === "skipped") {
            skippedReasons[customer.id] = result.errorMessage ?? "Not eligible";
            return "skipped";
        }
        return "fail";
    } catch (e) {
        logger.error({ err: e, customerId: customer.id }, "Bulk Request Error for customer");
        return "fail";
    }
}
