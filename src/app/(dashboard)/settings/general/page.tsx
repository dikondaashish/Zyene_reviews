
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

import { getActiveBusinessId } from "@/lib/business-context";

export default async function GeneralSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { organization } = await getActiveBusinessId();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h3 className="text-xl font-semibold tracking-tight">General</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your personal profile and organization settings.
                </p>
            </div>

            {/* Combined Profile & Organization Settings Form */}
            <GeneralSettingsForm user={user} organization={organization} />

            {/* Danger Zone */}
            <DeleteAccountSection />
        </div>
    );
}
