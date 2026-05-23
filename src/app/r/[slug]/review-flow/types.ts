export type PrivateFeedbackContactMode = "hidden" | "optional" | "required";
export type PrivateFeedbackOfferMode = "hidden" | "visible";

export type FlowStep = "rating" | "tags" | "generating" | "review" | "thankyou" | "negative";

export const RATINGS = [
    { emoji: "😍", label: "Excellent", value: 5, color: "from-chart-2 to-chart-2" },
    { emoji: "😊", label: "Good", value: 4, color: "from-chart-2 to-chart-2" },
    { emoji: "😐", label: "OK", value: 3, color: "from-chart-4 to-chart-4" },
    { emoji: "😕", label: "Bad", value: 2, color: "from-primary/70 to-primary" },
    { emoji: "😞", label: "Awful", value: 1, color: "from-destructive to-destructive" },
] as const;

export const DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT =
    "We're sorry for the inconvenience. We'd like to make things right with a special offer for you — we'll follow up with the details.";

export interface PublicReviewFlowProps {
    businessId: string;
    businessName: string;
    businessCategory: string;
    requestId?: string;
    googleUrl?: string;
    brandColor?: string;
    /** Outer full-page gradient behind the white card (Brand Identity → page background) */
    reviewPageBackgroundColor?: string | null;
    logoUrl?: string;
    minStars?: number;
    ratingStyle?: string;
    welcomeMsg?: string; // Main Rating Heading
    apologyMsg?: string; // Main Negative Heading
    ratingSubtitle?: string;
    tagsHeading?: string;
    tagsSubheading?: string;
    customTags?: string[];
    googleHeading?: string;
    googleSubheading?: string;
    googleButtonText?: string;
    enableStaffSelection?: boolean;
    staffNames?: string[];
    negativeSubheading?: string; // "Share your feedback directly..."
    negativeTextareaPlaceholder?: string;
    negativeButtonText?: string;
    /** Public negative-feedback step: whether email is collected and if it is optional or required */
    privateFeedbackEmailMode?: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode?: PrivateFeedbackContactMode;
    /** When visible, shows a goodwill / special-offer message above the feedback field */
    privateFeedbackOfferMode?: PrivateFeedbackOfferMode;
    privateFeedbackOfferMessage?: string | null;
    thankYouHeading?: string;
    thankYouMessage?: string;
    footerText?: string;
    footerCompanyName?: string;
    footerLink?: string;
    footerLogoUrl?: string;
    hideBranding?: boolean;
    isPreview?: boolean;
    previewStep?: FlowStep;
    className?: string;
}
