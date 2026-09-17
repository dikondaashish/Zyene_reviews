import { isTestContact } from "@/lib/customers/test-contact";
import type { createClient } from "@/lib/db/supabase/server";

type AudienceCustomer = {
    id: string; first_name: string | null; last_name: string | null;
    email: string | null; phone: string | null; is_opted_out: boolean | null; tags?: string[] | null;
};

export function selectCampaignAudience(customers: AudienceCustomer[], channel: string) {
    return customers.filter(customer => !customer.is_opted_out && !isTestContact(customer) && (
        channel === "sms" ? customer.phone : channel === "email" ? customer.email : customer.phone || customer.email
    )).map(customer => ({
        customerId: customer.id,
        name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || undefined,
        phone: customer.phone || undefined, email: customer.email || undefined,
    }));
}

export async function loadCampaignAudience(
    supabase: Awaited<ReturnType<typeof createClient>>, businessId: string, customerIds: string[], channel: string,
) {
    const ids = [...new Set(customerIds)];
    const { data, error } = await supabase.from("customers")
        .select("id, first_name, last_name, email, phone, is_opted_out, tags")
        .eq("business_id", businessId).in("id", ids);
    if (error) throw new Error("Could not load the selected audience. Try again.");
    // Never silently send to a different tenant or a partial selection after a context switch.
    if (data.length !== ids.length) throw new Error("Some selected customers are no longer available for this business. Select your audience again.");
    return selectCampaignAudience(data, channel);
}
