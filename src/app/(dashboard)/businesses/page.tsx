import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Star,
    Plus,
    CheckCircle2,
    AlertCircle,
    Lock,
} from "lucide-react";
import { getActiveBusinessId, setActiveBusiness } from "@/lib/auth/business-context";
import { DeleteBusinessButton } from "@/components/businesses/delete-business-button";

export default async function BusinessesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get all businesses from context helper
    const { businesses, organization, businessId: activeBusinessId } = await getActiveBusinessId();

    // Check plan limits for "Add a business" button
    const maxLocations = organization?.max_businesses || 1; // Default: Starter = 1
    const atLimit = businesses.length >= maxLocations;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Businesses
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your business locations and integrations.
                    </p>
                </div>
                <Link href={atLimit ? "/settings/billing?status=limit_reached" : "/businesses/add"}>
                    <Button className="gap-2" variant={atLimit ? "outline" : "default"}>
                        {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        Add a business
                        {atLimit && <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20">Upgrade</Badge>}
                    </Button>
                </Link>
            </div>

            {/* Business Cards */}
            {businesses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business: any) => {
                        const googlePlatform = business.review_platforms?.find(
                            (p: any) => p.platform === "google"
                        );
                        const isConnected = !!googlePlatform;
                        const rating = business.average_rating || null;
                        const isActive = business.id === activeBusinessId;

                        return (
                            <div
                                key={business.id}
                                className={`group relative border rounded-xl bg-card overflow-hidden transition-all duration-300 cursor-pointer ${
                                    isActive
                                        ? "ring-2 ring-primary border-primary/40 shadow-sm"
                                        : "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                                    }`}
                            >
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <form
                                    action={async () => {
                                        "use server";
                                        await setActiveBusiness(business.id);
                                        redirect("/dashboard");
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="relative z-10 w-full text-left p-5 flex flex-col gap-3 transition-colors duration-300 hover:bg-primary/5 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isActive ? "bg-primary/15" : "bg-primary/10"
                                                    }`}>
                                                    <Building2 className={`h-5 w-5 ${isActive ? "text-primary" : "text-primary"
                                                        }`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm">
                                                        {business.name}
                                                    </h3>
                                                    {business.category && (
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {business.category}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    variant={
                                                        business.status === "active"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {business.status}
                                                </Badge>
                                                {isActive && (
                                                    <span className="text-[10px] text-primary font-medium">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        {rating && (
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-medium">{Number(rating).toFixed(1)}</span>
                                                {business.total_reviews > 0 && (
                                                    <span className="text-muted-foreground">
                                                        ({business.total_reviews} reviews)
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Google Connection Status */}
                                        <div className="flex items-center gap-2 text-xs pt-1 border-t mt-1">
                                            {isConnected ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                    <span className="text-green-700 dark:text-green-400">Google Business Profile connected</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                    <span className="text-amber-700 dark:text-amber-400">Google not connected</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </form>
                                <div className="relative z-10 flex items-center justify-between border-t bg-muted/50 px-4 py-2 transition-colors duration-300 group-hover:bg-primary/5">
                                    <span className="text-[11px] text-muted-foreground">Click card to switch active business</span>
                                    <DeleteBusinessButton
                                        businessId={business.id}
                                        businessName={business.name}
                                        disabled={businesses.length <= 1}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
                    <div className="h-12 w-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                        No businesses yet
                    </h3>
                    <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                        Add your first business to start managing reviews and
                        growing your online reputation.
                    </p>
                    <Link href="/businesses/add">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add a business
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
