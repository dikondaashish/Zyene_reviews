import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { digitsOnly } from "@/lib/customers/search-match";

export type ReviewRequestContact = {
    customer_phone: string | null;
    customer_email: string | null;
};

function normEmail(e: string | null | undefined): string {
    return (e ?? "").trim().toLowerCase();
}

/** True if customer contact matches a review request row (same person). */
export function requestMatchesCustomer(
    c: { email: string | null; phone: string | null },
    rr: ReviewRequestContact
): boolean {
    const ce = normEmail(c.email);
    const re = normEmail(rr.customer_email);
    if (ce && re && ce === re) return true;

    const cp = digitsOnly(c.phone ?? "");
    const rp = digitsOnly(rr.customer_phone ?? "");
    if (!cp || !rp) return false;
    if (cp === rp) return true;
    const tail = (d: string) => (d.length > 10 ? d.slice(-10) : d);
    return tail(cp) === tail(rp);
}

export function customerHasLinkedReviewFromRows(
    c: { email: string | null; phone: string | null },
    leftRows: ReviewRequestContact[]
): boolean {
    return leftRows.some((rr) => requestMatchesCustomer(c, rr));
}

export async function fetchReviewLeftRows(
    supabase: SupabaseClient<Database>,
    businessId: string
): Promise<ReviewRequestContact[]> {
    const { data, error } = await supabase
        .from("review_requests")
        .select("customer_phone, customer_email")
        .eq("business_id", businessId)
        .eq("review_left", true);

    if (error) throw error;
    return data ?? [];
}

export async function enrichCustomersWithReviewLinkage<
    T extends { id: string; email: string | null; phone: string | null },
>(supabase: SupabaseClient<Database>, businessId: string, customers: T[]): Promise<Array<T & { has_linked_review: boolean }>> {
    if (customers.length === 0) return [];
    const leftRows = await fetchReviewLeftRows(supabase, businessId);
    return customers.map((c) => ({
        ...c,
        has_linked_review: customerHasLinkedReviewFromRows(c, leftRows),
    }));
}
