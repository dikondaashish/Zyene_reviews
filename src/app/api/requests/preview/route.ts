import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getReviewCaptureOrigin } from "@/config/env";
import { checkLimit } from "@/lib/stripe/check-limits";
import { dashboardRequestSms } from "@/lib/review-requests/dashboard-request-message";
import { reviewRequestSubject } from "@/lib/email/review-request-subject";
import { reviewRequestEmailPlainText } from "@/services/resend/templates/review-request-email";

const schema = z.object({ businessId: z.string().uuid(), customerName: z.string().max(200).optional() });
export async function POST(request: Request) {
    try {
        const db = await createClient();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const input = schema.safeParse(await request.json().catch(() => null));
        if (!input.success) return NextResponse.json({ error: "Invalid preview input" }, { status: 400 });
        if (!await userCanAccessBusiness(db, user.id, input.data.businessId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const { data: business, error } = await db.from("businesses").select("name, slug, sender_name, organization_id, timezone")
            .eq("id", input.data.businessId).single();
        if (error || !business?.slug) return NextResponse.json({ error: "Set a public collection link in Business Settings first." }, { status: 400 });
        const [sms, email] = await Promise.all([checkLimit(business.organization_id, "sms_requests"), checkLimit(business.organization_id, "email_requests")]);
        const name = input.data.customerName?.trim() || "there";
        const businessName = business.name || "us";
        const reviewLink = `${getReviewCaptureOrigin()}/${encodeURIComponent(business.slug)}?ref=[request-id]`;
        return NextResponse.json({ businessName, timezone: business.timezone || "UTC",
            sms: dashboardRequestSms(name, businessName, reviewLink),
            email: reviewRequestEmailPlainText({ customerName: name, businessName, reviewLink, senderName: business.sender_name || undefined }),
            subject: reviewRequestSubject(businessName), remainingSms: sms.max === -1 ? null : sms.remaining,
            remainingEmail: email.max === -1 ? null : email.remaining });
    } catch {
        return NextResponse.json({ error: "Could not prepare the preview. Try again." }, { status: 503 });
    }
}
