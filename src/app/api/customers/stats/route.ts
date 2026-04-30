import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest } from "next/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import {
    customerHasLinkedReviewFromRows,
    fetchReviewLeftRows,
    type ReviewRequestContact,
} from "@/lib/customers/review-linkage";

type CustomerRow = {
    id: string;
    email: string | null;
    phone: string | null;
    total_requests_sent: number | null;
    created_at: string;
    last_request_sent_at: string | null;
    is_opted_out: boolean;
};

function isRecent(c: CustomerRow, since: Date): boolean {
    const created = new Date(c.created_at).getTime();
    const lastReq = c.last_request_sent_at ? new Date(c.last_request_sent_at).getTime() : 0;
    return created >= since.getTime() || lastReq >= since.getTime();
}

function computeSegmentCounts(
    customers: CustomerRow[],
    leftRows: ReviewRequestContact[],
    since30: Date
) {
    let never_reviewed = 0;
    let already_reviewed = 0;
    let recent = 0;
    let no_contact = 0;
    let opted_out = 0;

    for (const c of customers) {
        if (c.is_opted_out) opted_out++;
        const hasReq = (c.total_requests_sent ?? 0) > 0;
        const hasReview = customerHasLinkedReviewFromRows(c, leftRows);
        const noInfo = !normPhoneOrEmail(c);

        if (noInfo) no_contact++;
        if (hasReq && !hasReview) never_reviewed++;
        if (hasReview) already_reviewed++;
        if (isRecent(c, since30)) recent++;
    }

    return {
        all: customers.length,
        never_reviewed,
        already_reviewed,
        recent,
        no_contact,
        opted_out,
    };
}

function normPhoneOrEmail(c: { email: string | null; phone: string | null }): boolean {
    const e = (c.email ?? "").trim();
    const p = (c.phone ?? "").trim();
    return Boolean(e) || Boolean(p);
}

export async function GET(request: NextRequest) {
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
        const rows = (customers ?? []) as CustomerRow[];

        const leftRows = await fetchReviewLeftRows(supabase, businessId);

        const since30 = new Date();
        since30.setDate(since30.getDate() - 30);

        const segmentCounts = computeSegmentCounts(rows, leftRows, since30);

        const totalCustomers = rows.length;
        const sumRequests = rows.reduce((acc, c) => acc + (c.total_requests_sent ?? 0), 0);
        const avgRequestsSent = totalCustomers > 0 ? sumRequests / totalCustomers : 0;

        const withRequest = rows.filter((c) => (c.total_requests_sent ?? 0) > 0);
        const withRequestAndReview = withRequest.filter((c) => customerHasLinkedReviewFromRows(c, leftRows));
        const reviewConversionPercent =
            withRequest.length > 0 ? (withRequestAndReview.length / withRequest.length) * 100 : 0;

        const neverReviewedCount = withRequest.filter((c) => !customerHasLinkedReviewFromRows(c, leftRows)).length;

        return apiOk({
            totalCustomers,
            reviewConversionPercent: Math.round(reviewConversionPercent * 10) / 10,
            neverReviewedCount,
            avgRequestsSent: Math.round(avgRequestsSent * 10) / 10,
            segmentCounts,
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}
