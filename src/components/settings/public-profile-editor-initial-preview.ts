import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
} from "@/lib/utils/review-page-background";
import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";

export function buildInitialPublicProfilePreview(
    business: PublicProfileBusinessRecord,
    initialSlug: string,
): PublicProfilePreviewValues {
    return {
        slug: initialSlug,
        brand_color: business.brand_color || DEFAULT_BRAND_COLOR_HEX,
        review_page_background_color:
            (business.review_page_background_color &&
                /^#([0-9A-F]{3}){1,2}$/i.test(business.review_page_background_color) &&
                business.review_page_background_color) ||
            DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
        logo_url: business.logo_url,
        min_stars_for_google: business.min_stars_for_google || 4,
        rating_style: business.rating_style || "emoji",
        enable_staff_selection: business.enable_staff_selection || false,
        staff_names: business.staff_names || [],
        welcome_message: business.welcome_message ?? undefined,
        apology_message: business.apology_message ?? undefined,
        rating_subtitle: business.rating_subtitle ?? undefined,
        tags_heading: business.tags_heading ?? undefined,
        tags_subheading: business.tags_subheading ?? undefined,
        custom_tags: business.custom_tags,
        google_heading: business.google_heading ?? undefined,
        google_subheading: business.google_subheading ?? undefined,
        google_button_text: business.google_button_text ?? undefined,
        google_review_url: business.google_review_url ?? undefined,
        negative_subheading: business.negative_subheading ?? undefined,
        negative_textarea_placeholder: business.negative_textarea_placeholder ?? undefined,
        negative_button_text: business.negative_button_text ?? undefined,
        private_feedback_email_mode:
            business.private_feedback_email_mode === "hidden" ||
            business.private_feedback_email_mode === "optional" ||
            business.private_feedback_email_mode === "required"
                ? business.private_feedback_email_mode
                : "optional",
        private_feedback_phone_mode:
            business.private_feedback_phone_mode === "hidden" ||
            business.private_feedback_phone_mode === "optional" ||
            business.private_feedback_phone_mode === "required"
                ? business.private_feedback_phone_mode
                : "hidden",
        private_feedback_offer_mode:
            business.private_feedback_offer_mode === "visible" ? "visible" : "hidden",
        private_feedback_offer_message: (business.private_feedback_offer_message as string | null) ?? "",
        thank_you_heading: business.thank_you_heading ?? undefined,
        thank_you_message: business.thank_you_message ?? undefined,
        footer_text: business.footer_text ?? undefined,
        footer_company_name: business.footer_company_name ?? undefined,
        footer_link: business.footer_link ?? undefined,
        footer_logo_url: business.footer_logo_url,
        hide_branding: business.hide_branding ?? false,
    };
}
