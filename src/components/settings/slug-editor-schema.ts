import * as z from "zod";

export const slugSchema = z.object({
    slug: z
        .string()
        .min(3, { message: "Slug must be at least 3 characters." })
        .regex(/^[a-z0-9-]+$/, { message: "Only lowercase letters, numbers, and hyphens." }),
});

export type SlugFormValues = z.infer<typeof slugSchema>;

export type SlugEditorProps = {
    businessId: string;
    initialSlug: string;
    onSlugChange?: (slug: string) => void;
};
