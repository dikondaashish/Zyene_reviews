import { PublicReviewFlow } from "./review-flow";
import { resolveReviewFlowFooterBranding } from "@/lib/brand/review-flow-footer-branding";
import type { PrivateFeedbackContactMode } from "./review-flow/types";
import type { ReviewPageData } from "./load-review-page-data";

type ReviewPageFlowSectionProps = Extract<ReviewPageData, { kind: "ok" }>;
type OkBusiness = ReviewPageFlowSectionProps["business"];

function resolveContactMode(value: unknown): PrivateFeedbackContactMode | undefined {
    return value === "hidden" || value === "optional" || value === "required" ? value : undefined;
}

function resolveOfferMode(value: unknown): "visible" | undefined {
    return value === "visible" ? "visible" : undefined;
}

function buildReviewFlowProps(
    business: OkBusiness,
    extras: Pick<
        ReviewPageFlowSectionProps,
        "googleUrl" | "requestId" | "openToken" | "reviewPageBackgroundColor" | "ratingStyle"
    >,
) {
    const footerBranding = resolveReviewFlowFooterBranding({
        footerLink: business.footer_link ?? undefined,
        footerLogoUrl: business.footer_logo_url ?? undefined,
        footerCompanyName: business.footer_company_name ?? undefined,
    });

    return {
        businessId: business.id,
        businessName: business.name,
        businessCategory: business.category || "other",
        requestId: extras.requestId,
        openToken: extras.openToken,
        googleUrl: extras.googleUrl,
        logoUrl: business.logo_url ?? undefined,
        brandColor: business.brand_color ?? undefined,
        reviewPageBackgroundColor: extras.reviewPageBackgroundColor,
        minStars: business.min_stars_for_google ?? undefined,
        ratingStyle: extras.ratingStyle,
        welcomeMsg: business.welcome_message ?? undefined,
        apologyMsg: business.apology_message ?? undefined,
        ratingSubtitle: business.rating_subtitle ?? undefined,
        tagsHeading: business.tags_heading ?? undefined,
        tagsSubheading: business.tags_subheading ?? undefined,
        customTags: business.custom_tags ?? undefined,
        googleHeading: business.google_heading ?? undefined,
        googleSubheading: business.google_subheading ?? undefined,
        googleButtonText: business.google_button_text ?? undefined,
        negativeSubheading: business.negative_subheading ?? undefined,
        negativeTextareaPlaceholder: business.negative_textarea_placeholder ?? undefined,
        negativeButtonText: business.negative_button_text ?? undefined,
        privateFeedbackEmailMode: resolveContactMode(business.private_feedback_email_mode),
        privateFeedbackPhoneMode: resolveContactMode(business.private_feedback_phone_mode),
        privateFeedbackOfferMode: resolveOfferMode(business.private_feedback_offer_mode),
        privateFeedbackOfferMessage: business.private_feedback_offer_message ?? undefined,
        thankYouHeading: business.thank_you_heading ?? undefined,
        thankYouMessage: business.thank_you_message ?? undefined,
        footerText: business.footer_text ?? undefined,
        footerCompanyName: footerBranding.label,
        footerLink: footerBranding.href,
        footerLogoUrl: footerBranding.logoSrc,
        hideBranding: business.hide_branding ?? undefined,
        enableStaffSelection: business.enable_staff_selection ?? undefined,
        staffNames: (business.staff_names as string[]) ?? undefined,
    };
}

export function ReviewPageFlowSection({
    business,
    googleUrl,
    requestId,
    openToken,
    reviewPageBackgroundColor,
    ratingStyle,
}: ReviewPageFlowSectionProps) {
    const flowProps = buildReviewFlowProps(business, {
        googleUrl,
        requestId,
        openToken,
        reviewPageBackgroundColor,
        ratingStyle,
    });

    return (
        <div className="review-page-wrapper">
            <PublicReviewFlow {...flowProps} />
        </div>
    );
}
