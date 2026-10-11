import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { EMAIL_BRAND } from "@/lib/email/email-brand";
import { logger } from "@/lib/logger";

const token = z.uuid();
const htmlResponse = (body: string) => new NextResponse(body, { headers: {
    "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store",
} });

/** GET only shows confirmation, so inbox link scanners cannot unsubscribe people. */
export async function GET(request: Request) {
    const id = token.safeParse(new URL(request.url).searchParams.get("id"));
    if (!id.success) return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
    return htmlResponse(emailLayout({
        title: "Stop product tips?", preheader: "Manage your Zyene Reviews product emails.",
        bodyHtml: emailParagraph("Unsubscribe from onboarding tips and promotional follow-ups. Account security, billing, and essential service emails will continue.")
            + `<form method="post"><input type="hidden" name="id" value="${id.data}"><button type="submit" style="padding:12px 20px;background:${EMAIL_BRAND.button};color:${EMAIL_BRAND.buttonText};border:0;border-radius:5px;font-size:19px;line-height:24px;font-weight:700;cursor:pointer;">Unsubscribe from product tips</button></form>`,
    }));
}

export async function POST(request: Request) {
    try {
        const form = await request.formData();
        const oneClick = form.get("List-Unsubscribe") === "One-Click";
        const id = token.safeParse(oneClick ? new URL(request.url).searchParams.get("id") : form.get("id"));
        if (!id.success) return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
        const admin = createAdminClient();
        const { data, error } = await admin.from("growth_email_runs").select("recipient_email")
            .eq("id", id.data).in("sequence_key", ["trial_nurture", "onboarding_drip", "winback"]).maybeSingle();
        if (error) throw new Error("Unable to load product email preference");
        if (data) {
            const result = await admin.from("growth_email_runs").update({ status: "canceled" })
                .eq("recipient_email", data.recipient_email).in("sequence_key", ["trial_nurture", "onboarding_drip", "winback"]);
            if (result.error) throw new Error("Unable to save product email preference");
        }
        if (oneClick) return NextResponse.json({ unsubscribed: true });
        return htmlResponse(emailLayout({ title: "You're unsubscribed", preheader: "Your product email preference has been saved.",
            bodyHtml: emailParagraph("You will no longer receive product tips and promotional follow-ups. You will still receive account security, billing, and essential service emails."),
        }));
    } catch (error: unknown) {
        logger.error({ err: error }, "[product-email/unsubscribe] failed");
        return NextResponse.json({ error: "Unable to process unsubscribe request" }, { status: 500 });
    }
}
