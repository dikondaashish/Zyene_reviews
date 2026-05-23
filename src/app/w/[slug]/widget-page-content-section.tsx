import { ReviewCarousel } from "@/components/widgets/review-carousel";
import { ReviewBadge } from "@/components/widgets/review-badge";
import { WidgetPlgFooter } from "@/components/widgets/widget-plg-footer";
import type { WidgetPageData } from "./load-widget-page-data";

type WidgetPageContentSectionProps = Extract<WidgetPageData, { kind: "ok" }>;

export function WidgetPageContentSection({
    businessName,
    hideBranding,
    widgetType,
    reviewCount,
    averageRating,
    formattedReviews,
}: WidgetPageContentSectionProps) {
    return (
        <div className="w-full h-full min-h-25 bg-background overflow-hidden m-0 p-0 flex flex-col">
            <div className="flex-1 min-h-0">
                {widgetType === "badge" ? (
                    <ReviewBadge
                        businessName={businessName}
                        avgRating={averageRating}
                        totalReviews={reviewCount}
                    />
                ) : (
                    <ReviewCarousel reviews={formattedReviews} businessName={businessName} />
                )}
            </div>
            {!hideBranding && <WidgetPlgFooter />}
        </div>
    );
}
