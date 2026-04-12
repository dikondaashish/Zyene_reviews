export interface ApiErrorResponse {
    error?: string;
    message?: string;
    details?: string;
}

export interface CsvContactRow {
    [column: string]: string | undefined;
}

export interface TrialOrganizationSummary {
    plan?: string | null;
    trial_ends_at?: string | null;
}

export interface AppUserMetadata {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
}

export interface AppUserSummary {
    email?: string | null;
    email_confirmed_at?: string | null;
    user_metadata?: AppUserMetadata;
}

export interface IntegrationPlatformSummary {
    id?: string;
    sync_status?: string | null;
    total_reviews?: number | null;
    average_rating?: number | null;
    last_synced_at?: string | null;
    external_url?: string | null;
    [key: string]: unknown;
}

export interface FacebookPageOption {
    pageId: string;
    pageName: string;
    category?: string;
}

export interface GoogleLocationOption {
    name: string;
    title: string;
    storeCode?: string | null;
}

export interface GoogleAccountOption {
    resourceName: string;
    accountName: string;
    locations: GoogleLocationOption[];
}

export interface GoogleLocationSelectorResponse {
    data?: {
        accounts?: GoogleAccountOption[];
    };
    accounts?: GoogleAccountOption[];
    error?: string;
    details?: string;
}

export interface OnboardingGoogleLocationInfo {
    businessName?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    category?: string | null;
}

export interface OnboardingGoogleInitResult {
    success: boolean;
    error?: string;
    reviewData?: {
        reviewCount?: number;
        averageRating?: number;
    };
    locationInfo?: OnboardingGoogleLocationInfo;
}

export interface ReviewManagementItem {
    id: string;
    [key: string]: unknown;
}

export interface BusinessSettingsRecord {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    timezone?: string | null;
    category?: string | null;
    review_request_delay_minutes?: number | null;
    review_request_min_amount_cents?: number | null;
    review_request_frequency_cap_days?: number | null;
    review_request_sms_enabled?: boolean | null;
    review_request_email_enabled?: boolean | null;
    [key: string]: unknown;
}

export interface OrganizationSettingsRecord {
    id: string;
    name: string;
    plan?: string | null;
    trial_ends_at?: string | null;
    [key: string]: unknown;
}

export interface NotificationPreferenceFormValues {
    sms_enabled?: boolean;
    phone_number?: string | null;
    email_enabled?: boolean;
    digest_enabled?: boolean;
    min_urgency_score?: number;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
}

export interface PublicProfileBusinessRecord {
    id: string;
    name: string;
    slug?: string;
    brand_color?: string | null;
    logo_url?: string | null;
    enable_staff_selection?: boolean;
    staff_names?: string[];
    rating_style?: string | null;
    min_stars_for_google?: number | null;
    welcome_message?: string | null;
    apology_message?: string | null;
    rating_subtitle?: string | null;
    tags_heading?: string | null;
    tags_subheading?: string | null;
    custom_tags?: string[] | null;
    google_heading?: string | null;
    google_subheading?: string | null;
    google_button_text?: string | null;
    google_review_url?: string | null;
    negative_subheading?: string | null;
    negative_textarea_placeholder?: string | null;
    negative_button_text?: string | null;
    private_feedback_email_mode?: string | null;
    private_feedback_phone_mode?: string | null;
    private_feedback_offer_mode?: string | null;
    private_feedback_offer_message?: string | null;
    thank_you_heading?: string | null;
    thank_you_message?: string | null;
    footer_text?: string | null;
    footer_company_name?: string | null;
    footer_link?: string | null;
    footer_logo_url?: string | null;
    hide_branding?: boolean | null;
    category?: string | null;
    [key: string]: unknown;
}

export interface PublicProfilePreviewValues {
    slug?: string;
    brand_color?: string;
    logo_url?: string | null;
    enable_staff_selection?: boolean;
    staff_names?: string[];
    rating_style?: string;
    min_stars_for_google?: number;
    welcome_message?: string;
    apology_message?: string;
    rating_subtitle?: string;
    tags_heading?: string;
    tags_subheading?: string;
    custom_tags?: string[] | null;
    google_heading?: string;
    google_subheading?: string;
    google_button_text?: string;
    google_review_url?: string;
    negative_subheading?: string;
    negative_textarea_placeholder?: string;
    negative_button_text?: string;
    private_feedback_email_mode?: "hidden" | "optional" | "required";
    private_feedback_phone_mode?: "hidden" | "optional" | "required";
    private_feedback_offer_mode?: "hidden" | "visible";
    private_feedback_offer_message?: string;
    thank_you_heading?: string;
    thank_you_message?: string;
    footer_text?: string;
    footer_company_name?: string;
    footer_link?: string;
    footer_logo_url?: string | null;
    hide_branding?: boolean;
}

export interface BusinessUpdatePayload {
    [key: string]: unknown;
}

export type TeamRoleBadgeVariant = "default" | "secondary" | "outline";
