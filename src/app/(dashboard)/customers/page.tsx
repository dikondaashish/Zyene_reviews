import { getActiveBusinessId } from "@/lib/auth/business-context";
import { createClient } from "@/lib/db/supabase/server";
import { CustomerManagement } from "@/components/customers/customer-management";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { UsersRound } from "lucide-react";
import { enrichCustomersWithReviewLinkage } from "@/lib/customers/review-linkage";

export default async function CustomersPage() {
    const { businessId, businesses } = await getActiveBusinessId();

    if (!businessId || businesses.length === 0) {
        return (
            <BusinessContextEmptyState
                icon={UsersRound}
                title="Add a business to manage customers"
                description="Customer lists and imports are scoped to a business location. Create one to get started, or open an existing business from the header."
            />
        );
    }

    const supabase = await createClient();
    
    // Fetch initial customers for the active business
    const { data: rawCustomers, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5000);

    if (error) {
        console.error("Error fetching initial customers:", error);
        return (
            <div className="max-w-[1200px] mx-auto py-10 px-6">
                <DashboardFetchError
                    message="We couldn&apos;t load customers for this business. Check your connection and try again."
                    retryHref="/customers"
                />
            </div>
        );
    }

    const initialCustomers = await enrichCustomersWithReviewLinkage(supabase, businessId, rawCustomers || []);

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-6">
            <CustomerManagement businessId={businessId as string} initialCustomers={initialCustomers} />
        </div>
    );
}
