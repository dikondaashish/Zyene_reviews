
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/profile-form";
import { OrganizationNameForm } from "@/components/settings/organization-name-form";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

import { Separator } from "@/components/ui/separator";
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your profile and organization.
                </p>
            </div>
            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Profile</h4>
                <ProfileForm user={user} />
            </div>

            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization</h4>
                {organization && <OrganizationNameForm organization={organization} />}
            </div>

            <Separator />

            <DeleteAccountSection />
        </div>
    );
}
