import { PublicReviewFlow } from "./review-flow";
import type { ReviewPageData } from "./load-review-page-data";

type ReviewPageFlowSectionProps = Extract<ReviewPageData, { kind: "ok" }>;

export function ReviewPageFlowSection({
    business,
    googleUrl,
    requestId,
    reviewPageBackgroundColor,
    ratingStyle,
}: ReviewPageFlowSectionProps) {
    return (
        <div className="review-page-wrapper">
            <PublicReviewFlow
                businessId={business.id}
                businessName={business.name}
                businessCategory={business.category || "other"}
                requestId={requestId}
                googleUrl={googleUrl}
                logoUrl={business.logo_url ?? undefined}
                brandColor={business.brand_color ?? undefined}
                reviewPageBackgroundColor={reviewPageBackgroundColor}
                minStars={business.min_stars_for_google ?? undefined}
                ratingStyle={ratingStyle}
                welcomeMsg={business.welcome_message ?? undefined}
                apologyMsg={business.apology_message ?? undefined}
                ratingSubtitle={business.rating_subtitle ?? undefined}
                tagsHeading={business.tags_heading ?? undefined}
                tagsSubheading={business.tags_subheading ?? undefined}
                customTags={business.custom_tags ?? undefined}
                googleHeading={business.google_heading ?? undefined}
                googleSubheading={business.google_subheading ?? undefined}
                googleButtonText={business.google_button_text ?? undefined}
                negativeSubheading={business.negative_subheading ?? undefined}
                negativeTextareaPlaceholder={business.negative_textarea_placeholder ?? undefined}
                negativeButtonText={business.negative_button_text ?? undefined}
                privateFeedbackEmailMode={
                    business.private_feedback_email_mode === "hidden" ||
                    business.private_feedback_email_mode === "optional" ||
                    business.private_feedback_email_mode === "required"
                        ? business.private_feedback_email_mode
                        : undefined
                }
                privateFeedbackPhoneMode={
                    business.private_feedback_phone_mode === "hidden" ||
                    business.private_feedback_phone_mode === "optional" ||
                    business.private_feedback_phone_mode === "required"
                        ? business.private_feedback_phone_mode
                        : undefined
                }
                privateFeedbackOfferMode={
                    business.private_feedback_offer_mode === "visible" ? "visible" : undefined
                }
                privateFeedbackOfferMessage={business.private_feedback_offer_message ?? undefined}
                thankYouHeading={business.thank_you_heading ?? undefined}
                thankYouMessage={business.thank_you_message ?? undefined}
                footerText={business.footer_text ?? undefined}
                footerCompanyName={business.footer_company_name ?? undefined}
                footerLink={business.footer_link ?? undefined}
                footerLogoUrl={business.footer_logo_url ?? undefined}
                hideBranding={business.hide_branding ?? undefined}
                enableStaffSelection={business.enable_staff_selection ?? undefined}
                staffNames={(business.staff_names as string[]) ?? undefined}
            />
        </div>
    );
}
