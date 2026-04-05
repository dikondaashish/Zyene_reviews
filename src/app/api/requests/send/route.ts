import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/services/twilio/send-sms";
import * as Sentry from "@sentry/nextjs";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const sendRequestSchema = z.object({
    customerName: z.string().max(200).optional(),
    customerPhone: z.string().max(30),
    channel: z.string().max(20).optional(),
    businessId: z.string().uuid(),
});

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

        // Apply Rate Limiting (10 requests/min per user)
        const { success: rateLimitSuccess } = await requestRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            return apiError("Rate limit exceeded. Try again later.", { status: 429 });
        }

        const parsed = sendRequestSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400 });
        }
        const { customerName, customerPhone, channel, businessId } = parsed.data;

        // 1. Verify ownership & Get Business Config
        const { data: business, error: businessError } = await supabase
            .from("businesses")
            .select(`
                *,
                organizations (
                    id,
                    plan,
                    organization_members!inner(user_id)
                )
            `)
            .eq("id", businessId)
            .eq("organizations.organization_members.user_id", user.id) // Explicit ownership check
            .single();

        if (businessError || !business) {
            console.error("Business fetch error:", businessError);
            if (businessError) Sentry.captureException(businessError, { tags: { route: "requests-send", step: "fetch_business" } });
            return apiError("Business not found or access denied", { status: 403 });
        }

        const orgId = business.organizations?.id;

        // 2. Check Plan Limit
        if (orgId) {
            const { allowed } = await checkLimit(orgId, "review_requests");
            if (!allowed) {
                return apiError("You've reached your monthly limit. Upgrade your plan.", { status: 403 });
            }
        }

        // 3. Check Frequency Cap
        const frequencyCapDays = business.review_request_frequency_cap_days || 30; // Default 30?

        const { data: contact } = await supabase
            .from("customers")
            .select("last_request_sent_at")
            .eq("business_id", businessId)
            .eq("phone", customerPhone)
            .single();

        interface CustomerRecord {
            last_request_sent_at?: string | null;
        }
        const contactTyped = contact as unknown as CustomerRecord;

        if (contactTyped?.last_request_sent_at) {
            const lastSent = new Date(contactTyped.last_request_sent_at);
            const now = new Date();
            const diffDays = (now.getTime() - lastSent.getTime()) / (1000 * 3600 * 24);

            if (diffDays < frequencyCapDays) {
                return apiError(`Already sent to this customer recently. Cap is ${frequencyCapDays} days.`, { status: 400 });
            }
        }

        // 4. Check Opt-out
        // Using admin client to check global opt-outs if RLS prevents reading it
        const { data: optOut } = await admindClient
            .from("sms_opt_outs")
            .select("id")
            .eq("phone_number", customerPhone)
            .single();

        if (optOut) {
            return apiError("Customer has opted out", { status: 400 });
        }

        // 5. Generate Review Link — insert first to get requestId for the link

        const { data: requestRecord, error: insertError } = await supabase
            .from("review_requests")
            .insert({
                business_id: businessId,
                customer_name: customerName,
                customer_phone: customerPhone,
                channel: channel,
                status: "sending", // Temporary status
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
        const reviewLink = `${protocol}://${rootDomain}/${business.slug}?ref=${requestId}`;

        // 6. Send SMS
        let sendStatus = "sent";
        let errorMessage = null;

        if (channel === "sms") {
            const messageBody = `Hi ${customerName || "there"}! Thanks for visiting ${business.name}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;

            const result = await sendSMS(customerPhone, messageBody);

            if (!result.sent) {
                sendStatus = "failed";
                errorMessage = result.error;
            }
        } else {
            // Email channel — not yet implemented; will be handled when email sending is enabled
        }

        // 7. Update Request Status
        const { error: updateError } = await supabase
            .from("review_requests")
            .update({
                status: sendStatus,
                error_message: errorMessage,
                sent_at: sendStatus === "sent" ? new Date().toISOString() : null,
            })
            .eq("id", requestId);

        if (updateError) {
            console.error("Update Request Error:", updateError);
            Sentry.captureException(updateError, { tags: { route: "requests-send", step: "update_request" } });
        }

        // 8. Upsert Customer Contact — atomic frequency tracking via RPC (FIX 4.3)
        await supabase.rpc("increment_customer_requests", {
            p_business_id: businessId,
            p_phone: customerPhone,
        });

        if (sendStatus === "failed") {
            return apiError(`Failed to send SMS: ${errorMessage}`, { status: 500 });
        }

        return apiOk(requestRecord);

    } catch (error: unknown) {
        console.error("Request API Error:", error);
        Sentry.captureException(error, { tags: { route: "requests-send" } });
        return apiError("An unexpected error occurred. Please try again.", { status: 500 });
    }
}
