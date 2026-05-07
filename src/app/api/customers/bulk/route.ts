import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest, NextResponse } from "next/server";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/services/twilio/send-sms";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const bulkActionSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
    businessId: z.string().uuid(),
    action: z.enum(["delete", "tag", "request"]),
    data: z.object({
        tags: z.array(z.string().max(80)).max(20).optional(),
        mode: z.enum(["add", "remove"]).optional(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Rate limit bulk operations
        const { success: rateLimitOk } = await requestRateLimit.limit(`bulk:${user.id}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
        }

        const body = await request.json();
        const parsed = bulkActionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
        }
        const { ids, businessId, action, data: actionData } = parsed.data;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        switch (action) {
            case "delete":
                const { error: deleteError } = await supabase
                    .from("customers")
                    .delete()
                    .in("id", ids)
                    .eq("business_id", businessId);
                
                if (deleteError) throw deleteError;
                return NextResponse.json({ success: true, count: ids.length });

            case "tag":
                const { tags, mode } = actionData || {}; // mode: 'add' or 'remove'
                if (!tags || !Array.isArray(tags)) {
                    return NextResponse.json({ error: "Tags are required for this action" }, { status: 400 });
                }

                // In a real scenario, we might want to do this via RPC for performance
                // but for ~50 items a loop or single update with ARRAY operators is fine.
                // Supabase doesn't easily support "append to array" in a bulk .in() update easily without RPC.
                
                if (mode === 'add') {
                    // Update all selected customers
                    // Note: This replaces tags if not careful. For bulk "add", we really need RPC.
                    const { error: tagError } = await supabase.rpc('bulk_add_customer_tags', {
                        customer_ids: ids,
                        new_tags: tags
                    });
                    if (tagError) throw tagError;
                } else {
                    const { error: tagError } = await supabase.rpc('bulk_remove_customer_tags', {
                        customer_ids: ids,
                        tags_to_remove: tags
                    });
                    if (tagError) throw tagError;
                }
                
                return NextResponse.json({ success: true });

            case "request":
                // 1. Fetch Business & Org for Plan Checks
                const { data: business } = await supabase
                    .from("businesses")
                    .select("*, organizations(id, plan)")
                    .eq("id", businessId)
                    .single();
                
                if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

                // 2. Fetch Customers
                const { data: customersToRequest } = await supabase
                    .from("customers")
                    .select("*")
                    .in("id", ids)
                    .eq("business_id", businessId);
                
                if (!customersToRequest || customersToRequest.length === 0) {
                    return NextResponse.json({ error: "No valid customers found" }, { status: 400 });
                }

                const eligibleCustomers = customersToRequest.filter((c) => !c.is_opted_out);
                if (eligibleCustomers.length === 0) {
                    return NextResponse.json(
                        { error: "Selected customers are opted out of review requests" },
                        { status: 400 }
                    );
                }

                // 3. Plan limit (bulk request uses SMS only — enforce SMS channel cap)
                const { allowed, remaining } = await checkLimit(business.organizations.id, "sms_requests");
                if (!allowed) {
                    return NextResponse.json({ error: "Monthly limit reached" }, { status: 403 });
                }

                const batchSize = Math.min(eligibleCustomers.length, remaining);
                const actualBatch = eligibleCustomers.slice(0, batchSize);
                const adminClient = createAdminClient();

                // 4. Trigger Requests (Sequential to avoid Twilio/DB congestion for now)
                let successCount = 0;
                let failCount = 0;

                for (const customer of actualBatch) {
                    if (!customer.phone) {
                        failCount++;
                        continue;
                    }

                    try {
                        // This mirrors the logic in /api/requests/send
                        const { data: requestRecord, error: insertReqError } = await supabase
                            .from("review_requests")
                            .insert({
                                business_id: businessId,
                                customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
                                customer_phone: customer.phone,
                                channel: "sms",
                                status: "sending"
                            })
                            .select()
                            .single();

                        if (insertReqError || !requestRecord) {
                            console.error("Bulk insert review_request failed:", insertReqError);
                            failCount++;
                            continue;
                        }

                        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                        const protocol = rootDomain.includes("localhost") ? "http" : "https";
                        const reviewCaptureDomain = rootDomain.includes("localhost")
                            ? rootDomain
                            : (process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com");
                        const reviewLink = `${protocol}://${reviewCaptureDomain}/${business.slug}?ref=${requestRecord.id}`;
                        const messageBody = `Hi ${customer.first_name || "there"}! Thanks for visiting ${business.name}. We'd love your feedback: ${reviewLink}`;

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
                            successCount++;
                            // Simple update on customer record
                            await supabase
                                .from("customers")
                                .update({
                                    last_request_sent_at: new Date().toISOString(),
                                    total_requests_sent: (customer.total_requests_sent || 0) + 1
                                })
                                .eq("id", customer.id);
                        } else {
                            failCount++;
                        }
                    } catch (e) {
                        console.error("Bulk Request Error for customer", customer.id, e);
                        failCount++;
                    }
                }

                return NextResponse.json({ 
                    success: true, 
                    sent: successCount, 
                    failed: failCount,
                    limitReached: batchSize < eligibleCustomers.length
                });

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: unknown) {
        console.error("Bulk API Error:", error);
        Sentry.captureException(error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
