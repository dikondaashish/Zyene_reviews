import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { BusinessesEmptyState } from "./businesses-empty-state";
import { setActiveBusiness } from "@/lib/auth/business-context";
import { DeleteBusinessButton } from "@/components/businesses/delete-business-button";
import { emptyVisibleReviewRollup, type VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";

type BusinessCard = {
    id: string;
    name?: string | null;
    category?: string | null;
    status?: string | null;
    review_platforms?: Array<{ platform?: string }>;
};

export function BusinessesCardsSection({
    businesses,
    activeBusinessId,
    visibleReviewStats,
}: {
    businesses: BusinessCard[];
    activeBusinessId: string | null | undefined;
    visibleReviewStats: Map<string, VisibleReviewRollup>;
}) {
    if (businesses.length === 0) {
        return <BusinessesEmptyState />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => {
                const googlePlatform = business.review_platforms?.find((p) => p.platform === "google");
                const isConnected = !!googlePlatform;
                const cardStats = visibleReviewStats.get(business.id) ?? emptyVisibleReviewRollup();
                const rating = cardStats.totalVisible > 0 ? cardStats.averageRatingVisible : null;
                const totalReviews = cardStats.totalVisible;
                const isActive = business.id === activeBusinessId;

                return (
                    <div
                        key={business.id}
                        className={`group relative border rounded-xl bg-card overflow-hidden transition-all duration-300 cursor-pointer ${
                            isActive
                                ? "ring-2 ring-primary border-primary/40 shadow-sm"
                                : "hover:-translate-y-0.5 hover:border-canvas-elevated/60 hover:shadow-lg"
                        }`}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-canvas-elevated/35 via-canvas-elevated/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <form
                            action={async () => {
                                "use server";
                                await setActiveBusiness(business.id);
                                redirect("/dashboard");
                            }}
                        >
                            <button
                                type="submit"
                                className="relative z-10 w-full text-left p-5 flex flex-col gap-3 transition-colors duration-300 hover:bg-canvas-elevated/10 cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                isActive ? "bg-primary/15" : "bg-primary/10"
                                            }`}
                                        >
                                            <Building2
                                                className={`h-5 w-5 ${isActive ? "text-primary" : "text-primary"}`}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{business.name}</h3>
                                            {business.category && (
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {business.category}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {isActive && (
                                            <Badge
                                                variant="default"
                                                className="text-xs font-medium"
                                                title="This location is selected in Zyene (header switcher uses it for dashboard, reviews, etc.)"
                                            >
                                                Current
                                            </Badge>
                                        )}
                                        {business.status &&
                                            String(business.status).toLowerCase() !== "active" && (
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {business.status}
                                                </Badge>
                                            )}
                                    </div>
                                </div>

                                {rating != null && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Star className="h-4 w-4 text-chart-4 fill-chart-4" />
                                        <span className="font-medium">{Number(rating).toFixed(1)}</span>
                                        {totalReviews > 0 && (
                                            <span className="text-muted-foreground">({totalReviews} reviews)</span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-xs pt-1 border-t mt-1">
                                    {isConnected ? (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />
                                            <span className="text-chart-2 dark:text-chart-2">
                                                Google Business Profile connected
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-3.5 w-3.5 text-chart-4" />
                                            <span className="text-chart-4 dark:text-chart-4">Google not connected</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                        <div className="relative z-10 flex items-center justify-between border-t bg-muted/50 px-4 py-2 transition-colors duration-300 group-hover:bg-canvas-elevated/10">
                            <span className="text-[11px] text-muted-foreground">
                                Click card to set as current location
                            </span>
                            <DeleteBusinessButton
                                businessId={business.id}
                                businessName={business.name ?? "Business"}
                                disabled={businesses.length <= 1}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
