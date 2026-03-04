import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/lib/twilio/send-sms";
import { sendEmail } from "@/lib/resend/send-email";
import { sendReviewRequest } from "@/lib/notifications/review-request";

// This background job runs for EACH contact asynchronously
export const processCampaignContact = inngest.createFunction(
    {
        id: "process-campaign-contact",
        name: "Process Campaign Contact",
        concurrency: {
            limit: 10, // Process 10 SMS per second maximum to avoid Twilio ratelimits
        }
    },
    { event: "campaign/send.contact" },
    async ({ event, step }) => {
        const { campaignId, businessId, contact } = event.data;
        const supabase = createAdminClient();

        // 1. Get Campaign and Business details
        const campaign = await step.run("fetch-campaign-details", async () => {
            const { data, error } = await supabase
                .from("campaigns")
                .select("*, businesses(name, slug, review_request_frequency_cap_days, review_platforms(platform))")
                .eq("id", campaignId)
                .single();
            if (error || !data) throw new Error(`Campaign not found: ${campaignId}`);
            return data;
        });

        const business = (campaign as any).businesses;
        if (!business) throw new Error("Business not found for campaign");

        // 2. Filter contacts (Frequency Cap & Opt-out checks)
        const canSend = await step.run("check-permissions", async () => {
            // Check global opt-out
            if (contact.phone) {
                const { data: optOut } = await supabase
                    .from("sms_opt_outs")
                    .select("id")
                    .eq("phone_number", contact.phone)
                    .single();
                if (optOut) return { allowed: false, reason: "Customer opted out of SMS" };

                // Check frequency cap
                const frequencyCapDays = business.review_request_frequency_cap_days || 30;
                const { data: existingContact } = await supabase
                    .from("customers")
                    .select("last_request_sent_at")
                    .eq("business_id", businessId)
                    .eq("phone", contact.phone)
                    .single();

                if (existingContact?.last_request_sent_at) {
                    const lastSent = new Date(existingContact.last_request_sent_at);
                    const now = new Date();
                    const diffDays = (now.getTime() - lastSent.getTime()) / (1000 * 3600 * 24);
                    if (diffDays < frequencyCapDays) {
                        return { allowed: false, reason: `Frequency cap: sent within ${frequencyCapDays} days` };
                    }
                }
            }
            return { allowed: true, reason: undefined as string | undefined };
        });

        // 3. Create Request Record explicitly as "queued" or "skipped"
        const requestRecord = await step.run("create-request-record", async () => {
            const status = canSend.allowed ? (campaign.delay_minutes > 0 ? "queued" : "sending") : "skipped";
            const { data, error } = await supabase
                .from("review_requests")
                .insert({
                    business_id: businessId,
                    campaign_id: campaignId,
                    customer_name: contact.name || null,
                    customer_phone: contact.phone || null,
                    customer_email: contact.email || null,
                    channel: campaign.channel,
                    status: status,
                    error_message: canSend.reason || null
                })
                .select()
                .single();
            if (error) throw new Error(`Failed to create request: ${error.message}`);
            return data;
        });

        if (!canSend.allowed) {
            return { status: "skipped", reason: canSend.reason };
        }

        // 4. Handle Initial Delay
        if (campaign.delay_minutes > 0) {
            // Sleep for the specified delay
            await step.sleep("initial-delay", `${campaign.delay_minutes}m`);

            // Update status to sending
            await step.run("update-status-sending", async () => {
                await supabase
                    .from("review_requests")
                    .update({ status: "sending" })
                    .eq("id", requestRecord.id);
            });
        }

        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const protocol = rootDomain.includes("localhost") ? "http" : "https";
        const reviewLink = `${protocol}://${rootDomain}/${business.slug}?ref=${requestRecord.id}`;

        // 5. Send Initial Message
        const sendResult = await step.run("send-message", async () => {
            const contactMethods: ("email" | "sms")[] = [];
            if (campaign.channel === "email" || campaign.channel === "both") {
                if (contact.email) contactMethods.push("email");
            }
            if (campaign.channel === "sms" || campaign.channel === "both") {
                if (contact.phone) contactMethods.push("sms");
            }

            if (contactMethods.length === 0) {
                return { sendStatus: "failed", errorMessage: "Missing contact info for campaign type" };
            }

            const result = await sendReviewRequest({
                businessId: businessId,
                businessName: business.name,
                customerName: contact.name || "Customer",
                contactMethods,
                customerEmail: contact.email,
                customerPhone: contact.phone,
                template: campaign.sms_template || campaign.email_template || undefined
            });

            return {
                sendStatus: (result.emailSent || result.smsSent) ? "sent" : "failed",
                errorMessage: result.error
            };
        });

        // 6. Update Database for Initial Send
        await step.run("update-initial-database", async () => {
            await supabase
                .from("review_requests")
                .update({
                    status: sendResult.sendStatus,
                    error_message: sendResult.errorMessage,
                    sent_at: sendResult.sendStatus === "sent" ? new Date().toISOString() : null,
                })
                .eq("id", requestRecord.id);

            // Update frequency cap tracking
            if (contact.phone || contact.email) {
                const { data: contactFull } = await supabase
                    .from("customers")
                    .select("total_requests_sent, first_name, last_name")
                    .eq("business_id", businessId)
                    .or(contact.phone ? `phone.eq.${contact.phone}` : `email.eq.${contact.email}`)
                    .single();

                await supabase
                    .from("customers")
                    .upsert({
                        business_id: businessId,
                        phone: contact.phone || undefined,
                        email: contact.email || undefined,
                        first_name: contact.name ? contact.name.split(' ')[0] : (contactFull?.first_name || null),
                        last_name: contact.name && contact.name.includes(' ') ? contact.name.split(' ').slice(1).join(' ') : (contactFull?.last_name || null),
                        total_requests_sent: (contactFull?.total_requests_sent || 0) + 1,
                        last_request_sent_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: contact.phone ? "business_id,phone" : "business_id,email" });
            }
        });

        if (sendResult.sendStatus !== "sent") {
            return { status: "completed_with_error", sendResult };
        }

        return { status: "completed", sendResult };
    }
);
