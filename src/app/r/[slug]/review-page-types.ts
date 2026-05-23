export type ReviewPageBusiness = {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    logo_url: string | null;
    brand_color: string | null;
    review_page_background_color: string | null;
    min_stars_for_google: number | null;
    welcome_message: string | null;
    apology_message: string | null;
    rating_subtitle: string | null;
    tags_heading: string | null;
    tags_subheading: string | null;
    custom_tags: string[] | null;
    google_heading: string | null;
    google_subheading: string | null;
    google_button_text: string | null;
    google_review_url: string | null;
    negative_subheading: string | null;
    negative_textarea_placeholder: string | null;
    negative_button_text: string | null;
    private_feedback_email_mode: string | null;
    private_feedback_phone_mode: string | null;
    private_feedback_offer_mode: string | null;
    private_feedback_offer_message: string | null;
    thank_you_heading: string | null;
    thank_you_message: string | null;
    footer_text: string | null;
    footer_company_name: string | null;
    footer_link: string | null;
    footer_logo_url: string | null;
    hide_branding: boolean | null;
    enable_staff_selection: boolean | null;
    staff_names: string[] | null;
    rating_style: string | null;
    organization: { plan?: string | null; plan_status?: string | null } | null;
};

export type ReviewPageData =
    | { kind: "not-found" }
    | { kind: "subscription"; businessName: string }
    | { kind: "platform"; businessName: string }
    | {
          kind: "ok";
          business: ReviewPageBusiness;
          googleUrl: string | undefined;
          requestId: string | undefined;
          reviewPageBackgroundColor: string | undefined;
          ratingStyle: "stars" | "number" | "slider" | "radio" | "emoji";
      };
