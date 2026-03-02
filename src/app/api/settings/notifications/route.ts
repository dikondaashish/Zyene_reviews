import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Upsert preferences
    const { error } = await supabase
        .from("notification_preferences")
        .upsert({
            user_id: user.id,
            business_id: body.business_id,
            sms_enabled: body.sms_enabled,
            email_enabled: body.email_enabled,
            digest_enabled: body.digest_enabled,
            min_urgency_for_sms: body.min_urgency_score ?? 7,
            quiet_hours_start: body.quiet_hours_start || "22:00",
            quiet_hours_end: body.quiet_hours_end || "08:00",
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
