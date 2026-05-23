export const MAX_STACK = 15;

export interface SpotlightReview {
    id: number | string;
    name: string;
    avatar: string;
    text: string;
    rating: number;
    reviewedAt?: string | null;
    platform?: string | null;
    sentiment?: string | null;
}

export type ThemeColor = "default" | "primary" | "elegant" | "vibrant" | "minimal";

export interface SpotlightLabels {
    hint: string;
    prev: string;
    next: string;
    viewInReviews: string;
}

export interface AnimatedReviewCardsProps {
    reviews?: SpotlightReview[];
    interactionType?: "drag" | "click";
    animationDuration?: number;
    scaleStep?: number;
    verticalSpacing?: number;
    horizontalSpacing?: number;
    autoRotate?: boolean;
    rotateInterval?: number;
    theme?: ThemeColor;
    showBorderBeam?: boolean;
    labels?: SpotlightLabels;
    /** When set, wraps the carousel in a dashboard-style panel with title, subtitle, and top-right arrows + counter. */
    shellTitle?: string;
    shellSubtitle?: string;
    manageAllHref?: string;
    manageAllLabel?: string;
    classNames?: {
        container?: string;
        card?: string;
        cardContent?: string;
        header?: string;
        avatar?: string;
        name?: string;
        text?: string;
        rating?: string;
        star?: string;
        activeStarColor?: string;
        inactiveStarColor?: string;
    };
}
