
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";

import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { RestartTourSection } from "@/components/settings/restart-tour-section";

import { getActiveBusinessId } from "@/lib/auth/business-context";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";

export default async function GeneralSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { organization } = await getActiveBusinessId({ skipCache: true });

    let canEditOrganizationName = false;
    if (organization?.id) {
        const { data: orgMembership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organization.id)
            .maybeSingle();
        canEditOrganizationName = isOrganizationOwnerRole(orgMembership?.role);
    }

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
            <GeneralSettingsForm
                user={user}
                organization={
                    organization ?
                        ({
                            ...organization,
                            name: organization.name || "Your Organization",
                        } as any)
                    :   null
                }
                canEditOrganizationName={canEditOrganizationName}
            />

            {/* Product Tour */}
            <RestartTourSection />

            {/* Danger Zone */}
            <DeleteAccountSection />
        </div>
    );
}
