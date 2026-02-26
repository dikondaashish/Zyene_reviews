
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/profile-form";
import { OrganizationNameForm } from "@/components/settings/organization-name-form";
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

            {/* Combined Profile & Organization Section */}
            <div className="rounded-lg border bg-white shadow-sm flex flex-col">
                <div>
                    <div className="border-b px-6 py-4">
                        <h4 className="text-sm font-semibold">Your Profile</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Update your personal information visible to your team.
                        </p>
                    </div>
                    <div className="px-6 py-5">
                        <ProfileForm user={user} />
                    </div>
                </div>

                {organization && (
                    <div className="border-t">
                        <div className="border-b px-6 py-4">
                            <h4 className="text-sm font-semibold">Organization</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                The name shown across your dashboard and team invitations.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <OrganizationNameForm organization={organization} />
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <DeleteAccountSection />
        </div>
    );
}
