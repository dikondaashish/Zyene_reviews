
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { BusinessInfoForm } from "@/components/settings/business-info-form";
import { ReviewSettingsForm } from "@/components/settings/review-settings-form";

import { getActiveBusinessId } from "@/lib/business-context";

export default async function BusinessInformationPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { business } = await getActiveBusinessId();

    if (!business) {
        return (
            <div className="rounded-lg border bg-white shadow-sm p-8 text-center">
                <h2 className="text-lg font-semibold">No business found</h2>
                <p className="text-sm text-muted-foreground mt-1">Please create a business first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h3 className="text-xl font-semibold tracking-tight">Business Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your business details and review request settings.
                </p>
            </div>

            {/* Business Details */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h4 className="text-sm font-semibold">Business Details</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Core information about your business location and contact.
                    </p>
                </div>
                <div className="px-6 py-5">
                    <BusinessInfoForm business={business} />
                </div>
            </div>

            {/* Review Settings */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h4 className="text-sm font-semibold">Review Request Settings</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Customize how review requests are sent to your customers.
                    </p>
                </div>
                <div className="px-6 py-5">
                    <ReviewSettingsForm business={business} />
                </div>
            </div>
        </div>
    );
}
