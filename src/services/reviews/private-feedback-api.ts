import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { categorizePrivateFeedback } from "@/domains/ai/services/AiAnalysisService";
import { sendEmail } from "@/services/resend/send-email";
import { recoveryEmailTemplate } from "@/services/resend/templates/recovery-email";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import {
    EMAIL_RE,
    isValidPhoneDigits,
    normalizeContactMode,
    privateFeedbackSchema,
} from "./private-feedback-schema";

export async function handlePrivateFeedbackPost(request: Request) {
    try {
        const body = await request.json();
        const parsed = privateFeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        const {
            review_request_id,
            business_id: bodyBusinessId,
            rating,
            content,
            customer_email: rawEmail,
            customer_phone: rawPhone,
            selected_staff = [],
        } = parsed.data;

        const supabase = createAdminClient();
        let business_id = bodyBusinessId || null;
        let businessName: string | null | undefined;
        let customerName: string | null | undefined;

        if (review_request_id) {
            const { data: reviewRequest, error: requestErr } = await supabase
                .from("review_requests")
                .select("id, business_id, customer_name, businesses(name)")
                .eq("id", review_request_id)
                .maybeSingle();

            if (requestErr || !reviewRequest?.business_id) {
                return NextResponse.json({ error: "Invalid review request" }, { status: 404 });
            }
            business_id = reviewRequest.business_id;
            const businessData = reviewRequest.businesses as { name?: string } | null;
            businessName = businessData?.name;
            customerName = reviewRequest.customer_name;
        }

        if (!business_id) {
            if (bodyBusinessId) {
                const { data: biz } = await supabase.from("businesses").select("name").eq("id", bodyBusinessId).maybeSingle();
                businessName = biz?.name;
            } else {
                return NextResponse.json({ error: "Business not found" }, { status: 404 });
            }
            business_id = bodyBusinessId;
        }

        const { data: bizPlanRow } = await supabase
            .from("businesses")
            .select("organizations!inner(plan, plan_status)")
            .eq("id", business_id)
            .maybeSingle();
        const org = (bizPlanRow as { organizations?: { plan?: string | null; plan_status?: string | null } })?.organizations ?? null;
        const canUseAiFeedbackCategorization = planAllowsAiReviewFeatures(
            org?.plan ?? null,
            org?.plan_status ?? null
        );

        const { data: bizSettings, error: bizSettingsErr } = await supabase
            .from("businesses")
            .select("private_feedback_email_mode, private_feedback_phone_mode")
            .eq("id", business_id)
            .maybeSingle();

        if (bizSettingsErr || !bizSettings) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const emailMode = normalizeContactMode(bizSettings.private_feedback_email_mode, "optional");
        const phoneMode = normalizeContactMode(bizSettings.private_feedback_phone_mode, "hidden");

        let customer_email = rawEmail?.trim() || null;
        let customer_phone = rawPhone?.trim() || null;

        if (emailMode === "hidden") customer_email = null;
        if (phoneMode === "hidden") customer_phone = null;

        if (emailMode === "required" && !customer_email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        if (phoneMode === "required" && !customer_phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        if (customer_email && !EMAIL_RE.test(customer_email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        if (customer_phone && !isValidPhoneDigits(customer_phone)) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        let category = "Other";
        if (canUseAiFeedbackCategorization) {
            category = await categorizePrivateFeedback(content);
        }

        const { data: feedback, error } = await supabase
            .from("private_feedback")
            .insert({
                business_id,
                review_request_id: review_request_id || null,
                rating,
                content,
                customer_email: customer_email || null,
                customer_phone: customer_phone || null,
                selected_staff: selected_staff || [],
                category,
                status: "open",
                created_at: new Date().toISOString(),
            })
            .select()
            .single();
        if (error) {
            logger.error({ err: error }, "Failed to insert private feedback:");
            throw error;
        }

        const authorForAlert = customer_email || customer_phone || "Anonymous Customer";
        const staffSuffix =
            selected_staff && selected_staff.length > 0 ? ` (Served by: ${selected_staff.join(", ")})` : "";
        const phoneSuffix = customer_phone ? ` Phone: ${customer_phone}` : "";

        sendReviewAlert({
            id: feedback.id,
            business_id: business_id,
            rating: rating,
            author_name: authorForAlert,
            text: `[PRIVATE FEEDBACK] ${content || "No details provided."}${staffSuffix}${phoneSuffix}`,
            urgency_score: rating <= 2 ? 8 : 4,
            customer_email: customer_email || null,
            customer_phone: customer_phone || null,
        }).catch((err) => logger.error({ err: err }, "Failed to send private feedback alert:"));

        if (customer_email && businessName) {
            sendEmail({
                to: customer_email,
                subject: `We're sorry about your experience at ${businessName}`,
                html: recoveryEmailTemplate({
                    businessName,
                    customerName: customerName || undefined,
                }),
            }).catch((err) => logger.error({ err: err }, "Failed to send automated recovery email:"));
        }

        return NextResponse.json({ success: true, feedback });
    } catch (error: unknown) {
        logger.error({ err: error }, "Private Feedback API Error:");
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
