"use client";

import dynamic from "next/dynamic";
import { PanelLoading } from "@/components/dashboard/panel-loading";
import { CustomerPortalLoading } from "@/components/dashboard/customer-portal-loading";
import type { CustomerPortalCardProps } from "@/components/dashboard/customer-portal-card-types";

const CustomerPortalCard = dynamic(
    () => import("@/components/dashboard/customer-portal-card").then((m) => m.CustomerPortalCard),
    { ssr: false, loading: CustomerPortalLoading }
);

const AnimatedReviewCards = dynamic(
    () => import("@/components/ui/animated-review-card").then((m) => m.AnimatedReviewCards),
    { ssr: false, loading: () => <PanelLoading label="recent reviews" className="h-[360px] rounded-2xl border border-border bg-card" /> }
);

export function DashboardQrCodeLazy(props: CustomerPortalCardProps) {
    return <DashboardCustomerPortalCard {...props} />;
}

export function DashboardCustomerPortalCard(props: CustomerPortalCardProps) {
    return <CustomerPortalCard {...props} />;
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
    reviewsHref = "/reviews",
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
    reviewsHref?: string;
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
            reviewsHref={reviewsHref}
        />
    );
}
