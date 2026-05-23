import * as z from "zod";

export const contentSchema = z.object({
    rating_subtitle: z.string().max(500).optional(),
    tags_heading: z.string().max(500).optional(),
    tags_subheading: z.string().max(500).optional(),
    enable_staff_selection: z.boolean().optional(),
    staff_names: z.string().optional(),
    google_heading: z.string().max(500).optional(),
    google_subheading: z.string().max(500).optional(),
    google_button_text: z.string().max(200).optional(),
    negative_subheading: z.string().max(500).optional(),
    negative_textarea_placeholder: z.string().max(500).optional(),
    negative_button_text: z.string().max(200).optional(),
    private_feedback_email_mode: z.enum(["hidden", "optional", "required"]),
    private_feedback_phone_mode: z.enum(["hidden", "optional", "required"]),
    private_feedback_offer_mode: z.enum(["hidden", "visible"]),
    private_feedback_offer_message: z.string().max(500).optional(),
    thank_you_heading: z.string().max(200).optional(),
    thank_you_message: z.string().max(5000).optional(),
    footer_text: z.string().max(200).optional(),
    footer_company_name: z.string().max(200).optional(),
    footer_link: z
        .string()
        .max(2048)
        .optional()
        .refine(
            (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
            { message: "Use a full URL starting with http:// or https://" }
        ),
    footer_logo_url: z.string().max(1000).optional(),
    hide_branding: z.boolean().optional(),
    welcome_message: z.string().max(500).optional(),
    apology_message: z.string().max(500).optional(),
    min_stars_for_google: z.number().min(1).max(5).optional(),
    google_review_url: z
        .string()
        .max(2048)
        .optional()
        .refine(
            (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
            { message: "Use a full URL starting with http:// or https://" }
        ),
    rating_style: z.enum(["emoji", "stars", "number", "slider", "radio"]).optional(),
});

export type ContentFormValues = z.infer<typeof contentSchema>;
