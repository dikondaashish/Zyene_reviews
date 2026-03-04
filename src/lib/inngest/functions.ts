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
            let sendStatus = "sent";
            let errorMessage = null;

            try {
                if (campaign.channel === "sms" && contact.phone) {
                    // Use custom template or fallback
                    let messageBody = campaign.sms_template || `Hi {customer_name}! Thanks for visiting {business_name}. We'd love your feedback — it only takes 30 seconds: {review_link}`;
                    messageBody = messageBody
                        .replace(/\{customer_name\}/g, contact.name || "there")
                        .replace(/\{business_name\}/g, business.name)
                        .replace(/\{review_link\}/g, reviewLink);

                    const result = await sendSMS(contact.phone, messageBody);
                    if (!result.sent) {
                        sendStatus = "failed";
                        errorMessage = result.error;
                    }
                } else if (campaign.channel === "email" && contact.email) {
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

        if (sendResult.sendStatus !== "sent") {
            return { status: "completed_with_error", sendResult };
        }

        // 7. Follow-up Logic
        if (campaign.follow_up_enabled && campaign.follow_up_delay_hours > 0) {
            // Sleep until the follow up is due
            await step.sleep("follow-up-delay", `${campaign.follow_up_delay_hours}h`);

            // Check if user has already interacted
            const needsFollowUp = await step.run("check-follow-up-eligibility", async () => {
                const { data } = await supabase
                    .from("review_requests")
                    .select("status, review_left")
                    .eq("id", requestRecord.id)
                    .single();

                // If they already left a review, or clicked the link, don't spam them
                if (data?.review_left || data?.status === "clicked" || data?.status === "follow_up_sent") {
                    return false;
                }
                return true;
            });

            if (needsFollowUp) {
                const followUpResult = await step.run("send-follow-up", async () => {
                    let sendStatus = "follow_up_sent";
                    let errorMessage = null;

                    try {
                        if (campaign.channel === "sms" && contact.phone) {
                            let messageBody = campaign.follow_up_template || `Hi {customer_name}, just a friendly reminder — we'd love your feedback for {business_name}: {review_link}`;
                            messageBody = messageBody
                                .replace(/\{customer_name\}/g, contact.name || "there")
                                .replace(/\{business_name\}/g, business.name)
                                .replace(/\{review_link\}/g, reviewLink);

                            const result = await sendSMS(contact.phone, messageBody);
                            if (!result.sent) {
                                sendStatus = "follow_up_failed";
                                errorMessage = result.error;
                            }
                        } else if (campaign.channel === "email" && contact.email) {
                            sendStatus = "follow_up_sent";
                        }
                    } catch (err: any) {
                        sendStatus = "follow_up_failed";
                        errorMessage = err.message;
                    }
                    return { sendStatus, errorMessage };
                });

                // Update database for follow-up
                await step.run("update-follow-up-database", async () => {
                    await supabase
                        .from("review_requests")
                        .update({
                            status: followUpResult.sendStatus,
                            error_message: followUpResult.errorMessage,
                        })
                        .eq("id", requestRecord.id);
                });
            }
        }

        return { status: "completed", sendResult };
    }
);
