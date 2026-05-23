import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/services/twilio/send-sms";
import type { SupabaseClient } from "@supabase/supabase-js";

type CustomerRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    is_opted_out: boolean | null;
    total_requests_sent: number | null;
};

type BusinessRow = {
    id: string;
    name: string;
    slug: string;
    organizations: { id: string; plan: string | null };
};

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

    const { data: customersToRequest } = await supabase
        .from("customers")
        .select("*")
        .in("id", ids)
        .eq("business_id", businessId);

    if (!customersToRequest || customersToRequest.length === 0) {
        return { status: 400 as const, body: { error: "No valid customers found" } };
    }

    const eligibleCustomers = (customersToRequest as CustomerRow[]).filter((c) => !c.is_opted_out);
    if (eligibleCustomers.length === 0) {
        return {
            status: 400 as const,
            body: { error: "Selected customers are opted out of review requests" },
        };
    }

    const biz = business as unknown as BusinessRow;
    const { allowed, remaining } = await checkLimit(biz.organizations.id, "sms_requests");
    if (!allowed) {
        return { status: 403 as const, body: { error: "Monthly limit reached" } };
    }

    const batchSize = Math.min(eligibleCustomers.length, remaining);
    const actualBatch = eligibleCustomers.slice(0, batchSize);
    const adminClient = createAdminClient();

    const outcomes = await Promise.all(
        actualBatch.map(async (customer) => {
            if (!customer.phone) {
                return "fail" as const;
            }

            try {
                const { data: requestRecord, error: insertReqError } = await supabase
                    .from("review_requests")
                    .insert({
                        business_id: businessId,
                        customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
                        customer_phone: customer.phone,
                        channel: "sms",
                        status: "sending",
                    })
                    .select()
                    .single();

                if (insertReqError || !requestRecord) {
                    logger.error({ err: insertReqError }, "Bulk insert review_request failed:");
                    return "fail" as const;
                }

                const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                const protocol = rootDomain.includes("localhost") ? "http" : "https";
                const reviewCaptureDomain = rootDomain.includes("localhost")
                    ? rootDomain
                    : (process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com");
                const reviewLink = `${protocol}://${reviewCaptureDomain}/${biz.slug}?ref=${requestRecord.id}`;
                const messageBody = `Hi ${customer.first_name || "there"}! Thanks for visiting ${biz.name}. We'd love your feedback: ${reviewLink}`;

                const result = await sendSMS(customer.phone, messageBody);

                const rrPatch = {
                    status: result.sent ? "sent" : "failed",
                    error_message: result.error || null,
                    sent_at: result.sent ? new Date().toISOString() : null,
                };
                const { data: rrUpdated } = await supabase
                    .from("review_requests")
                    .update(rrPatch)
                    .eq("id", requestRecord.id)
                    .select();
                if (!rrUpdated?.[0]) {
                    await adminClient
                        .from("review_requests")
                        .update(rrPatch)
                        .eq("id", requestRecord.id)
                        .eq("business_id", businessId);
                }

                if (result.sent) {
                    await supabase
                        .from("customers")
                        .update({
                            last_request_sent_at: new Date().toISOString(),
                            total_requests_sent: (customer.total_requests_sent || 0) + 1,
                        })
                        .eq("id", customer.id);
                    return "success" as const;
                }

                return "fail" as const;
            } catch (e) {
                logger.error({ err: customer.id, e }, "Bulk Request Error for customer");
                return "fail" as const;
            }
        })
    );
    const successCount = outcomes.filter((o) => o === "success").length;
    const failCount = outcomes.filter((o) => o === "fail").length;

    return {
        status: 200 as const,
        body: {
            success: true,
            sent: successCount,
            failed: failCount,
            limitReached: batchSize < eligibleCustomers.length,
        },
    };
}
