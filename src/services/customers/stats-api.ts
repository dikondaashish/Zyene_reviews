import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest } from "next/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { dedupeCustomersByIdentity } from "@/lib/customers/dedupe-by-identity";
import {
    computeCustomerManagementMetrics,
    type CustomerSegmentInput,
} from "@/lib/customers/segment-counts";
import { enrichCustomersWithReviewLinkage } from "@/lib/customers/review-linkage";

type CustomerRow = CustomerSegmentInput & { id: string };

export async function handleCustomersStats(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const businessId = request.nextUrl.searchParams.get("businessId");
        if (!businessId) {
            return apiError("Business ID is required", { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403 });
        }

        const { data: customers, error: custErr } = await supabase
            .from("customers")
            .select("id, email, phone, total_requests_sent, created_at, last_request_sent_at, is_opted_out")
            .eq("business_id", businessId);

        if (custErr) throw custErr;

        const enriched = await enrichCustomersWithReviewLinkage(
            supabase,
            businessId,
            (customers ?? []) as CustomerRow[],
        );
        const uniqueCustomers = dedupeCustomersByIdentity(enriched);

        return apiOk(computeCustomerManagementMetrics(uniqueCustomers));
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}
