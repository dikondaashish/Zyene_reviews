
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BusinessInfoForm } from "@/components/settings/business-info-form";
import { ReviewSettingsForm } from "@/components/settings/review-settings-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Separator } from "@/components/ui/separator";

export default async function GeneralSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's business
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(`
            organization_id,
            organizations (
                businesses (*)
            )
        `)
        .eq("user_id", user.id)
        .single();

    // @ts-ignore
    const business = memberData?.organizations?.businesses?.[0];

    if (!business) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">No business found</h2>
                <p className="text-muted-foreground">Please create an organization first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your business details and personal profile.
                </p>
            </div>
            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Business Information</h4>
                <BusinessInfoForm business={business} />
            </div>

            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Review Request Settings</h4>
                <ReviewSettingsForm business={business} />
            </div>

            <Separator />

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Profile</h4>
                <ProfileForm user={user} />
            </div>
        </div>
    );
}
