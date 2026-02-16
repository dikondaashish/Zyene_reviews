
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GoogleIntegrationCard } from "@/components/integrations/google-card";
import { PlaceholderCard } from "@/components/integrations/placeholder-card";
import { WebhookCard } from "@/components/integrations/webhook-card";
import { Store, Facebook, Zap, Utensils, CreditCard } from "lucide-react";

// Yelp icon helper since Lucide doesn't have it
function YelpIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-red-600">
            <path d="M20.1 11.8c.6.2 1.3 0 1.5-.7.2-.6 0-1.3-.7-1.5L16 8.3l1.2-4.1c.2-.6-.2-1.3-.8-1.5-.6-.2-1.3.2-1.5.8L13.7 7l-3.3-2.5c-.5-.4-1.2-.3-1.6.2-.4.5-.3 1.2.2 1.6l3.3 2.5-4.1-1.2c-.6-.2-1.3.2-1.5.8-.2.6.2 1.3.8 1.5l4.1 1.2-2.5 3.3c-.4.5-.3 1.2.2 1.6.5.4 1.2.3 1.6-.2l2.5-3.3 1.2 4.1c.2.6.9.9 1.5.7.6-.2.9-.9.7-1.5l-1.2-4.1 3.3 2.5c.5.4 1.2.3 1.6-.2z" />
        </svg>
    )
}

export default async function IntegrationsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's business and review platforms
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(
            `
            organizations (
                businesses (
                    *,
                    review_platforms (*)
                )
            )
        `
        )
        .eq("user_id", user.id)
        .single();

    // @ts-ignore - Supabase types inference
    const business = memberData?.organizations?.businesses?.[0];

    if (!business) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-2">No Business Found</h1>
                <p className="text-muted-foreground">Please create a business to manage integrations.</p>
            </div>
        );
    }

    // @ts-ignore
    const googlePlatform = business?.review_platforms?.find(
        (p: any) => p.platform === "google"
    );

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your review platforms and other tools to sync data automatically.
                </p>
            </div>

            {/* Section 1: Review Platforms */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review Platforms</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <GoogleIntegrationCard platform={googlePlatform} />
                    <PlaceholderCard
                        name="Yelp"
                        description="Sync reviews from your Yelp business page."
                        icon={<YelpIcon />}
                    />
                    <PlaceholderCard
                        name="Facebook"
                        description="Connect your Facebook Page reviews."
                        icon={<Facebook className="h-6 w-6 text-blue-600" />}
                    />
                </div>
            </div>

            {/* Section 2: POS Integrations */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">POS & Tools</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <PlaceholderCard
                        name="Square"
                        description="Trigger requests from Square transactions."
                        icon={<Store className="h-6 w-6" />}
                    />
                    <PlaceholderCard
                        name="Clover"
                        description="Sync with Clover POS."
                        icon={<CreditCard className="h-6 w-6" />}
                    />
                    <PlaceholderCard
                        name="Toast"
                        description="Connect Toast POS."
                        icon={<Utensils className="h-6 w-6" />}
                    />
                    <PlaceholderCard
                        name="Zapier"
                        description="Connect any POS via Zapier."
                        icon={<Zap className="h-6 w-6 text-orange-500" />}
                    />
                </div>
            </div>

            {/* Section 3: Webhook */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Developer API</h2>
                <div className="max-w-2xl">
                    <WebhookCard businessId={business.id} />
                </div>
            </div>
        </div>
    );
}
