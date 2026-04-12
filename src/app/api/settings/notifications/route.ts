import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
    business_id: z.string().uuid(),
    sms_enabled: z.boolean(),
    email_enabled: z.boolean(),
    digest_enabled: z.boolean(),
    /** Form field name; stored as sms_phone_number */
    phone_number: z.string().max(32).optional().nullable(),
    min_urgency_score: z
        .union([z.number().int().min(1).max(10), z.null()])
        .optional()
        .transform((n) => (typeof n === "number" && Number.isFinite(n) ? n : 7)),
    quiet_hours_start: z.string().max(5).optional().nullable(),
    quiet_hours_end: z.string().max(5).optional().nullable(),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401 });

    const parsed = notificationPreferencesSchema.safeParse(await request.json());
    if (!parsed.success) {
           return apiError(parsed.error.issues[0].message, { status: 400 });
    }
    const body = parsed.data;

    const allowed = await userCanAccessBusiness(supabase, user.id, body.business_id);
    if (!allowed) {
        return apiError("Forbidden", { status: 403 });
    }

    const phone = body.phone_number?.trim() || null;
    const smsPhone = body.sms_enabled && phone ? phone : null;

    const { error } = await supabase.from("notification_preferences").upsert(
        {
            user_id: user.id,
            business_id: body.business_id,
            sms_enabled: body.sms_enabled,
            email_enabled: body.email_enabled,
            digest_enabled: body.digest_enabled,
            sms_phone_number: smsPhone,
            min_urgency_for_sms: body.min_urgency_score,
            quiet_hours_start: body.quiet_hours_start?.trim() || "22:00",
            quiet_hours_end: body.quiet_hours_end?.trim() || "08:00",
        },
        { onConflict: "user_id,business_id" }
    );

    if (error) return apiError("Internal Server Error", { status: 500 });

    if (phone) {
        await supabase.from("users").update({ phone }).eq("id", user.id);
    }

    return apiOk({ saved: true });
}
