import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { sendSMS } from "@/lib/twilio/send-sms";
import { sendEmail } from "@/lib/resend/send-email";

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
                    .from("customer_contacts")
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

        if (!canSend.allowed) {
            return { status: "skipped", reason: canSend.reason };
        }

        // 3. Create Request Record (to generate the link)
        const requestRecord = await step.run("create-request-record", async () => {
            const { data, error } = await supabase
                .from("review_requests")
                .insert({
                    business_id: businessId,
                    campaign_id: campaignId,
                    customer_name: contact.name || null,
                    customer_phone: contact.phone || null,
                    customer_email: contact.email || null,
                    channel: campaign.channel,
                    status: "filtered", // Initial status
                })
                .select()
                .single();
            if (error) throw new Error(`Failed to create request: ${error.message}`);
            return data;
        });

        // 4. Send Message (SMS/Email)
        const sendResult = await step.run("send-message", async () => {
            let sendStatus = "sent";
            let errorMessage = null;

            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const protocol = rootDomain.includes("localhost") ? "http" : "https";
            const reviewLink = `${protocol}://${rootDomain}/${business.slug}?ref=${requestRecord.id}`;

            try {
                if (campaign.channel === "sms" && contact.phone) {
                    const messageBody = `Hi ${contact.name || "there"}! Thanks for visiting ${business.name}. We'd love your feedback — it only takes 30 seconds: ${reviewLink}`;
                    const result = await sendSMS(contact.phone, messageBody);
                    if (!result.sent) {
                        sendStatus = "failed";
                        errorMessage = result.error;
                    }
                } else if (campaign.channel === "email" && contact.email) {
                    // Implement email sending logic here once Resend is fully configured
                    // const result = await sendEmail({ ... });
                    sendStatus = "sent";
                } else {
                    sendStatus = "failed";
                    errorMessage = "Missing contact info for campaign type";
                }
            } catch (err: any) {
                sendStatus = "failed";
                errorMessage = err.message;
            }

            return { sendStatus, errorMessage };
        });

        // 5. Update Database Records
        await step.run("update-database", async () => {
            // Update request status
            await supabase
                .from("review_requests")
                .update({
                    status: sendResult.sendStatus,
                    error_message: sendResult.errorMessage,
                    sent_at: sendResult.sendStatus === "sent" ? new Date().toISOString() : null,
                })
                .eq("id", requestRecord.id);

            // Upsert customer contact for frequency cap tracking
            if (contact.phone) {
                const { data: contactFull } = await supabase
                    .from("customer_contacts")
                    .select("total_requests_sent, name")
                    .eq("business_id", businessId)
                    .eq("phone", contact.phone)
                    .single();

                await supabase
                    .from("customer_contacts")
                    .upsert({
                        business_id: businessId,
                        phone: contact.phone,
                        name: contact.name || contactFull?.name,
                        total_requests_sent: (contactFull?.total_requests_sent || 0) + 1,
                        last_request_sent_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: "business_id,phone" });
            }
        });

        return { status: "completed", sendResult };
    }
);
