import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { categorizePrivateFeedback } from "@/domains/ai/services/AiAnalysisService";
import { sendEmail } from "@/services/resend/send-email";
import { recoveryEmailTemplate } from "@/services/resend/templates/recovery-email";
import { z } from "zod";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

const contactModeSchema = z.enum(["hidden", "optional", "required"]);

const privateFeedbackSchema = z
    .object({
        review_request_id: z.string().uuid().optional().nullable(),
        business_id: z.string().uuid().optional().nullable(),
        rating: z.number().int().min(1).max(5),
        content: z.string().max(5000).optional().default(""),
        customer_email: z.string().max(255).optional().nullable(),
        customer_phone: z.string().max(32).optional().nullable(),
        selected_staff: z.array(z.string()).optional().nullable(),
    })
    .refine(
        (data) => Boolean(data.review_request_id || data.business_id),
        { message: "Either review_request_id or business_id is required" }
    );

function normalizeContactMode(value: unknown, fallback: "hidden" | "optional" | "required") {
    const p = contactModeSchema.safeParse(value);
    return p.success ? p.data : fallback;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidPhoneDigits(p: string) {
    const digits = p.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 && /^[\d+][\d\s().-]{6,31}$/.test(p.trim());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("📩 Received private feedback request:", { ...body, customer_email: body.customer_email ? "[set]" : null });
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
        const org = (bizPlanRow as any)?.organizations ?? null;
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
            console.log("🤖 Categorizing private feedback...");
            category = await categorizePrivateFeedback(content);
            console.log("🏷️ Category assigned:", category);
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
        console.log("💾 Feedback saved to database. ID:", feedback?.id);

        if (error) {
            console.error("Failed to insert private feedback:", error);
            throw error;
        }

        const authorForAlert = customer_email || customer_phone || "Anonymous Customer";
        const staffSuffix =
            selected_staff && selected_staff.length > 0 ? ` (Served by: ${selected_staff.join(", ")})` : "";
        const phoneSuffix = customer_phone ? ` Phone: ${customer_phone}` : "";

        console.log("🔔 Triggering review alert notification...");
        sendReviewAlert({
            id: feedback.id,
            business_id: business_id,
            rating: rating,
            author_name: authorForAlert,
            text: `[PRIVATE FEEDBACK] ${content || "No details provided."}${staffSuffix}${phoneSuffix}`,
            urgency_score: rating <= 2 ? 8 : 4,
            customer_email: customer_email || null,
            customer_phone: customer_phone || null,
        }).catch((err) => console.error("Failed to send private feedback alert:", err));

        if (customer_email && businessName) {
            console.log(`✉️ Sending apology email to customer: ${customer_email}`);
            sendEmail({
                to: customer_email,
                subject: `We're sorry about your experience at ${businessName}`,
                html: recoveryEmailTemplate({
                    businessName,
                    customerName: customerName || undefined,
                }),
            }).catch((err) => console.error("Failed to send automated recovery email:", err));
        }

        return NextResponse.json({ success: true, feedback });
    } catch (error: unknown) {
        console.error("Private Feedback API Error:", error);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
