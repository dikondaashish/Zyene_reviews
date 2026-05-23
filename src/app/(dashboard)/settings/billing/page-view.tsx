import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/settings/billing-client";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { loadBillingPageData } from "./load-billing-page-data";

export default async function BillingPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const data = await loadBillingPageData(user.id);

    if (data.kind === "member-error") {
        return (
            <DashboardFetchError
                message="We could not load billing membership details. Check your connection and try again."
                retryHref="/settings/billing"
            />
        );
    }

    if (data.kind === "no-org") {
        return (
            <div className="p-4">
                No organization found. Please contact support.
            </div>
        );
    }

    if (data.kind === "org-refresh-error") {
        return (
            <DashboardFetchError
                message="We could not load current billing details. Check your connection and try again."
                retryHref="/settings/billing"
            />
        );
    }

    return <BillingClient {...data.clientProps} />;
}
