import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";
import { loadCustomerDetailPageData } from "./load-customer-detail-page-data";

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ customerId: string }>;
}) {
    const { customerId } = await params;
    const { businessId, business } = await getActiveBusinessId();

    if (!businessId) {
        redirect("/customers");
    }

    const data = await loadCustomerDetailPageData(customerId, businessId);

    if (data.kind === "not-found") {
        redirect("/customers");
    }

    return (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-5 sm:py-6 lg:px-6">
            <CustomerDetailClient
                customer={data.customer}
                businessId={businessId}
                businessSlug={business?.slug ?? undefined}
                businessName={business?.name ?? undefined}
                timeline={data.timeline}
                stats={data.stats}
            />
        </div>
    );
}
