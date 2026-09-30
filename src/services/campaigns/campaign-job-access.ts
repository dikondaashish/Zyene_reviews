import { z } from "zod";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

export const campaignJobSchema = z.object({
    campaignId: z.uuid(), businessId: z.uuid(), userId: z.uuid(),
    contact: z.object({ name: z.string().max(200).optional(), phone: z.string().max(50).optional(),
        email: z.email().max(320).optional() }),
});
export type CampaignJobData = z.infer<typeof campaignJobSchema>;
type Admin = ReturnType<typeof createAdminClient>;

/** Signed background jobs still revalidate their initiating actor and tenant. */
export async function loadAuthorizedCampaignJob(admin: Admin, job: CampaignJobData) {
    if (!(await userCanAccessBusiness(admin, job.userId, job.businessId, true))) return null;
    const { data, error } = await admin.from("campaigns")
        .select("*, businesses(name, slug, sender_name, organization_id, review_request_frequency_cap_days)")
        .eq("id", job.campaignId).eq("business_id", job.businessId).single();
    if (error || !data?.businesses || !["active", "processing"].includes(data.status)) return null;
    return data;
}

export async function campaignContactPermission(admin: Admin, job: Pick<CampaignJobData, "businessId" | "contact">, frequencyCapDays: number) {
    if (job.contact.phone) {
        const { data, error } = await admin.from("sms_opt_outs")
            .select("id").eq("phone_number", job.contact.phone).maybeSingle();
        if (error) throw error;
        if (data) return { allowed: false, reason: "Customer opted out of SMS" };
    }
    for (const method of ["phone", "email"] as const) {
        if (!job.contact[method]) continue;
        const { data, error } = await admin.from("customers")
            .select("last_request_sent_at, is_opted_out, tags")
            .eq("business_id", job.businessId).eq(method, job.contact[method]!).maybeSingle();
        if (error) throw error;
        if (data?.is_opted_out || data?.tags?.includes("zyene:test")) return { allowed: false, reason: "Customer opted out" };
        if (frequencyCapDays > 0 && data?.last_request_sent_at && Date.now() - new Date(data.last_request_sent_at).getTime() < frequencyCapDays * 86400000) {
            return { allowed: false, reason: "Review request frequency cap" };
        }
    }
    return { allowed: true, reason: undefined as string | undefined };
}
