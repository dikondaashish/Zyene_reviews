import type { BrandingFormValues } from "@/components/settings/branding-form-schema";

export interface BrandingFormProps {
    business: {
        id: string;
        brand_color?: string | null;
        review_page_background_color?: string | null;
        logo_url?: string | null;
    };
    onValuesChange?: (values: Partial<BrandingFormValues>) => void;
    onLogoChange?: (url: string | null) => void;
}
