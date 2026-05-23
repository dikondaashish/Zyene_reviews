import * as z from "zod";

export const brandingFormSchema = z.object({
    brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
    review_page_background_color: z
        .string()
        .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
});

export type BrandingFormValues = z.infer<typeof brandingFormSchema>;
