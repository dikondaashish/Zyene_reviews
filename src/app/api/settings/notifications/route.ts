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
            sms_enabled: body.sms_enabled,
            phone_number: body.phone_number,
            email_enabled: body.email_enabled,
            digest_enabled: body.digest_enabled,
            min_urgency_score: body.min_urgency_score,
            quiet_hours_start: body.quiet_hours_start || null,
            quiet_hours_end: body.quiet_hours_end || null,
            updated_at: new Date().toISOString()
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
