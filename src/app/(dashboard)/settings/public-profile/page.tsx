import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { PublicProfileEditor } from "@/components/settings/public-profile-editor";

export default async function PublicProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

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
                <h3 className="text-lg font-medium">Public Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Customize your public review page appearance and settings.
                </p>
            </div>
            <Separator />

            <PublicProfileEditor business={business} initialSlug={business.slug} />
        </div>
    );
}
