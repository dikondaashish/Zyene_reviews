import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    buildCustomerTimeline,
    computeDetailStats,
    filterFeedbackForCustomer,
    filterRequestsForCustomer,
} from "@/lib/customers/customer-detail-data";

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ customerId: string }>;
}) {
    const { customerId } = await params;
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        redirect("/customers");
    }

    const supabase = await createClient();

    const { data: customer, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (custErr || !customer) {
        redirect("/customers");
    }

    const { data: reqRows, error: reqErr } = await supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("sent_at", { ascending: false, nullsFirst: false })
        .limit(8000);

    if (reqErr) {
        console.error("[customer detail] review_requests", reqErr);
    }

    const { data: pfRows, error: pfErr } = await supabase
        .from("private_feedback")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5000);

    if (pfErr) {
        console.error("[customer detail] private_feedback", pfErr);
    }

    const matchedRequests = filterRequestsForCustomer(customer, reqRows ?? []);
    const matchedFeedback = filterFeedbackForCustomer(customer, pfRows ?? []);
    const baseTimeline = buildCustomerTimeline(matchedRequests, matchedFeedback);

    const displayFull = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim().toLowerCase();
    const { data: reviewRows } = await supabase
        .from("reviews")
        .select("id, rating, platform, review_date, text, author_name")
        .eq("business_id", businessId)
        .order("review_date", { ascending: false })
        .limit(500);

    const platformTimeline =
        displayFull.length > 0
            ? (reviewRows ?? [])
                  .filter(
                      (r) =>
                          r.author_name &&
                          r.author_name.trim().toLowerCase() === displayFull
                  )
                  .map((r) => ({
                      type: "platform_review" as const,
                      id: r.id,
                      sortAt: r.review_date,
                      rating: r.rating,
                      platform: r.platform,
                      text: r.text,
                  }))
            : [];

    const timeline = [...baseTimeline, ...platformTimeline].sort(
        (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime()
    );
    const stats = computeDetailStats(customer, matchedRequests, matchedFeedback);

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 pb-12 lg:px-6">
            <nav className="mb-6" aria-label="Breadcrumb">
                <Link
                    href="/customers"
                    className={cn(
                        "group inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                        "hover:border-border hover:bg-muted/60 hover:text-foreground"
                    )}
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    Customers
                </Link>
            </nav>

            <CustomerDetailClient
                customer={customer}
                businessId={businessId}
                timeline={timeline}
                stats={stats}
            />
        </div>
    );
}
