
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { BusinessInfoForm } from "@/components/settings/business-info-form";
import { ReviewSettingsForm } from "@/components/settings/review-settings-form";

import { Separator } from "@/components/ui/separator";
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
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">No business found</h2>
                <p className="text-muted-foreground">Please create a business first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Business Information</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your business details and review request settings.
                </p>
            </div>
            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Business Details</h4>
                <BusinessInfoForm business={business} />
            </div>

            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Review Request Settings</h4>
                <ReviewSettingsForm business={business} />
            </div>
        </div>
    );
}
