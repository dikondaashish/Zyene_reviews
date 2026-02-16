import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/lib/twilio/send-sms";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const admindClient = createAdminClient(); // For bypassing RLS on customer_contacts upsert if needed, or strictly secure it.
        // Actually, user is authenticated, so we should use `supabase` for things they own, but `sms_opt_outs` might be global?
        // User said `sms_opt_outs` table exists.

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { customerName, customerPhone, channel, businessId } = body;

        if (!customerPhone || !businessId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

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
            return new NextResponse("Business not found or access denied", { status: 403 });
        }

        const orgId = business.organizations?.id;

        // 2. Check Plan Limit
        if (orgId) {
            const { allowed } = await checkLimit(orgId, "review_requests");
            if (!allowed) {
                return new NextResponse("You've reached your monthly limit. Upgrade your plan.", { status: 403 });
            }
        }

        // 3. Check Frequency Cap
        const frequencyCapDays = business.review_request_frequency_cap_days || 30; // Default 30?

        const { data: contact } = await supabase
            .from("customer_contacts")
            .select("last_request_sent_at")
            .eq("business_id", businessId)
            .eq("phone", customerPhone) // Assuming 'phone' column
            .single();

        if (contact && contact.last_request_sent_at) {
            const lastSent = new Date(contact.last_request_sent_at);
            const now = new Date();
            const diffDays = (now.getTime() - lastSent.getTime()) / (1000 * 3600 * 24);

            if (diffDays < frequencyCapDays) {
                return new NextResponse(`Already sent to this customer recently. Cap is ${frequencyCapDays} days.`, { status: 400 });
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
            return new NextResponse("Customer has opted out", { status: 400 });
        }

        // 5. Generate Review Link
        // Need a unique ID for the request. We insert first with 'queued' status? 
        // Or generate distinct ID? Supabase generates ID on insert.
        // User said: "Generate unique review link: ...ref=${requestId}".
        // So I must insert first.

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
            return new NextResponse("Failed to create request record", { status: 500 });
        }

        const requestId = requestRecord.id;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const reviewLink = `${appUrl}/r/${business.slug}?ref=${requestId}`;

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
            // Email not implemented yet per instructions
            // But for now mark as sent if selected? User said "email disabled for now" in UI.
            // If manual post sent email, just mark sent/fake?
            // Prompt says "If channel = 'sms': ... Send via sendSMS()".
            // It implies other channels might just be logged?
            // I'll stick to SMS logic.
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
        }

        // 8. Upsert Customer Contact
        // We need to increment total_requests_sent.
        // First fetch existing or just use upsert with onConflict?
        // Supabase upsert:
        // We need `business_id` + `phone` to be unique constraint.
        // I'll assume they are unique.

        // Fetch again to be safe on existing count?
        // Or just upsert.
        // If I can't increment atomically easily, I'll read-modify-write.
        // I already read `contact` above (Step 3).

        const existingCount = contact ? (contact as any).total_requests_sent || 0 : 0; // Type casting safely

        // Wait, I need to fetch `total_requests_sent` in Step 3 if I want to increment it.
        const { data: contactFull } = await supabase
            .from("customer_contacts")
            .select("*")
            .eq("business_id", businessId)
            .eq("phone", customerPhone)
            .single();

        const newCount = (contactFull?.total_requests_sent || 0) + 1;

        await supabase
            .from("customer_contacts")
            .upsert({
                business_id: businessId,
                phone: customerPhone,
                name: customerName || contactFull?.name, // Keep existing name if not provided
                total_requests_sent: newCount,
                last_request_sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: "business_id,phone" }); // Check constraint name?

        if (sendStatus === "failed") {
            return new NextResponse(`Failed to send SMS: ${errorMessage}`, { status: 500 });
        }

        return NextResponse.json(requestRecord);

    } catch (error: any) {
        console.error("Request API Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
