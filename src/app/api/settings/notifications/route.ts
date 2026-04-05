import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
    business_id: z.string().uuid(),
    sms_enabled: z.boolean(),
    email_enabled: z.boolean(),
    digest_enabled: z.boolean(),
    min_urgency_score: z.number().int().min(1).max(10).optional(),
    quiet_hours_start: z.string().max(5).optional(),
    quiet_hours_end: z.string().max(5).optional(),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401 });

    const parsed = notificationPreferencesSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError(parsed.error.errors[0].message, { status: 400 });
    }
    const body = parsed.data;

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

    if (error) return apiError("Internal Server Error", { status: 500 });

    return apiOk({ saved: true });
}
