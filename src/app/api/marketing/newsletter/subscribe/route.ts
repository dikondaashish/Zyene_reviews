import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";
import { newsletterWelcomeEmail } from "@/services/resend/templates/growth-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    let body: { email?: string; source?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
        .from("marketing_subscribers")
        .select("id, unsubscribed_at")
        .eq("email", email)
        .maybeSingle();

    if (existing?.unsubscribed_at) {
        const { error: reactivateErr } = await admin
            .from("marketing_subscribers")
            .update({
                unsubscribed_at: null,
                subscribed_at: new Date().toISOString(),
                source: body.source ?? "newsletter",
                utm_source: body.utm_source ?? null,
                utm_medium: body.utm_medium ?? null,
                utm_campaign: body.utm_campaign ?? null,
            })
            .eq("id", existing.id);

        if (reactivateErr) {
            console.error("[newsletter] reactivate failed:", reactivateErr);
            return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
        }
    } else if (!existing) {
        const { error: insertErr } = await admin.from("marketing_subscribers").insert({
            email,
            source: body.source ?? "newsletter",
            utm_source: body.utm_source ?? null,
            utm_medium: body.utm_medium ?? null,
            utm_campaign: body.utm_campaign ?? null,
        });

        if (insertErr?.code === "23505") {
            return NextResponse.json({ ok: true, message: "Already subscribed" });
        }
        if (insertErr) {
            console.error("[newsletter] insert failed:", insertErr);
            return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
        }
    }

    const { data: subscriber } = await admin
        .from("marketing_subscribers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    try {
        const unsubscribeUrl = subscriber?.id
            ? `https://zyenereviews.com/newsletter/unsubscribe?id=${subscriber.id}`
            : "https://zyenereviews.com/newsletter/unsubscribe";
        const { subject, html } = newsletterWelcomeEmail({ email, unsubscribeUrl });
        await sendEmail({ to: email, subject, html });
    } catch (err) {
        console.error("[newsletter] welcome email failed:", err);
    }

    return NextResponse.json({ ok: true });
}
