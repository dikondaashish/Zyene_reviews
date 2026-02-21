import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    MapPin,
    Star,
    Plus,
    CheckCircle2,
    AlertCircle,
    Globe,
} from "lucide-react";

export default async function BusinessesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get user's organization and all businesses
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                id,
                name,
                businesses (
                    *,
                    review_platforms (
                        platform,
                        sync_status,
                        external_url
                    )
                )
            )
        `)
        .eq("user_id", user.id)
        .single();

    // @ts-ignore
    const organization = memberData?.organizations;
    // @ts-ignore
    const businesses: any[] = organization?.businesses || [];

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
                <Link href="/businesses/add">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add a business
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

                        return (
                            <div
                                key={business.id}
                                className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow flex flex-col gap-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-blue-600" />
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
                                            <span className="text-green-700">Google Business Profile connected</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="text-amber-700">Google not connected</span>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-2">
                                    <Link href="/dashboard" className="flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                        >
                                            View Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/settings" className="flex-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs"
                                        >
                                            Settings
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-gray-50/50 border-dashed">
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
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
