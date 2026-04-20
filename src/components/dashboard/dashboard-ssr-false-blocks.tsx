"use client";

import dynamic from "next/dynamic";

const ReviewTrendChart = dynamic(
    () => import("@/components/dashboard/review-trend-chart").then((m) => m.ReviewTrendChart),
    { ssr: false }
);

const RatingDistributionChart = dynamic(
    () => import("@/components/dashboard/rating-distribution-chart").then((m) => m.RatingDistributionChart),
    { ssr: false }
);

const QRCodeCard = dynamic(
    () => import("@/components/dashboard/qr-code-card").then((m) => m.QRCodeCard),
    { ssr: false }
);

const CustomerPortalCard = dynamic(
    () => import("@/components/dashboard/customer-portal-card").then((m) => m.CustomerPortalCard),
    { ssr: false }
);

const AnimatedReviewCards = dynamic(
    () => import("@/components/ui/animated-review-card").then((m) => m.AnimatedReviewCards),
    { ssr: false }
);

export type TrendDataPoint = { day: string; count: number };
export type RatingDataPoint = { rating: number; count: number };

export function DashboardQrCodeLazy(props: {
    businessId: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl: string | null;
    brandColor: string | null;
}) {
    return <CustomerPortalCard businessSlug={props.businessSlug} businessId={props.businessId} />;
}

export function DashboardReviewTrendChartLazy({ data }: { data: TrendDataPoint[] }) {
    return <ReviewTrendChart data={data} />;
}

export function DashboardRatingDistributionChartLazy({ data }: { data: RatingDataPoint[] }) {
    return <RatingDistributionChart data={data} />;
}

export type SpotlightReviewCard = {
    id: string;
    name: string;
    avatar: string;
    text: string;
    rating: number;
    reviewedAt: string;
    platform: string;
    sentiment: string | null;
};

export function DashboardAnimatedReviewCardsLazy({
    reviews,
    labels,
    shellTitle,
    shellSubtitle,
    manageAllHref,
    manageAllLabel,
}: {
    reviews: SpotlightReviewCard[];
    labels: {
        hint: string;
        prev: string;
        next: string;
        viewInReviews: string;
    };
    shellTitle?: string;
    shellSubtitle?: string;
    manageAllHref?: string;
    manageAllLabel?: string;
}) {
    return (
        <AnimatedReviewCards
            reviews={reviews}
            theme="default"
            interactionType="drag"
            rotateInterval={8000}
            labels={labels}
            shellTitle={shellTitle}
            shellSubtitle={shellSubtitle}
            manageAllHref={manageAllHref}
            manageAllLabel={manageAllLabel}
        />
    );
}
