import { NextResponse } from "next/server";
import { captureMarketingLead } from "@/lib/phase8/capture-marketing-lead";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";
import { sendEmail } from "@/services/resend/send-email";

export async function POST(request: Request) {
    let body: { email?: string; agencyName?: string; clientCount?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = body.email?.trim();
    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const lead = await captureMarketingLead({
        email,
        source: "agency_dashboard_waitlist",
    });
    if (!lead.ok) {
        return NextResponse.json({ error: lead.error }, { status: 400 });
    }

    try {
        await sendEmail({
            to: PARTNER_CONTACT_EMAIL,
            subject: `[Agency dashboard waitlist] ${body.agencyName?.trim() || email}`,
            html: `<p>Agency dashboard waitlist signup</p>
<ul>
<li>Email: ${email}</li>
<li>Agency: ${body.agencyName?.trim() || "—"}</li>
<li>Clients: ${body.clientCount?.trim() || "—"}</li>
</ul>`,
        });
    } catch (err) {
        console.error("[agency-waitlist] notify failed:", err);
    }

    return NextResponse.json({ ok: true });
}
