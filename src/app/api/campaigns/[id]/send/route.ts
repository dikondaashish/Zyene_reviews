import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/lib/twilio/send-sms";
import { sendEmail } from "@/lib/resend/send-email";
import { NextResponse } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
    contacts: z.array(
        z.object({
            name: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        })
    ).min(1).max(500),
});

// POST /api/campaigns/[id]/send — send campaign to contacts
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { id: campaignId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid data", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // Verify campaign ownership and get business
    const { data: business } = await supabase
        .from("businesses")
        .select(`
            *,
            organizations (
                id,
                organization_members!inner(user_id)
            )
        `)
        .eq("organizations.organization_members.user_id", user.id)
        .single();

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("business_id", business.id)
        .single();

    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "active") {
        return NextResponse.json({ error: "Campaign is not active. Activate it first." }, { status: 400 });
    }

    const orgId = business.organizations?.id;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const businessName = business.name || "our business";
    const frequencyCapDays = business.review_request_frequency_cap_days || 30;

    const results = {
        sent: 0,
        skipped: 0,
        failed: 0,
        reasons: [] as string[],
    };

    for (const contact of parsed.data.contacts) {
        const contactIdentifier = contact.phone || contact.email || "unknown";

        try {
            // a. Check plan limits
            if (orgId) {
                const { allowed } = await checkLimit(orgId, "review_requests");
                if (!allowed) {
                    results.skipped++;
                    results.reasons.push(`${contactIdentifier}: Monthly plan limit reached`);
                    continue;
                }
            }

            // b. Check frequency cap (by phone)
            if (contact.phone) {
                const { data: existingContact } = await supabase
                    .from("customer_contacts")
                    .select("last_request_sent_at")
                    .eq("business_id", business.id)
                    .eq("phone", contact.phone)
                    .single();

                if (existingContact?.last_request_sent_at) {
                    const lastSent = new Date(existingContact.last_request_sent_at);
                    const diffDays = (Date.now() - lastSent.getTime()) / (1000 * 3600 * 24);
                    if (diffDays < frequencyCapDays) {
                        results.skipped++;
                        results.reasons.push(`${contactIdentifier}: Sent recently (${frequencyCapDays}d cap)`);
                        continue;
                    }
                }
            }

            // c. Check opt-outs (for SMS)
            if (contact.phone) {
                const { data: optOut } = await admin
                    .from("sms_opt_outs")
                    .select("id")
                    .eq("phone_number", contact.phone)
                    .single();

                if (optOut) {
                    results.skipped++;
                    results.reasons.push(`${contactIdentifier}: Opted out`);
                    continue;
                }
            }

            // d. Create review_request record first (to get requestId for the link)
            const channelToSend = campaign.channel === "both"
                ? (contact.phone ? "sms" : "email")
                : campaign.channel;

            const { data: requestRecord, error: insertError } = await supabase
                .from("review_requests")
                .insert({
                    business_id: business.id,
                    campaign_id: campaignId,
                    customer_name: contact.name || null,
                    customer_phone: contact.phone || null,
                    customer_email: contact.email || null,
                    channel: channelToSend === "both" ? "sms" : channelToSend,
                    trigger_source: "campaign",
                    status: "sending",
                })
                .select()
                .single();

            if (insertError || !requestRecord) {
                results.failed++;
                results.reasons.push(`${contactIdentifier}: Failed to create request record`);
                continue;
            }
            const requestId = requestRecord.id;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const protocol = rootDomain.includes("localhost") ? "http" : "https";
            const reviewLink = `${protocol}://${rootDomain}/${business.slug}?ref=${requestId}&campaign=${campaignId}`;

            // e. Replace template placeholders
            const customerName = contact.name || "there";
            const replacePlaceholders = (template: string) =>
                template
                    .replace(/\{customer_name\}/g, customerName)
                    .replace(/\{business_name\}/g, businessName)
                    .replace(/\{review_link\}/g, reviewLink);

            let sendResult: { sent: boolean; error?: string } = { sent: false, error: "No channel configured" };

            // f. Send via SMS
            if ((channelToSend === "sms" || campaign.channel === "both") && contact.phone) {
                const smsBody = campaign.sms_template
                    ? replacePlaceholders(campaign.sms_template)
                    : `Hi ${customerName}! Thanks for visiting ${businessName}. We'd love your feedback — takes 30 seconds: ${reviewLink}`;

                sendResult = await sendSMS(contact.phone, smsBody);
            }

            // g. Send via Email
            if ((channelToSend === "email" || campaign.channel === "both") && contact.email) {
                const subject = campaign.email_subject
                    ? replacePlaceholders(campaign.email_subject)
                    : `How was your visit to ${businessName}?`;

                const html = campaign.email_template
                    ? replacePlaceholders(campaign.email_template)
                    : `<p>Hi ${customerName},</p><p>Thanks for visiting ${businessName}! We'd love to hear about your experience.</p><p><a href="${reviewLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Leave a Review</a></p><p>It only takes 30 seconds. Thank you!</p>`;

                sendResult = await sendEmail({ to: contact.email, subject, html });
            }

            // h. Update request status
            const newStatus = sendResult.sent ? "sent" : "failed";
            await supabase
                .from("review_requests")
                .update({
                    status: newStatus,
                    sent_at: sendResult.sent ? new Date().toISOString() : null,
                    review_link: reviewLink,
                    error_message: sendResult.sent ? null : sendResult.error,
                })
                .eq("id", requestId);

            if (sendResult.sent) {
                results.sent++;

                // i. Update campaign stats
                await admin
                    .from("campaigns")
                    .update({ total_sent: campaign.total_sent + results.sent })
                    .eq("id", campaignId);

                // Upsert customer_contacts
                if (contact.phone) {
                    const { data: contactFull } = await supabase
                        .from("customer_contacts")
                        .select("total_requests_sent, name")
                        .eq("business_id", business.id)
                        .eq("phone", contact.phone)
                        .single();

                    await supabase
                        .from("customer_contacts")
                        .upsert({
                            business_id: business.id,
                            phone: contact.phone,
                            name: contact.name || contactFull?.name,
                            total_requests_sent: (contactFull?.total_requests_sent || 0) + 1,
                            last_request_sent_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }, { onConflict: "business_id,phone" });
                }
            } else {
                results.failed++;
                results.reasons.push(`${contactIdentifier}: ${sendResult.error}`);
            }
        } catch (err: any) {
            results.failed++;
            results.reasons.push(`${contactIdentifier}: ${err.message || "Unknown error"}`);
        }
    }

    // Final campaign stats update
    await admin
        .from("campaigns")
        .update({ total_sent: campaign.total_sent + results.sent })
        .eq("id", campaignId);

    return NextResponse.json(results);
}
