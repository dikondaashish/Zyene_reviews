"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";

const schema = z.object({
    phone: z.string().trim().max(32).optional(),
    smsConsent: z.boolean(),
    accountType: z.enum(["business", "agency"]),
});

export type AboutYouInput = z.infer<typeof schema>;

/** Same defaults email signup seeds (oauth-callback-new-user), so both paths behave alike. */
const PREF_DEFAULTS = {
    email_enabled: true,
    digest_enabled: true,
    email_frequency: "immediately",
    min_urgency_for_sms: 7,
    min_rating_threshold: 1,
    quiet_hours_start: "22:00:00",
    quiet_hours_end: "08:00:00",
} as const;

/**
 * First onboarding screen. Google sign-ups give their mobile number here (required, since the
 * Google button skips the signup form); agreeing to SMS alerts stays optional. Every owner also
 * says whether they run a business or an agency.
 */
export async function saveOnboardingAboutYou(input: AboutYouInput): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const parsed = schema.safeParse(input);
        if (!parsed.success) return { success: false, error: "Check your answers and try again." };
        const { phone, smsConsent, accountType } = parsed.data;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "You are not signed in. Please log in again." };

        const admin = createAdminClient();
        const [{ data: profile }, { data: member }] = await Promise.all([
            admin.from("users").select("phone").eq("id", user.id).maybeSingle(),
            admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle(),
        ]);
        const savedPhone = profile?.phone?.trim() || null;
        const newPhone = phone || null;
        if (!savedPhone && !newPhone) return { success: false, error: "Add your mobile number, including your country code." };
        if (newPhone && !isPlausibleMobileNumber(newPhone)) {
            return { success: false, error: "Check your mobile number. Include your country code, for example +1 555 123 4567." };
        }
        const mobile = newPhone ?? savedPhone;

        const { error: userError } = await admin.from("users")
            .update({ ...(newPhone ? { phone: newPhone } : {}), onboarding_step: 2 } as never).eq("id", user.id);
        if (userError) throw userError;

        if (member?.organization_id && isOrganizationOwnerRole(member.role)) {
            const { error: orgError } = await admin.from("organizations").update({ type: accountType }).eq("id", member.organization_id);
            if (orgError) logger.warn({ err: orgError }, "[onboarding] could not save account type");

            const { data: business } = await admin.from("businesses").select("id")
                .eq("organization_id", member.organization_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
            if (business?.id && mobile) {
                const sms = { sms_enabled: smsConsent, sms_phone_number: smsConsent ? mobile : null };
                const { data: existing } = await admin.from("notification_preferences").select("id")
                    .eq("user_id", user.id).eq("business_id", business.id).maybeSingle();
                const { error: prefError } = existing
                    ? await admin.from("notification_preferences").update(sms).eq("id", existing.id)
                    : await admin.from("notification_preferences").insert({ user_id: user.id, business_id: business.id, ...PREF_DEFAULTS, ...sms });
                if (prefError) logger.warn({ err: prefError }, "[onboarding] could not save SMS alert choice");
            }
        }

        revalidatePath("/onboarding");
        return { success: true };
    } catch (err) {
        logger.error({ err }, "[onboarding] saveOnboardingAboutYou failed");
        return { success: false, error: "We couldn't save that. Please try again." };
    }
}
