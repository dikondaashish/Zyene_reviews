import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { PublicProfileEditor } from "@/components/settings/public-profile-editor";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Globe } from "lucide-react";

export const metadata = {
    title: "Public review page",
    description: "The page customers see when you ask for a review.",
};

export default async function PublicProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context
    const { business } = await getActiveBusinessId();

    if (!business) {
        return (
            <BusinessContextEmptyState
                icon={Globe}
                title="Add a business for a public profile"
                description="Your public review page and slug are tied to a business. Add one to customize branding and links."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="ui-page-title">Public Profile</h1>
                <p className="text-sm text-muted-foreground">
                    Customize your public review page appearance and settings.
                </p>
            </div>
            <Separator />

            <PublicProfileEditor 
                key={business.id}
                business={business as never} 
                initialSlug={business.slug || ""} 
            />
        </div>
    );
}
